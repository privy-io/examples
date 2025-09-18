# Subtree Repository Mappings

This document maps the current local directory names to their corresponding GitHub repositories for git subtree operations.

## Repository Mappings

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| privy-expo-bare-starter | https://github.com/privy-io/expo-bare-starter | main |
| privy-expo-starter | https://github.com/privy-io/expo-starter | main |
| privy-flutter-starter | https://github.com/privy-io/flutter-starter | main |
| privy-next-starter | https://github.com/privy-io/create-next-app | main |
| privy-node-starter | https://github.com/privy-io/node-starter | main |
| privy-react-starter | https://github.com/privy-io/create-react-app | main |
| privy-react-whitelabel-starter | https://github.com/privy-io/whitelabel-starter | main |
| privy-swift-auth0 | https://github.com/privy-io/privy-auth0-ios-example | main |
| examples/privy-node-telegram-trading-bot | https://github.com/privy-io/telegram-trading-bot-starter | main |
| examples/privy-react-chrome-extension | https://github.com/privy-io/chrome-extension-starter | main |
| examples/privy-react-cross-app-connect | https://github.com/privy-io/cross-app-connect-demo | main |
| examples/privy-react-cross-app-provider | https://github.com/privy-io/cross-app-provider-demo | main |
| examples/privy-react-ecosystem-sdk-starter | https://github.com/privy-io/ecosystem-sdk-starter | main |
| examples/privy-react-farcaster | https://github.com/privy-io/farcaster-demo | main |
| examples/privy-react-fiat-onramp | https://github.com/privy-io/fiat-onramp-demo | main |
| examples/privy-react-frames | https://github.com/privy-io/privy-frames-demo | main |
| examples/privy-react-frames-v2 | https://github.com/privy-io/privy-frames-v2-demo | main |
| examples/privy-react-funding | https://github.com/privy-io/funding-demo | main |
| examples/privy-react-permissionless | https://github.com/privy-io/permissionless-example | main |
| examples/privy-react-pwa | https://github.com/privy-io/create-privy-pwa | main |
| examples/privy-react-session-keys | https://github.com/privy-io/session-keys-example | main |
| examples/privy-react-smart-wallets | https://github.com/privy-io/smart-wallets-starter | main |
| examples/privy-react-solana | https://github.com/privy-io/create-solana-next-app | main |
| examples/privy-react-wagmi | https://github.com/privy-io/wagmi-demo | main |

## Notes

1. **Directory Structure**: 
   - **Starters**: Top-level directories for main SDK starters and whitelabel template
   - **Use-case Examples**: All use-case specific examples are now under `use-case-examples/` directory

2. **Special cases**:
   - All repositories now use the `main` branch

3. **Migration Status**: 
   - ✅ **SUBTREES SUCCESSFULLY RE-ESTABLISHED**: All subtrees have been updated to use the correct directory paths
   - All `use-case-examples/` directories now have proper subtree linkages
   - `git subtree pull` operations work correctly for all repositories

4. **Usage**: 
   - All subtrees are now properly configured and ready to use
   - Use `git subtree pull --prefix=<directory-path> <repo-url> <branch> --squash` to pull updates
   - Use `git subtree push --prefix=<directory-path> <repo-url> <branch>` to push changes back to individual repos

## Working with Subtrees

All subtrees have been successfully re-established and are ready to use.

### Pulling updates from upstream repositories:

```bash
# For use-case examples
git subtree pull --prefix=use-case-examples/<directory-name> <github-url> <branch> --squash

# For root-level starters
git subtree pull --prefix=<directory-name> <github-url> <branch> --squash
```

### Examples:
```bash
# Pull updates for chrome extension example
git subtree pull --prefix=use-case-examples/privy-react-chrome-extension https://github.com/privy-io/chrome-extension-starter main --squash

# Pull updates for Next.js starter
git subtree pull --prefix=privy-next-starter https://github.com/privy-io/create-next-app main --squash

# Pull updates for wagmi demo
git subtree pull --prefix=use-case-examples/privy-react-wagmi https://github.com/privy-io/wagmi-demo main --squash
```

### Pushing changes back to individual repositories:
```bash
# Push changes from local directory back to its source repository
git subtree push --prefix=<directory-path> <github-url> <branch>
```