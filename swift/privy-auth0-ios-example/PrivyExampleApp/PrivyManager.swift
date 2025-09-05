import Foundation
import BigInt
import PrivySDK

struct BalanceResponse: Decodable {
    let result: String
}

func divideBigInt(_ lhs: BigInt, _ rhs: BigInt) -> Decimal {
    let (quotient, remainder) =  lhs.quotientAndRemainder(dividingBy: rhs)
    return Decimal(string: String(quotient))! + Decimal(string: String(remainder))! / Decimal(string: String(rhs))!
}

class PrivyManager: ObservableObject {
    let authManager: Auth0Manager
    let privy: Privy
    
    @Published var authState = AuthState.unauthenticated
    @Published var embeddedWalletState = EmbeddedWalletState.notCreated
    @Published var lastSign: String?
    @Published var txs: [String] = []
    @Published var lastSignTypeData: String?
    @Published var chain: SupportedChain = SupportedChain.sepolia
    @Published var balance = "0.00"
    @Published var isLoading = false
    @Published var wallets = [Wallet]()
    @Published var selectedWallet: Wallet?
    
    @MainActor
    init(authManager: Auth0Manager) {
        self.authManager = authManager
        self.privy =  Privy(config: PrivyConfig(appId: "your-app-id"))
        configure()
    }
}

extension PrivyManager {
    @MainActor
    func configure() {
        privy.tokenProvider = {
            return try await self.authManager.getCredentials().accessToken
        }
        
        privy.onAuthStateChange = { state in
            print(state)
            self.authState = state
        }
        
        privy.onEmbeddedWalletStateChange = { state in
            self.embeddedWalletState = state
            guard case .connected(_, let wallets) = self.embeddedWalletState else { return }
            self.wallets = wallets
            self.selectedWallet = wallets.first
        }
        
        if (authManager.hasCredentials) {
            Task {
                isLoading.toggle()
                _ = try? await privy.loginWithCustomAccessToken()
                isLoading.toggle()
            }
        }
    }
    
    @MainActor
    func loginWithCustomAccessToken() async throws {
        _ = try await privy.loginWithCustomAccessToken()
    }
    
    @MainActor
    func refreshSession() async throws {
        _ = try await privy.refreshSession()
    }
    
    @MainActor
    func clear() async {
        await authManager.clear()
        privy.logout()
    }
    
    func switchChain(_ newChain: SupportedChain) throws {
        self.chain = newChain
        guard case .connected(let provider, _) = embeddedWalletState else { throw PrivyError.notReady }
        provider.configure(chainId: newChain.id)
        Task { try await getBalance() }
    }
    
    func switchToSepolia() throws {
        try switchChain(SupportedChain.sepolia)
    }
    
    @MainActor
    func createWallet() async throws {
        _ = try await privy.createWallet()
        try switchToSepolia()
    }
    
    @MainActor
    func createAdditionalWallet() async throws {
        guard case .connected(let provider, _) = embeddedWalletState else { throw PrivyError.notReady }
        _ = try await provider.createAdditionalWallet()
    }
    
    @MainActor
    func connectWallet() async throws {
        _ = try await privy.connectWallet()
        selectedWallet = wallets[0]
        try switchToSepolia()
    }
    
    @MainActor
    func recoverWallet(password: String?) async throws {
        _ = try? await privy.recover()
    }
    
    @MainActor
    func sendTransaction(address: String, amount: String) async throws {
        guard case .connected(let provider, _) = embeddedWalletState else { throw PrivyError.notReady }
        guard let wallet = selectedWallet else { throw PrivyWalletError.noWalletAvailable }
        
        do {
            let tx = try JSONEncoder().encode([
                // Value here is in wei (see conversion tool @ https://eth-converter.com/)
                "value": amount,
                "to": address,
                "chainId": Utils.toHexString(provider.chainId),
                "from": wallet.address
            ])
            
            guard let txString = String(data: tx, encoding: .utf8) else {
                throw PrivyError.dataParse
            }
            
            let data = RpcRequest(method: "eth_sendTransaction", params: [txString])
            let response = try await provider.request(data, wallet.address)
            txs.append(response.response.data)
            print(txs)
        } catch {
            print(error)
        }
    }
    
    @MainActor
    func signMessage() async throws {
        guard case .connected(let provider, _) = embeddedWalletState else { throw PrivyError.notReady }
        guard let wallet = selectedWallet else { throw PrivyWalletError.noWalletAvailable }
        
        do {
            let data = RpcRequest(method: "personal_sign", params: ["I am the message", wallet.address])
            let response = try await provider.request(data, wallet.address)
            lastSign = response.response.data
        } catch {
            print(error)
        }
    }
    
    @MainActor
    func getBalance() async throws {
        guard case .authenticated = authState else {
            throw PrivyError.notLoggedIn
        }
        
        guard case .connected(let provider, _) = embeddedWalletState else {
            throw PrivyWalletError.notConnected
        }
        
        guard let wallet = selectedWallet else {
            throw PrivyWalletError.noWalletAvailable
        }
        
        do {
            let data = RpcRequest(method: "eth_getBalance", params: [wallet.address, "latest"])
            let response = try await provider.request(data, wallet.address)
            
            guard let encoded = response.response.data.data(using: .utf8) else {return}
            let responseData = try JSONDecoder().decode(BalanceResponse.self, from: encoded)
            
            guard let bigIntValue = BigInt(responseData.result.dropFirst(2), radix: 16) else {
                self.balance = "0.00"
                return
            }
            
            let ethDivisor = BigInt(1000000000000000000)
            let eth = divideBigInt(bigIntValue, ethDivisor)
            
            let formatter = NumberFormatter()
            formatter.minimumFractionDigits = 4
            formatter.maximumFractionDigits = 8
            
            guard let formatted = formatter.string(from: eth as NSDecimalNumber) else { return }
            self.balance = formatted
        } catch {
            print(error)
        }
    }
    
    @MainActor
    func signTypedData() async throws {
        guard case .connected(let provider, _) = embeddedWalletState else { throw PrivyError.notReady }
        
        do {
            // https://docs.metamask.io/wallet/reference/eth_signtypeddata_v4/
            struct Param: Codable {
                let types: ParamTypes
                let primaryType: String
                let domain: Domain
                let message: Message
            }
            struct ParamTypes: Codable {
                let eIP712Domain: [DomainType]
                let person: [DomainType]
                let mail: [DomainType]
                
                enum CodingKeys: String, CodingKey {
                    case eIP712Domain = "EIP712Domain"
                    case person = "Person"
                    case mail = "Mail"
                }
            }
            struct DomainType: Codable {
                let name: String
                let type: String
            }
            struct Domain: Codable {
                let name: String
                let version: String
                let chainId: Int
                let verifyingContract: String
            }
            struct Message: Codable {
                struct W: Codable {
                    let name: String
                    let wallet: String
                }
                
                let from: W
                let to: W
                let contents: String
            }
            
            let eIP712Domain = [
                DomainType(name: "name", type: "string"),
                DomainType(name: "version", type: "string"),
                DomainType(name: "chainId", type: "uint256"),
                DomainType(name: "verifyingContract", type: "address"),
            ]
            let person = [
                DomainType(name: "name", type: "string"),
                DomainType(name: "wallet", type: "address")
            ]
            let mail = [
                DomainType(name: "from", type: "Person"),
                DomainType(name: "to", type: "Person"),
                DomainType(name: "contents", type: "string"),
            ]
            let types = ParamTypes(eIP712Domain: eIP712Domain, person: person, mail: mail)
            let primaryType = "Mail"
            let domain = Domain(name: "Ether Mail", version: "1", chainId: 1, verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC")
            let to = Message.W(name: "Bob", wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB")
            let from = Message.W(name: "Cow", wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826")
            let contents = "Hello, Bob!"
            let message = Message(from: from, to: to, contents: contents)
            let param = Param(types: types, primaryType: primaryType, domain: domain, message: message)
            let encodedParam = try JSONEncoder().encode(param)
            
            guard let paramJsonString = String(data: encodedParam, encoding: .utf8) else {
                throw PrivyError.dataParse
            }
            
            guard let wallet = selectedWallet else {
                throw PrivyWalletError.noWalletAvailable
            }
            
            let data = RpcRequest(method: "eth_signTypedData_v4", params: [wallet.address, paramJsonString])
            let response = try await provider.request(data, wallet.address)
            lastSignTypeData = response.response.data
        } catch {
            print(error)
        }
    }
}
