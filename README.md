# Privy Examples

<div align="center">

**Comprehensive collection of Privy starter repos and integration examples**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@privy-io/react-auth.svg)](https://www.npmjs.com/package/@privy-io/react-auth)

</div>

Welcome to the official Privy examples monorepo! This is your one-stop destination for starter templates, integration demos, and best practices for building with [Privy](https://privy.io).

## Repository Structure

This monorepo is organized with **core starter templates** at the top level and **feature-specific examples** organized by functionality in the `features/` directory.

## 🚀 Core Starter Repositories

Perfect starting points for new projects. Each includes authentication, wallet connection, and the essential "sign message" experience.

| Repository | Description |
|------------|-------------|
| [`privy-expo-bare-starter`](./privy-expo-bare-starter) | Minimal Expo React Native project |
| [`privy-expo-starter`](./privy-expo-starter) | React Native mobile app with Expo |
| [`privy-flutter-starter`](./privy-flutter-starter) | Flutter mobile application |
| [`privy-next-starter`](./privy-next-starter) | Next.js with App Router |
| [`privy-react-starter`](./privy-react-starter) | Complete React application with Privy auth |
| [`privy-swift-auth0`](./privy-swift-auth0) | iOS app with Auth0 + Privy integration |

## 📚 Feature Example Repositories

Focused examples showcasing specific Privy features and integrations, organized by functionality in the `features/` directory.

### Smart Wallets (`features/smart-wallets/`)
Account abstraction and smart wallet implementations:

| Repository | Description |
|------------|-------------|
| [`privy-react-permissionless`](./features/smart-wallets/privy-react-permissionless) | Permissionless.js integration |
| [`privy-react-smart-wallets`](./features/smart-wallets/privy-react-smart-wallets) | Smart wallets starter template |

### Web3 Integrations (`features/web3-integrations/`)
Blockchain and Web3 library integrations:

| Repository | Description |
|------------|-------------|
| [`privy-react-ecosystem-sdk-starter`](./features/web3-integrations/privy-react-ecosystem-sdk-starter) | Build your own ecosystem SDK |
| [`privy-react-solana`](./features/web3-integrations/privy-react-solana) | Solana blockchain integration |
| [`privy-react-wagmi`](./features/web3-integrations/privy-react-wagmi) | Wagmi integration for Ethereum |

### Social Auth (`features/social-auth/`)
Social authentication and cross-application examples:

| Repository | Description |
|------------|-------------|
| [`privy-react-cross-app-connect`](./features/social-auth/privy-react-cross-app-connect) | Cross-application wallet connection |
| [`privy-react-cross-app-provider`](./features/social-auth/privy-react-cross-app-provider) | Cross-application auth provider |
| [`privy-react-farcaster`](./features/social-auth/privy-react-farcaster) | Farcaster social integration |

### UI Frameworks (`features/ui-frameworks/`)
Different UI frameworks and deployment targets:

| Repository | Description |
|------------|-------------|
| [`privy-react-chrome-extension`](./features/ui-frameworks/privy-react-chrome-extension) | Browser extension implementation |
| [`privy-react-pwa`](./features/ui-frameworks/privy-react-pwa) | Progressive Web App |
| [`privy-react-whitelabel`](./features/ui-frameworks/privy-react-whitelabel) | Custom UI without Privy components |

### Fintech (`features/fintech/`)
Financial services and payment integrations:

| Repository | Description |
|------------|-------------|
| [`privy-react-fiat-onramp`](./features/fintech/privy-react-fiat-onramp) | Fiat currency on-ramp |
| [`privy-react-funding`](./features/fintech/privy-react-funding) | Privy funding hooks showcase |

### Frames (`features/frames/`)
Farcaster Frames implementations:

| Repository | Description |
|------------|-------------|
| [`privy-react-frames`](./features/frames/privy-react-frames) | Farcaster Frames integration |
| [`privy-react-frames-v2`](./features/frames/privy-react-frames-v2) | Farcaster Frames v2 |

### Advanced Features (`features/advanced/`)
Advanced Privy features and integrations:

| Repository | Description |
|------------|-------------|
| [`privy-react-session-keys`](./features/advanced/privy-react-session-keys) | Account abstraction with session keys |

### Trading Bots (`features/trading-bots/`)
Automated trading and bot implementations:

| Repository | Description |
|------------|-------------|
| [`privy-node-telegram-trading-bot`](./features/trading-bots/privy-node-telegram-trading-bot) | Telegram trading bot with Solana |

## Getting Started

1. **Choose a starter template** from the top-level directories based on your platform
2. **Explore feature examples** in the `features/` directory for specific functionality
3. **Follow the README** in each individual project for setup instructions

## Updating from Upstream

This repository uses git subtrees to track the original Privy repositories. To pull updates from upstream:

```bash
# For core starters
git subtree pull --prefix=privy-next-starter https://github.com/privy-io/create-next-app app-router --squash

# For feature examples  
git subtree pull --prefix=features/smart-wallets/privy-react-smart-wallets https://github.com/privy-io/smart-wallets-starter main --squash
```

See `SUBTREE_MAPPINGS.md` for the complete list of repository mappings.

## Repository Structure Benefits

- **Clear separation**: Core starters vs feature-specific examples
- **Easy discovery**: Related functionality grouped together
- **Scalable**: New features can be added to appropriate categories
- **Maintainable**: Each category has focused, related examples