import Foundation
import Auth0

enum Auth0ManagerError: LocalizedError {
    case noCredential
}

struct Auth0Manager {
    private let credentialsManager = CredentialsManager(authentication: Auth0.authentication())
}

extension Auth0Manager {
    public var hasCredentials: Bool {
        return credentialsManager.canRenew() || credentialsManager.hasValid()
    }
}

extension Auth0Manager {
    func login() async throws -> Credentials {
        do {
            let credentials = try await Auth0.webAuth()
                .audience("your-auth0-audience")
                .start()

            _ = credentialsManager.store(credentials: credentials)
            return credentials
        } catch {
            print("Failed with: \(error)")
            throw error
        }
    }

    func clear() async {
        do {
            try await Auth0.webAuth().clearSession()
            try await credentialsManager.revoke()
            print("Logged out")
        } catch {
            print("Failed with: \(error)")
        }
    }

    func getCredentials() async throws -> Credentials {
        if hasCredentials {
            let credentials = try await credentialsManager.credentials()
            return credentials
        } else {
            throw Auth0ManagerError.noCredential
        }
    }
}
