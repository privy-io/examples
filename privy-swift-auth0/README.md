# Privy + Auth0 iOS Starter

This example showcases how to integrate Privy's iOS SDK with Auth0 as a custom authentication provider in a SwiftUI application.

## Getting Started

### 1. Clone the Project

```bash
mkdir -p privy-swift-auth0 && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=2 -C privy-swift-auth0 examples-main/privy-swift-auth0 && cd privy-swift-auth0
```

### 2. Open in Xcode

```bash
open PrivyExampleApp.xcodeproj
```

### 3. Configure Privy App ID

Update your Privy App ID in the configuration:

[`PrivyExampleApp/PrivyManager.swift`](PrivyExampleApp/PrivyManager.swift#L32)

```swift
self.privy = Privy(config: PrivyConfig(appId: "your-app-id"))
```

### 4. Configure Auth0 Settings

Update the Auth0 configuration files with your Auth0 account details:

**Auth0.plist:**

```xml
<key>ClientId</key>
<string>your_auth0_client_id</string>
<key>Domain</key>
<string>your_auth0_domain</string>
```

**Auth0Manager.swift:**
[`PrivyExampleApp/Auth0Manager.swift`](PrivyExampleApp/Auth0Manager.swift#L22)

```swift
.audience("your-auth0-audience")
```

### 5. Run the App

Select a simulator or connected device in Xcode and press `Cmd + R` to build and run the application.

## Core Functionality

### 1. Custom Authentication with Auth0

Integrate Auth0 as a custom authentication provider for Privy.

[`PrivyExampleApp/Auth0Manager.swift`](PrivyExampleApp/Auth0Manager.swift)

```swift
import Auth0

func login() async throws -> Credentials {
    let credentials = try await Auth0.webAuth()
        .audience("your-auth0-audience")
        .start()
    return credentials
}
```

### 2. Initialize Privy with Custom Token

Configure Privy to use Auth0 tokens for authentication.

[`PrivyExampleApp/PrivyManager.swift`](PrivyExampleApp/PrivyManager.swift)

```swift
import PrivySDK

privy.tokenProvider = {
    return try await self.authManager.getCredentials().accessToken
}

let user = try await privy.loginWithCustomAccessToken()
```

### 3. Create and Manage Wallets

Create embedded wallets and perform blockchain operations.

[`PrivyExampleApp/Views/WalletView.swift`](PrivyExampleApp/Views/WalletView.swift)

```swift
// Create wallet
let wallet = try await privy.createWallet()

// Send transaction
let txHash = try await provider.request(
    RpcRequest(method: "eth_sendTransaction", params: [txString]),
    wallet.address
)

// Sign message
let signature = try await provider.request(
    RpcRequest(method: "personal_sign", params: ["I am the message", wallet.address]),
    wallet.address
)
```

## Requirements

- iOS 15.0+
- Xcode 14.0+
- Swift 5.7+

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [iOS SDK Guide](https://docs.privy.io/guide/guides/swift-sdk)
- [Auth0 Documentation](https://auth0.com/docs)
