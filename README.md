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

### 🎯 Starter Templates

Perfect starting points for new projects. Each includes the "Hello World" sign message moment and full Privy integration.

| Example | Description | Technology | Status |
|---------|-------------|------------|---------|
| [`privy-nextjs-starter`](./privy-nextjs-starter) | Full-featured Next.js application with Privy auth | Next.js + TypeScript | ✅ Ready |
| [`privy-react-starter`](./privy-react-starter) | Complete React application starter | React + JavaScript | ✅ Ready |
| [`privy-expo-starter`](./privy-expo-starter) | React Native mobile app with Expo | Expo + TypeScript | ✅ Ready |
| [`privy-whitelabel-nextjs`](./privy-whitelabel-nextjs) | Custom UI implementation without Privy components | Next.js + TypeScript | ✅ Ready |
| [`privy-pwa-nextjs`](./privy-pwa-nextjs) | Progressive Web App with offline support | Next.js + PWA | ✅ Ready |
| [`privy-solana-nextjs`](./privy-solana-nextjs) | Solana blockchain integration | Next.js + Solana | ✅ Ready |

### 🔧 Platform Integrations

Examples for specific platforms and environments.

| Example | Description | Technology | Status |
|---------|-------------|------------|---------|
| [`privy-chrome-extension`](./privy-chrome-extension) | Browser extension with Privy auth | TypeScript + Manifest V3 | ✅ Ready |
| [`privy-auth0-ios-example`](./privy-auth0-ios-example) | iOS app with Auth0 + Privy integration | Swift + Auth0 | ✅ Ready |

### 🌟 Feature Demos

Focused examples showcasing specific Privy features and advanced use cases.

| Example | Description | Technology | Status |
|---------|-------------|------------|---------|
| [`privy-cross-app-connect`](./privy-cross-app-connect) | Cross-application connection demo | Next.js + TypeScript | ✅ Ready |
| [`privy-cross-app-provider`](./privy-cross-app-provider) | Cross-application provider implementation | Next.js + TypeScript | ✅ Ready |

### 🚧 Coming Soon

Additional starters and examples we're actively building.

| Example | Description | Technology | Status |
|---------|-------------|------------|---------|
| `privy-ios-starter` | Native iOS "Hello World" app | Swift + UIKit | 🚧 Coming Soon |
| `privy-android-starter` | Native Android application | Kotlin | 🚧 Coming Soon |
| `privy-unity-starter` | Unity game integration | C# + Unity | 🚧 Coming Soon |
| `privy-node-starter` | Server-side authentication | Node.js + Express | 🚧 Coming Soon |
| `privy-python-starter` | Python server implementation | Python + FastAPI | 🚧 Coming Soon |

## 🎯 "Hello World" Moment

Every starter template includes Privy's core "Hello World" experience: **signing your first message**. This demonstrates:

- ✅ Wallet connection
- ✅ User authentication  
- ✅ Message signing
- ✅ Signature verification

## 🏗️ Architecture

This monorepo follows a flat, discoverable structure inspired by successful open-source examples:

```
privy-examples/
├── privy-{tech}-starter/      # Full-featured starters
├── privy-{feature}-{tech}/    # Feature-specific demos
└── privy-{platform}/          # Platform integrations
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ (for web examples)
- Xcode (for iOS examples)  
- Android Studio (for Android examples)
- A [Privy account](https://dashboard.privy.io)

### Setup

1. **Choose your example** from the table above
2. **Navigate to the directory**: `cd privy-nextjs-starter`
3. **Install dependencies**: `npm install`
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