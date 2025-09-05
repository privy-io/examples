//
//  WalletView.swift
//  PrivySDKTestApp
//
//  Created by Dalu Udeogu on 2023-12-08.
//

import SwiftUI
import AlertToast
import UniformTypeIdentifiers
import PrivySDK

let amountWeiHex = "0x9184e72a000"
let amountEthString = "0.00001"

struct WalletView: View {
    let authManager: Auth0Manager
    @ObservedObject var privyManager: PrivyManager
    @State private var showToast = false
    
    // Kyle test wallet used to track test transactions
    @State private var addressText = "0x-your-test-address"
    @State private var selectedChain = SupportedChain.sepolia
    @State private var isLogingiIn = false
    @State private var isBalanceLoading = false
    @State private var isCreateLoading = false
    @State private var isRecoveringLoading = false
    @State private var isConnecting = false
    @State private var isSendingTransaction = false
    @State private var isSigningTypedData = false
    @State private var isSigningMessage = false
    @State private var isCreatingAdditional = false
    @State private var isRefreshing = false
    @State private var isLoggingOut = false
    
    var body: some View {
        VStack(spacing: 20) {
            ScrollView(.vertical, showsIndicators: false) {
                Text("EMBEDDED WALLET")
                    .font(.system(size: 24, weight: .bold))
                    .padding(.bottom, 20)
                if privyManager.isLoading {
                    SpinnerView()
                } else if case .authenticated = privyManager.authState {
                    switch privyManager.embeddedWalletState {
                    case .connecting:
                        ConnectingView()
                    case .creating:
                        if privyManager.wallets.isEmpty {
                            CreatingView()
                        } else {
                            connectedView()
                        }
                    case .recovering:
                        RecoveringView()
                    case .disconnected:
                        disconnectedView()
                    case .connected:
                        connectedView()
                    case .notCreated:
                        NotCreatedView()
                    case .needsRecovery:
                        NeedsRecoveryView()
                    case .error:
                        ErrorView()
                    @unknown default:
                        EmptyView()
                    }
                } else {
                    Button {
                        login()
                    } label: {
                        Text("Login")
                    }
                    .buttonStyle(.primary(isLoading: $isLogingiIn))
                }
            }
        }
        .padding(20)
    }
}

extension WalletView {
    @ViewBuilder
    func ConnectingView() -> some View {
        VStack {
            Text("Connecting Wallet")
            logoutView()
        }
    }
    
    @ViewBuilder
    func CreatingView() -> some View {
        VStack {
            Text("Creating Wallet")
            logoutView()
        }
    }
    
    @ViewBuilder
    func RecoveringView() -> some View {
        VStack {
            Text("RecoveringWallet")
            logoutView()
        }
    }
    
    
    @ViewBuilder
    func NotCreatedView() -> some View {
        VStack {
            Button {
                Task {
                    isCreateLoading = true
                    try? await privyManager.createWallet()
                    isCreateLoading = false
                }
            } label: {
                Text("Create Wallet")
            }
            .buttonStyle(.primary)
            logoutView()
        }
    }
    
    @ViewBuilder
    func NeedsRecoveryView() -> some View {
        VStack {
            Button("Recover Wallet") {
                Task {
                    isRecoveringLoading.toggle()
                    try? await privyManager.recoverWallet(password: nil)
                    isRecoveringLoading.toggle()
                }
            }
            .buttonStyle(.primary(isLoading: $isRecoveringLoading))
            logoutView()
        }
    }
    
    @ViewBuilder
    func disconnectedView() -> some View {
        VStack {
            Button("Connect Wallet") {
                Task {
                    isConnecting.toggle()
                    try? await privyManager.connectWallet()
                    isConnecting.toggle()
                }
            }
            .buttonStyle(.primary(isLoading: $isConnecting))
            logoutView()
        }
    }
    
    @ViewBuilder
    func ErrorView() -> some View {
        VStack {
            Button("Connect Wallet") {
                Task {
                    isConnecting.toggle()
                    try? await privyManager.connectWallet()
                    isConnecting.toggle()
                }
            }
            .buttonStyle(.primary(isLoading: $isConnecting))
            logoutView()
        }
    }
    
    @ViewBuilder
    func connectedView() -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack {
                ForEach(SupportedChain.allCases) { chain in
                    RadioButtonItem(
                        chain: chain,
                        selectedNetwork: $selectedChain
                    )
                    .onChange(of: selectedChain) {
                        try? privyManager.switchChain($0)
                    }
                }
            }
        }
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("State: ")
                Text("\(privyManager.embeddedWalletState.toString)").fontWeight(.light)
            }
            
            HStack {
                Text("Chain: ")
                Text(verbatim: "\(privyManager.chain.id) (\(privyManager.chain.name))").fontWeight(.light)
            }
            
            HStack {
                Text("Balance: ")
                Text("\(privyManager.balance) \(privyManager.chain.nativeCurrency.symbol)").fontWeight(.light)
            }
            
            HStack {
                Text("Address: ")
                if let address = privyManager.selectedWallet?.address {
                    Text("0x...\(String(address.suffix(8)))").fontWeight(.light)
                } else {
                    Text("N/A" ).fontWeight(.light)
                }
                
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        
        VStack {
            Button {
                Task {
                    isBalanceLoading = true
                    try? await privyManager.getBalance()
                    isBalanceLoading = false
                }
            } label: {
                Text("Update Balance")
            }
            .buttonStyle(PrimaryButtonStyle(isLoading: $isBalanceLoading))
            .disabled(isBalanceLoading)
            
            Text("TRANSACT")
                .font(.system(size: 24, weight: .bold))
                .padding(.vertical, 15)
            
            Text("FROM address (double tap to copy)")
                .font(.system(size: 16, weight: .bold))
                .padding(.vertical, 10)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    ForEach(privyManager.wallets) { wallet in
                        Button { } label: {
                            Text("0x...\(String(wallet.address.suffix(4)))")
                                .padding()
                                .foregroundColor(.white)
                                .background(privyManager.selectedWallet == wallet ? .green : .gray)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.white))
                        }
                        .simultaneousGesture(TapGesture(count: 1).onEnded { _ in
                            privyManager.selectedWallet = wallet
                            Task { try? await privyManager.getBalance() }
                        })
                        .simultaneousGesture(TapGesture(count: 2).onEnded { _ in
                            showToast.toggle()
                            UIPasteboard.general.string = wallet.address
                        })
                    }
                }
            }
            
            Text("TO address")
                .font(.system(size: 16, weight: .bold))
                .padding(.vertical, 10)
            
            VStack(spacing: 10) {
                TextField(addressText, text: $addressText).textFieldStyle(PrimaryTextFieldStyle())
            }
            
            Button("Send TX (\(amountEthString) \(selectedChain.nativeCurrency.symbol))") {
                Task {
                    isSendingTransaction = true
                    try await privyManager.sendTransaction(address: addressText, amount: amountWeiHex)
                    isSendingTransaction = false
                }
            }
            .buttonStyle(.primary(isLoading: $isSendingTransaction))
            
            ForEach(privyManager.txs, id: \.self) {tx in
                Button(action: {
                    guard let blockExp = privyManager.chain.blockExplorers.default else { return }
                    guard let url = URL(string: "\(blockExp.url)/tx/\(tx)") else { return }
                    UIApplication.shared.open(url)
                }) {
                    Text(tx).foregroundColor(.blue).font(.system(size: 12))
                }
                .padding(.vertical, 5)
            }
            
            VStack {
                Text("SIGN")
                    .font(.system(size: 24, weight: .bold))
                    .padding(.vertical, 20)
                Button("Sign Message") {
                    Task {
                        isSigningMessage = true
                        try? await privyManager.signMessage()
                        isSigningMessage = false
                    }
                }
                .buttonStyle(.primary(isLoading: $isSigningMessage))
                
                if let lastSign = privyManager.lastSign {
                    VStack {
                        Text("Last sig")
                        Text(lastSign).font(.system(size: 10, weight: .light))
                    }.padding(.vertical, 5)
                }
                
                Button("Sign TypedData") {
                    Task {
                        isSigningTypedData = true
                        try? await privyManager.signTypedData()
                        isSigningTypedData = false
                    }
                }
                .buttonStyle(.primary(isLoading: $isSigningTypedData))
                
                if let typedSig = privyManager.lastSignTypeData {
                    VStack {
                        Text("Last typedSig")
                        Text(typedSig).font(.system(size: 10, weight: .light))
                    }.padding(.vertical, 5)
                }
            }
            
            Button("Create Additional Wallet") {
                Task {
                    isCreatingAdditional = true
                    try? await privyManager.createAdditionalWallet()
                    isCreatingAdditional = false
                }
            }
            .buttonStyle(.primary(isLoading: $isCreatingAdditional))
            
            logoutView()
        }.toast(isPresenting: $showToast){
            AlertToast(type: .regular, title: "Address copied to clipboard")
        }
    }
    
    func logoutView() -> some View {
        VStack {
            Button {
                Task {
                    isRefreshing.toggle()
                    try? await privyManager.refreshSession()
                    isRefreshing.toggle()
                }
            } label: {
                Text("Refresh Session")
            }
            .buttonStyle(.primary(isLoading: $isRefreshing))
            Button("Logout") {
                Task {
                    isLoggingOut.toggle()
                    await privyManager.clear()
                    isLoggingOut.toggle()
                }
            }
            .buttonStyle(.primary(isLoading: $isLoggingOut))
        }
    }
}

extension WalletView {
    func login() {
        Task {
            do {
                isLogingiIn.toggle()
                _ = try await authManager.login()
                try await privyManager.loginWithCustomAccessToken()
                isLogingiIn.toggle()
            } catch {
                print("Error, \(error)")
            }
        }
    }
}

#Preview {
    let authManager = Auth0Manager()
    return WalletView(
        authManager: authManager,
        privyManager: PrivyManager(authManager: authManager)
    )
}
