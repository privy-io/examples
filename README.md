# Privy Examples

<div align="center">

**Comprehensive collection of Privy starter repos and integration examples**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@privy-io/react-auth.svg)](https://www.npmjs.com/package/@privy-io/react-auth)

</div>

Welcome to the official Privy examples monorepo! This is your one-stop destination for starter templates, integration demos, and best practices for building with [Privy](https://privy.io).

## 🚀 Quick Start

Each example is self-contained and can be cloned independently:

```bash
# Clone the entire monorepo
git clone https://github.com/privy-io/examples.git
cd examples

# Or work with a specific example
cd privy-nextjs-starter
npm install
npm run dev
```

## 📋 Examples Overview

| Example | Description | Privy Package |
|---------|-------------|---------------|
| [`react/create-next-app`](./react/create-next-app) | Full-featured Next.js application with Privy auth | @privy-io/react-auth |
| [`react/create-react-app`](./react/create-react-app) | Complete React application starter | @privy-io/react-auth |
| [`react/whitelabel-starter`](./react/whitelabel-starter) | Custom UI implementation without Privy components | @privy-io/react-auth |
| [`react/cross-app-connect-demo`](./react/cross-app-connect-demo) | Cross-application connection demo | @privy-io/react-auth |
| [`react/smart-wallets-starter`](./react/smart-wallets-starter) | Smart wallets integration and usage | @privy-io/react-auth |
| [`react/create-solana-next-app`](./react/create-solana-next-app) | Solana blockchain integration | @privy-io/react-auth |
| [`react/wagmi-demo`](./react/wagmi-demo) | Privy + Wagmi integration example | @privy-io/react-auth |
| [`react/telegram-trading-bot-starter`](./react/telegram-trading-bot-starter) | Telegram trading bot integration | @privy-io/server-auth |
| [`react/ecosystem-sdk-starter`](./react/ecosystem-sdk-starter) | Get started building your own ecosystem SDK | @privy-io/react-auth |
| [`react/fiat-onramp-demo`](./react/fiat-onramp-demo) | Fiat on-ramp integration demo | @privy-io/react-auth |
| [`react/funding-demo`](./react/funding-demo) | Privy funding hook showcase | @privy-io/react-auth |
| [`react/permissionless-example`](./react/permissionless-example) | Privy + permissionless.js integration | @privy-io/react-auth |
| [`react/privy-frames-v2-demo`](./react/privy-frames-v2-demo) | Farcaster Frames v2 integration | @privy-io/react-auth |
| [`react/farcaster-demo`](./react/farcaster-demo) | Login and write to Farcaster using Privy | @privy-io/react-auth |
| [`react/privy-frames-demo`](./react/privy-frames-demo) | Farcaster Frames integration | @privy-io/react-auth |
| [`react/privy-pwa`](./react/privy-pwa) | Progressive Web App with offline support | @privy-io/react-auth |
| [`react/session-keys-example`](./react/session-keys-example) | Account abstraction with session keys | @privy-io/react-auth |
| [`react/privy-chrome-extension`](./react/privy-chrome-extension) | Browser extension with Privy auth | @privy-io/react-auth |
| [`react/cross-app-provider-demo`](./react/cross-app-provider-demo) | Cross-application provider implementation | @privy-io/react-auth |
| [`react/zerodev-example`](./react/zerodev-example) | Privy + ZeroDev account abstraction | @privy-io/react-auth |
| [`react/biconomy-example`](./react/biconomy-example) | Privy + Biconomy smart accounts | @privy-io/react-auth |
| [`react/base-paymaster-example`](./react/base-paymaster-example) | Base network paymaster integration | @privy-io/react-auth |
| [`react/decentxyz-minting-page`](./react/decentxyz-minting-page) | Decent Editions NFT minting page | @privy-io/react-auth |
| [`expo/expo-starter`](./expo/expo-starter) | React Native mobile app with Expo | @privy-io/expo |
| [`expo/expo-bare-starter`](./expo/expo-bare-starter) | Bare minimum Expo React Native project | @privy-io/expo |
| [`swift/privy-auth0-ios-example`](./swift/privy-auth0-ios-example) | iOS app with Auth0 + Privy integration | privy-ios-sdk |
| [`flutter/flutter-starter`](./flutter/flutter-starter) | Flutter mobile application starter | privy_flutter |

### 🚧 Coming Soon

Additional SDKs and platforms we're actively building examples for.

| SDK | Examples Coming | Privy Package |
|-----|----------------|---------------|
| **Server** | Node.js, Python, Java server-side auth | @privy-io/server-auth |  
| **Android** | Kotlin native Android applications | privy-android-sdk |
| **Unity** | C# Unity game integration | privy-unity-sdk |

## 🎯 "Hello World" Moment

Every starter template includes Privy's core "Hello World" experience: **signing your first message**. This demonstrates:

- ✅ Wallet connection
- ✅ User authentication  
- ✅ Message signing
- ✅ Signature verification

## 🏗️ Architecture

This monorepo follows an SDK-based information architecture with a flat structure organized by Privy package:

```
privy-examples/
├── react/                     # @privy-io/react-auth examples
│   ├── create-next-app/       # Next.js starter
│   ├── create-react-app/      # React starter
│   ├── whitelabel-starter/    # Custom UI implementation
│   ├── smart-wallets-starter/ # Account abstraction
│   ├── farcaster-demo/        # Farcaster integration
│   ├── wagmi-demo/            # Wagmi integration
│   └── [more examples]/       # Feature-specific demos
├── expo/                      # @privy-io/expo examples
│   ├── expo-starter/          # Full Expo app
│   └── expo-bare-starter/     # Minimal Expo setup
├── swift/                     # privy-ios-sdk examples
│   └── privy-auth0-ios-example/
├── flutter/                   # privy_flutter examples
│   └── flutter-starter/
├── server/                    # @privy-io/server-auth (coming soon)
├── android/                   # privy-android-sdk (coming soon)
└── unity/                     # privy-unity-sdk (coming soon)
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ (for web examples)
- Xcode (for iOS examples)  
- Android Studio (for Android examples)
- A [Privy account](https://dashboard.privy.io)

### Setup

1. **Choose your example** from the table above based on your preferred Privy package
2. **Navigate to the directory**: `cd react/create-next-app` or `cd expo/expo-starter` 
3. **Install dependencies**: `npm install` (for Node.js projects)
4. **Configure your Privy App ID** in the environment variables
5. **Start developing**: `npm run dev`

Each example includes detailed setup instructions in its individual README.

## 🤝 Contributing

We welcome contributions! Whether you're:

- 🐛 Fixing bugs in existing examples
- ✨ Adding new features or examples
- 📚 Improving documentation
- 🔧 Updating dependencies

Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Adding New Examples

Follow our naming convention: `privy-{technology}-{platform}` (e.g., `privy-vue-starter`, `privy-flutter-mobile`)

## 📖 Documentation

- [Privy Documentation](https://docs.privy.io)
- [API Reference](https://docs.privy.io/reference)
- [SDKs and Libraries](https://docs.privy.io/guide/react)

## 🆘 Support

- [Discord Community](https://discord.gg/privy)
- [GitHub Issues](https://github.com/privy-io/examples/issues)
- [Support Email](mailto:support@privy.io)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the [Privy](https://privy.io) team**

</div>