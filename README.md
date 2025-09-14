# Privy Examples

<div align="center">

**Comprehensive collection of Privy starter repos and integration examples**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@privy-io/react-auth.svg)](https://www.npmjs.com/package/@privy-io/react-auth)

</div>

Welcome to the official Privy examples monorepo! This is your one-stop destination for starter templates, integration demos, and best practices for building with [Privy](https://privy.io).

## Repository Structure

This monorepo is organized with **core starter templates** at the top level and **use case examples** organized by SDK in the `use-case-examples/` directory.

## 🚀 Core Starter Repositories

Perfect starting points for new projects. Each includes authentication, wallet connection, and the essential "sign message" experience.

| Repository | Description |
|------------|-------------|
| [`privy-expo-bare-starter`](./privy-expo-bare-starter) | Minimal Expo React Native project |
| [`privy-expo-starter`](./privy-expo-starter) | React Native mobile app with Expo |
| [`privy-flutter-starter`](./privy-flutter-starter) | Flutter mobile application |
| [`privy-next-starter`](./privy-next-starter) | Next.js with App Router |
| [`privy-react-starter`](./privy-react-starter) | Complete React application with Privy auth |
| [`privy-react-whitelabel`](./privy-react-whitelabel) | Custom UI without Privy components |
| [`privy-swift-auth0`](./privy-swift-auth0) | iOS app with Auth0 + Privy integration |

## 📚 Use Case Examples

Focused examples showcasing specific Privy features and integrations.

| Repository | Description |
|------------|-------------|
| [`privy-react-chrome-extension`](./use-case-examples/react-sdk/privy-react-chrome-extension) | Browser extension implementation |
| [`privy-react-cross-app-connect`](./use-case-examples/react-sdk/privy-react-cross-app-connect) | Cross-application wallet connection |
| [`privy-react-cross-app-provider`](./use-case-examples/react-sdk/privy-react-cross-app-provider) | Cross-application auth provider |
| [`privy-react-ecosystem-sdk-starter`](./use-case-examples/react-sdk/privy-react-ecosystem-sdk-starter) | Build your own ecosystem SDK |
| [`privy-react-farcaster`](./use-case-examples/react-sdk/privy-react-farcaster) | Farcaster social integration |
| [`privy-react-fiat-onramp`](./use-case-examples/react-sdk/privy-react-fiat-onramp) | Fiat currency on-ramp |
| [`privy-react-frames`](./use-case-examples/react-sdk/privy-react-frames) | Farcaster Frames integration |
| [`privy-react-frames-v2`](./use-case-examples/react-sdk/privy-react-frames-v2) | Farcaster Frames v2 |
| [`privy-react-funding`](./use-case-examples/react-sdk/privy-react-funding) | Privy funding hooks showcase |
| [`privy-react-permissionless`](./use-case-examples/react-sdk/privy-react-permissionless) | Permissionless.js integration |
| [`privy-react-pwa`](./use-case-examples/react-sdk/privy-react-pwa) | Progressive Web App |
| [`privy-react-session-keys`](./use-case-examples/react-sdk/privy-react-session-keys) | Account abstraction with session keys |
| [`privy-react-smart-wallets`](./use-case-examples/react-sdk/privy-react-smart-wallets) | Smart wallets starter template |
| [`privy-react-solana`](./use-case-examples/react-sdk/privy-react-solana) | Solana blockchain integration |
| [`privy-react-wagmi`](./use-case-examples/react-sdk/privy-react-wagmi) | Wagmi integration for Ethereum |
| [`privy-node-telegram-trading-bot`](./use-case-examples/server-sdk/privy-node-telegram-trading-bot) | Telegram trading bot with Solana |

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