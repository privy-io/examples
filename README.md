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

### ⚛️ React

Web applications built with React and Next.js, including starter templates and advanced feature demos.

#### Core Starters
| Example | Description | Status |
|---------|-------------|---------|
| [`react/create-next-app`](./react/create-next-app) | Full-featured Next.js application with Privy auth | ✅ Ready |
| [`react/create-react-app`](./react/create-react-app) | Complete React application starter | ✅ Ready |
| [`react/whitelabel-starter`](./react/whitelabel-starter) | Custom UI implementation without Privy components | ✅ Ready |

#### Feature Demos
| Example | Description | Status |
|---------|-------------|---------|
| [`react/cross-app-connect-demo`](./react/cross-app-connect-demo) | Cross-application connection demo | ✅ Ready |
| [`react/smart-wallets-starter`](./react/smart-wallets-starter) | Smart wallets integration and usage | ✅ Ready |
| [`react/create-solana-next-app`](./react/create-solana-next-app) | Solana blockchain integration | ✅ Ready |
| [`react/wagmi-demo`](./react/wagmi-demo) | Privy + Wagmi integration example | ✅ Ready |
| [`react/telegram-trading-bot-starter`](./react/telegram-trading-bot-starter) | Telegram trading bot integration | ✅ Ready |
| [`react/ecosystem-sdk-starter`](./react/ecosystem-sdk-starter) | Get started building your own ecosystem SDK | ✅ Ready |
| [`react/fiat-onramp-demo`](./react/fiat-onramp-demo) | Fiat on-ramp integration demo | ✅ Ready |
| [`react/funding-demo`](./react/funding-demo) | Privy funding hook showcase | ✅ Ready |
| [`react/permissionless-example`](./react/permissionless-example) | Privy + permissionless.js integration | ✅ Ready |
| [`react/privy-frames-v2-demo`](./react/privy-frames-v2-demo) | Farcaster Frames v2 integration | ✅ Ready |
| [`react/farcaster-demo`](./react/farcaster-demo) | Login and write to Farcaster using Privy | ✅ Ready |
| [`react/privy-frames-demo`](./react/privy-frames-demo) | Farcaster Frames integration | ✅ Ready |
| [`react/privy-pwa`](./react/privy-pwa) | Progressive Web App with offline support | ✅ Ready |
| [`react/session-keys-example`](./react/session-keys-example) | Account abstraction with session keys | ✅ Ready |
| [`react/privy-chrome-extension`](./react/privy-chrome-extension) | Browser extension with Privy auth | ✅ Ready |
| [`react/cross-app-provider-demo`](./react/cross-app-provider-demo) | Cross-application provider implementation | ✅ Ready |
| [`react/zerodev-example`](./react/zerodev-example) | Privy + ZeroDev account abstraction | ✅ Ready |
| [`react/biconomy-example`](./react/biconomy-example) | Privy + Biconomy smart accounts | ✅ Ready |
| [`react/base-paymaster-example`](./react/base-paymaster-example) | Base network paymaster integration | ✅ Ready |
| [`react/decentxyz-minting-page`](./react/decentxyz-minting-page) | Decent Editions NFT minting page | ✅ Ready |

### 📱 Expo / React Native

Mobile applications built with Expo and React Native.

| Example | Description | Status |
|---------|-------------|---------|
| [`expo/expo-starter`](./expo/expo-starter) | React Native mobile app with Expo | ✅ Ready |
| [`expo/expo-bare-starter`](./expo/expo-bare-starter) | Bare minimum Expo React Native project | ✅ Ready |

### 🍎 Swift

Native iOS applications built with Swift.

| Example | Description | Status |
|---------|-------------|---------|
| [`swift/privy-auth0-ios-example`](./swift/privy-auth0-ios-example) | iOS app with Auth0 + Privy integration | ✅ Ready |

### 🎯 Flutter  

Cross-platform mobile applications built with Flutter.

| Example | Description | Status |
|---------|-------------|---------|
| [`flutter/flutter-starter`](./flutter/flutter-starter) | Flutter mobile application starter | ✅ Ready |

### 🚧 Coming Soon

Additional SDKs and platforms we're actively building examples for.

| SDK | Examples Coming | Status |
|-----|----------------|---------|
| **Server** | Node.js, Python, Java server-side auth | 🚧 In Development |  
| **Android** | Kotlin native Android applications | 🚧 In Development |
| **Unity** | C# Unity game integration | 🚧 In Development |

## 🎯 "Hello World" Moment

Every starter template includes Privy's core "Hello World" experience: **signing your first message**. This demonstrates:

- ✅ Wallet connection
- ✅ User authentication  
- ✅ Message signing
- ✅ Signature verification

## 🏗️ Architecture

This monorepo follows an SDK-based information architecture organized by technology:

```
privy-examples/
├── react/                     # React & Next.js examples
│   ├── create-next-app/       # Core starters
│   ├── create-react-app/
│   ├── whitelabel-starter/
│   └── [feature-demos]/       # Smart wallets, Farcaster, etc.
├── expo/                      # React Native with Expo
│   ├── expo-starter/
│   └── expo-bare-starter/
├── swift/                     # iOS native development  
│   └── privy-auth0-ios-example/
├── flutter/                   # Flutter mobile
│   └── flutter-starter/
├── server/                    # Server-side SDKs (coming soon)
├── android/                   # Android native (coming soon)
└── unity/                     # Unity gaming (coming soon)
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ (for web examples)
- Xcode (for iOS examples)  
- Android Studio (for Android examples)
- A [Privy account](https://dashboard.privy.io)

### Setup

1. **Choose your SDK** from the sections above (React, Expo, Swift, Flutter)
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