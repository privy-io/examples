# Subtree Repository Mappings

This document maps the current local directory names to their corresponding GitHub repositories for git subtree operations.

## Repository Mappings

| Local Directory | GitHub Repository | Branch |
|----------------|-------------------|---------|
| privy-expo-bare-starter | https://github.com/privy-io/expo-bare-starter | main |
| privy-expo-starter | https://github.com/privy-io/expo-starter | main |
| privy-flutter-starter | https://github.com/privy-io/flutter-starter | main |
| privy-next-starter | https://github.com/privy-io/create-next-app | app-router |
| privy-react-starter | https://github.com/privy-io/create-react-app | main |
| privy-react-whitelabel | https://github.com/privy-io/whitelabel-starter | main |
| privy-swift-auth0 | https://github.com/privy-io/privy-auth0-ios-example | main |
| use-case-examples/privy-node-telegram-trading-bot | https://github.com/privy-io/telegram-trading-bot-starter | main |
| use-case-examples/privy-react-chrome-extension | https://github.com/privy-io/chrome-extension-starter | main |
| use-case-examples/privy-react-cross-app-connect | https://github.com/privy-io/cross-app-connect-demo | main |
| use-case-examples/privy-react-cross-app-provider | https://github.com/privy-io/cross-app-provider-demo | main |
| use-case-examples/privy-react-ecosystem-sdk-starter | https://github.com/privy-io/ecosystem-sdk-starter | main |
| use-case-examples/privy-react-farcaster | https://github.com/privy-io/farcaster-demo | main |
| use-case-examples/privy-react-fiat-onramp | https://github.com/privy-io/fiat-onramp-demo | main |
| use-case-examples/privy-react-frames | https://github.com/privy-io/privy-frames-demo | main |
| use-case-examples/privy-react-frames-v2 | https://github.com/privy-io/privy-frames-v2-demo | main |
| use-case-examples/privy-react-funding | https://github.com/privy-io/funding-demo | main |
| use-case-examples/privy-react-permissionless | https://github.com/privy-io/permissionless-example | main |
| use-case-examples/privy-react-pwa | https://github.com/privy-io/create-privy-pwa | main |
| use-case-examples/privy-react-session-keys | https://github.com/privy-io/session-keys-example | main |
| use-case-examples/privy-react-smart-wallets | https://github.com/privy-io/smart-wallets-starter | main |
| use-case-examples/privy-react-solana | https://github.com/privy-io/create-solana-next-app | main |
| use-case-examples/privy-react-wagmi | https://github.com/privy-io/wagmi-demo | main |

## Notes

1. **Directory Structure**: 
   - **Starters**: Top-level directories for main SDK starters and whitelabel template
   - **Use-case Examples**: All use-case specific examples are now under `use-case-examples/` directory

2. **Special cases**:
   - `privy-next-starter` uses the `app-router` branch instead of `main`

3. **Migration Status**: 
   - ⚠️ **SUBTREES NEED RE-ESTABLISHING**: The git subtree metadata still references old directory paths
   - Current subtree commits reference paths like `privy-react-wagmi` but files are now at `use-case-examples/privy-react-wagmi`
   - Future `git subtree pull` operations will fail until subtrees are re-established with correct paths

4. **Verification needed**: Before re-establishing subtrees, verify that:
   - Each repository exists and is accessible
   - The specified branch exists in each repository
   - The content matches what's expected in each local directory

## Re-establishing Subtrees

**⚠️ IMPORTANT**: The current subtree metadata is out of sync with the new directory structure. You'll need to re-establish subtrees for moved directories.

### For directories that moved to use-case-examples/:

```bash
# Remove the directory (it will be recreated)
rm -rf use-case-examples/<directory-name>

# Add as fresh subtree with new path
git subtree add --prefix=use-case-examples/<directory-name> <github-url> <branch> --squash

# Future updates
git subtree pull --prefix=use-case-examples/<directory-name> <github-url> <branch> --squash
```

### For directories that remained at root level:

```bash
# Remove existing directory
rm -rf <directory-name>

# Add as fresh subtree
git subtree add --prefix=<directory-name> <github-url> <branch> --squash

# Future updates
git subtree pull --prefix=<directory-name> <github-url> <branch> --squash
```

### Example for a moved directory:
```bash
# Re-establish privy-react-wagmi (moved to use-case-examples/)
rm -rf use-case-examples/privy-react-wagmi
git subtree add --prefix=use-case-examples/privy-react-wagmi https://github.com/privy-io/wagmi-demo main --squash
```