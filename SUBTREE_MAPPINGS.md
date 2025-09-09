# Subtree Repository Mappings

This document maps the current local directory names to their corresponding GitHub repositories for git subtree operations.

## Core Starter Repositories (Top Level)

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| privy-expo-bare-starter | https://github.com/privy-io/expo-bare-starter | main |
| privy-expo-starter | https://github.com/privy-io/expo-starter | main |
| privy-flutter-starter | https://github.com/privy-io/flutter-starter | main |
| privy-next-starter | https://github.com/privy-io/create-next-app | app-router |
| privy-react-starter | https://github.com/privy-io/create-react-app | main |
| privy-swift-auth0 | https://github.com/privy-io/privy-auth0-ios-example | main |

## Feature-Based Repositories

### Smart Wallets (`features/smart-wallets/`)

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| features/smart-wallets/privy-react-permissionless | https://github.com/privy-io/permissionless-example | main |
| features/smart-wallets/privy-react-smart-wallets | https://github.com/privy-io/smart-wallets-starter | main |

### Web3 Integrations (`features/web3-integrations/`)

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| features/web3-integrations/privy-react-ecosystem-sdk-starter | https://github.com/privy-io/ecosystem-sdk-starter | main |
| features/web3-integrations/privy-react-solana | https://github.com/privy-io/create-solana-next-app | main |
| features/web3-integrations/privy-react-wagmi | https://github.com/privy-io/wagmi-demo | main |

### Social Auth (`features/social-auth/`)

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| features/social-auth/privy-react-cross-app-connect | https://github.com/privy-io/cross-app-connect-demo | main |
| features/social-auth/privy-react-cross-app-provider | https://github.com/privy-io/cross-app-provider-demo | main |
| features/social-auth/privy-react-farcaster | https://github.com/privy-io/farcaster-demo | main |

### UI Frameworks (`features/ui-frameworks/`)

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| features/ui-frameworks/privy-react-chrome-extension | https://github.com/privy-io/chrome-extension-starter | main |
| features/ui-frameworks/privy-react-pwa | https://github.com/privy-io/create-privy-pwa | main |
| features/ui-frameworks/privy-react-whitelabel | https://github.com/privy-io/whitelabel-starter | main |

### Fintech (`features/fintech/`)

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| features/fintech/privy-react-fiat-onramp | https://github.com/privy-io/fiat-onramp-demo | main |
| features/fintech/privy-react-funding | https://github.com/privy-io/funding-demo | main |

### Frames (`features/frames/`)

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| features/frames/privy-react-frames | https://github.com/privy-io/privy-frames-demo | main |
| features/frames/privy-react-frames-v2 | https://github.com/privy-io/privy-frames-v2-demo | main |

### Advanced Features (`features/advanced/`)

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| features/advanced/privy-react-session-keys | https://github.com/privy-io/session-keys-example | main |

### Trading Bots (`features/trading-bots/`)

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| features/trading-bots/privy-node-telegram-trading-bot | https://github.com/privy-io/telegram-trading-bot-starter | main |

## Notes

1. **Duplicate mappings**: Some directories may map to the same repository but represent different branches or configurations:
   - `privy-react-biconomy` and `privy-react-smart-wallets` and `privy-react-zerodev` all map to `smart-wallets-starter`
   - `privy-react-base-paymaster` and `privy-react-permissionless` both map to `permissionless-example`

2. **Special cases**:
   - `privy-next-starter` uses the `app-router` branch instead of `main`
   - Some repositories may have been renamed or reorganized since the original subtree setup

3. **Verification needed**: Before re-establishing subtrees, verify that:
   - Each repository exists and is accessible
   - The specified branch exists in each repository
   - The content matches what's expected in each local directory

## Re-establishing Subtrees

To re-establish a subtree for any directory:

```bash
# Remove existing directory
rm -rf <local-directory>

# Add as fresh subtree
git subtree add --prefix=<local-directory> <github-url> <branch> --squash

# Future updates
git subtree pull --prefix=<local-directory> <github-url> <branch> --squash
```