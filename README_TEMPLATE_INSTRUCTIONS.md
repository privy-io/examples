# README Template Instructions

This guide explains how to use the `README_TEMPLATE.md` to create READMEs for new Privy starter repositories.

## Template Variables

Replace the following placeholders with repo-specific values:

### Basic Information
- `{{CORE_FEATURE_NAME}}` - The main feature name (e.g., "Smart Wallets", "Funding", "Farcaster", "Account Abstraction")
- `{{CORE_FEATURE_DESCRIPTION}}` - Brief description of the core feature (e.g., "smart wallet functionality", "wallet funding", "Farcaster integration")
- `{{FRAMEWORK_NAME}}` - The frontend framework (e.g., "Next.js", "React", "Vite")
- `{{REPO_NAME}}` - The repository directory name (e.g., "privy-next-solana", "privy-react-funding")
- `{{PACKAGE_MANAGER}}` - Package manager used (usually "pnpm", but could be "npm" or "yarn")
- `{{DEPLOY_URL}}` - The live demo URL for the deployed example

### Dashboard Setup
- `{{DASHBOARD_SETUP_INSTRUCTIONS}}` - Additional setup steps beyond creating a Privy app (formatted as bullet points)
  - Examples: "- Configure smart wallets [here](link)", "- Enable Farcaster login [here](link)"

### Environment Configuration
- `{{ADDITIONAL_ENV_VARS}}` - Any integration-specific environment variables beyond the standard Privy ones

### Core Functionality Sections
- `{{SETUP_SECTION_TITLE}}` - Title for main setup section (e.g., "Setup Smart Wallets Provider", "Login with Privy")
- `{{SETUP_SECTION_DESCRIPTION}}` - Description of the main setup step
- `{{SETUP_FILE_PATH}}` - Path to main setup file
- `{{SETUP_CODE}}` - Code snippet showing the main setup

### Wallet Creation
- `{{WALLET_CREATION_TITLE}}` - Title for wallet creation section (e.g., "Create Smart Wallets", "Create Embedded Wallets")
- `{{WALLET_CREATION_DESCRIPTION}}` - Description of wallet creation behavior
- `{{CREATE_WALLET_FILE_PATH}}` - Path to wallet creation component
- `{{CREATE_WALLET_CODE}}` - Code snippet showing wallet creation

### Primary Action
- `{{PRIMARY_ACTION_NAME}}` - The main action users perform (e.g., "Send Batch Transactions", "Fund Your Wallet", "Submit Farcaster Casts")
- `{{PRIMARY_ACTION_DESCRIPTION}}` - Description of what the primary action does
- `{{PRIMARY_ACTION_FILE_PATH}}` - Path to the main action component
- `{{PRIMARY_ACTION_CODE}}` - Code snippet showing the primary action
- `{{ADDITIONAL_LINKS}}` - Any integration-specific documentation links

## Step-by-Step Instructions

### 1. Analyze the Repository Structure

Before creating the README, examine the codebase to understand:

1. **Framework & Setup**: Check `package.json` for framework and dependencies
2. **Core Integration**: Identify the main feature (smart wallets, funding, Farcaster, etc.)
3. **Provider Setup**: Look for provider configurations (SmartWalletsProvider, etc.)
4. **Main Components**: Look in `src/components/sections/` for key functionality
5. **Primary Action**: Identify the main feature (usually the most complex component)
6. **Environment Needs**: Check `.env.example` or `.env.sample` for required variables
7. **External Dependencies**: Identify third-party services (Pimlico, ZeroDev, Supabase, etc.)

### 2. Identify Core Feature and Setup Requirements

Determine what makes this repository unique:

- **Smart Wallets**: Requires SmartWalletsProvider setup, dashboard configuration
- **Funding**: Requires funding configuration in dashboard
- **Farcaster**: Requires enabling Farcaster login in dashboard
- **Account Abstraction**: Requires external AA provider setup (Pimlico, ZeroDev)
- **Session Keys**: Requires AA provider + storage solution setup

### 3. Determine Repository Title Pattern

Follow the **"Core Feature + Privy"** pattern:

- **Smart Wallets + Privy** (not "Privy + Smart Wallets")
- **Funding + Privy** 
- **Farcaster + Privy**
- **Account Abstraction + Privy**
- **Session Keys + Privy**

### 4. Plan Dashboard Setup Requirements

Step 0 should always include:
1. **Privy Dashboard**: Create app link
2. **Feature-Specific Configuration**: Links to enable/configure the core feature
3. **External Service Setup**: Links to third-party dashboards if needed

### 5. Determine Primary Action

The primary action varies by repository purpose:

- **Smart Wallet repos**: "Send Batch Transactions" or core smart wallet feature
- **Funding repos**: "Fund Your Wallet" 
- **Farcaster repos**: "Submit Farcaster Casts"
- **AA repos**: "Mint NFT with Gas Sponsorship" or main sponsored action
- **Session Key repos**: "Create Session Keys"
- **Transaction repos**: "Send a Transaction"
- **DeFi repos**: "Swap Tokens", "Provide Liquidity", etc.
- **NFT repos**: "Mint an NFT", "Transfer NFTs", etc.

### 3. Extract Code Snippets

For each code section, extract the most relevant 3-5 lines that show the core Privy hook usage:

**Create Wallet Example:**
```tsx
import { useSolanaWallets } from "@privy-io/react-auth";
const { createWallet } = useSolanaWallets();
createWallet();
```

**Primary Action Example:**
```tsx
import { useSendTransaction } from "@privy-io/react-auth/solana";
const { sendTransaction } = useSendTransaction();
const receipt = await sendTransaction({
  transaction: transaction,
  connection: connection,
  address: selectedWallet.address,
});
```

### 6. Repository-Specific Examples

#### Smart Wallets Repository
```
{{CORE_FEATURE_NAME}} = "Smart Wallets"
{{CORE_FEATURE_DESCRIPTION}} = "smart wallet functionality"
{{FRAMEWORK_NAME}} = "Next.js"
{{DASHBOARD_SETUP_INSTRUCTIONS}} = "- Configure the dashboard to enable smart wallets [here](https://docs.privy.io/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard)"
{{SETUP_SECTION_TITLE}} = "Setup Smart Wallets Provider"
{{SETUP_SECTION_DESCRIPTION}} = "Configure your app to use smart wallets by wrapping your PrivyProvider with the SmartWalletsProvider."
{{WALLET_CREATION_TITLE}} = "Create Smart Wallets"  
{{WALLET_CREATION_DESCRIPTION}} = "Create embedded wallets, smart wallets are automatically provisioned when the SmartWalletsProvider is configured."
{{PRIMARY_ACTION_NAME}} = "Send Batch Transactions"
{{PRIMARY_ACTION_DESCRIPTION}} = "Send batch transactions, sign messages and typed data, manage session signers, and switch between chains using smart wallets."
```

#### Funding Repository
```
{{CORE_FEATURE_NAME}} = "Funding"
{{CORE_FEATURE_DESCRIPTION}} = "wallet funding"
{{FRAMEWORK_NAME}} = "Next.js"
{{DASHBOARD_SETUP_INSTRUCTIONS}} = "- Configure funding settings if needed [here](https://docs.privy.io/guide/react/recipes/misc/funding)"
{{SETUP_SECTION_TITLE}} = "Login with Privy"
{{PRIMARY_ACTION_NAME}} = "Fund Your Wallet"
{{PRIMARY_ACTION_DESCRIPTION}} = "Fund your wallet using a card, exchange, or external wallet. Privy has bridging integration out of the box powered by Relay."
{{PRIMARY_ACTION_CODE}} = 
import { useFundWallet, useWallets } from "@privy-io/react-auth";
const { wallets } = useWallets();
const { fundWallet } = useFundWallet();
fundWallet(wallets[0].address, { asset: "USDC", amount: "15" });
```

#### Account Abstraction Repository
```
{{CORE_FEATURE_NAME}} = "Account Abstraction"
{{CORE_FEATURE_DESCRIPTION}} = "account abstraction"
{{FRAMEWORK_NAME}} = "Next.js"
{{DASHBOARD_SETUP_INSTRUCTIONS}} = "- Set up a Pimlico project for Base Sepolia [here](https://dashboard.pimlico.io/)"
{{PRIMARY_ACTION_NAME}} = "Mint NFT with Gas Sponsorship"
{{PRIMARY_ACTION_DESCRIPTION}} = "Create smart accounts with gas sponsorship using Permissionless.js and Pimlico. Users can mint NFTs without paying gas fees."
{{ADDITIONAL_ENV_VARS}} = "
# Pimlico Configuration (Base Sepolia)
# Get these from https://dashboard.pimlico.io/apikeys
NEXT_PUBLIC_PIMLICO_PAYMASTER_URL=your_pimlico_paymaster_url_here
NEXT_PUBLIC_PIMLICO_BUNDLER_URL=your_pimlico_bundler_url_here"
```

#### Farcaster Repository
```
{{CORE_FEATURE_NAME}} = "Farcaster"
{{CORE_FEATURE_DESCRIPTION}} = "Farcaster social login and casting"
{{FRAMEWORK_NAME}} = "Next.js"
{{DASHBOARD_SETUP_INSTRUCTIONS}} = "- Enable Farcaster as a login method in your app settings [here](https://docs.privy.io/guide/react/recipes/misc/farcaster)"
{{PRIMARY_ACTION_NAME}} = "Submit Farcaster Casts"
{{PRIMARY_ACTION_DESCRIPTION}} = "Login with Farcaster, submit casts, like and recast content, and manage your Farcaster social presence."
```

#### Session Keys Repository
```
{{CORE_FEATURE_NAME}} = "Session Keys"
{{CORE_FEATURE_DESCRIPTION}} = "session keys for server-side wallet access"
{{FRAMEWORK_NAME}} = "Next.js"
{{DASHBOARD_SETUP_INSTRUCTIONS}} = "- Set up ZeroDev project for account abstraction [here](https://dashboard.zerodev.app/)
- Set up Supabase project for storage [here](https://supabase.com/dashboard)"
{{PRIMARY_ACTION_NAME}} = "Create Session Keys"
{{PRIMARY_ACTION_DESCRIPTION}} = "Provision server-side access to AA wallets using session keys for automated transactions and backend operations."
```

### 7. Quality Checklist

Before finalizing the README:

**Title & Structure:**
- [ ] Title follows "Core Feature + Privy" pattern
- [ ] Step 0 includes Privy dashboard setup
- [ ] Step 0 includes feature-specific configuration links
- [ ] Step 0 includes external service setup if needed

**Content Accuracy:**
- [ ] All placeholder variables are replaced
- [ ] File paths are accurate and exist in the repository  
- [ ] Code snippets compile and use correct imports
- [ ] Environment variables match `.env.example` or `.env.sample`
- [ ] Clone command uses correct repository path and strip level
- [ ] Package manager commands match project setup

**Core Functionality:**
- [ ] Section 1 focuses on main integration setup (provider, configuration)
- [ ] Section 2 explains wallet creation behavior correctly
- [ ] Section 3 demonstrates the repository's primary unique feature
- [ ] Primary action reflects the repository's main purpose
- [ ] Code examples show actual implementation from the repo

**Links & References:**
- [ ] All dashboard links are valid and relevant
- [ ] Documentation links are current
- [ ] External service links are correct
- [ ] File path references exist in the repository

## 🚨 NEW ASPECTS TO CONSIDER

Based on analysis of successful documentation patterns, consider adding:

### Performance & Security Section
```markdown
## Performance & Security

- **Headless Signing**: Enable headless mode for seamless UX without confirmation prompts
- **Error Handling**: Robust error boundaries and user-friendly error messages  
- **Network Management**: Automatic network switching and RPC failover
- **Bundle Optimization**: Tree-shaking and code splitting for optimal performance
```

### Deployment Guide
```markdown
## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Other Platforms
- **Netlify**: Add build command `{{PACKAGE_MANAGER}} build`
- **Railway**: Uses `package.json` scripts automatically
- **Render**: Static site deployment supported
```

### Troubleshooting Section
```markdown
## Common Issues

**Wallet Connection Fails**
- Ensure `NEXT_PUBLIC_PRIVY_APP_ID` is set correctly
- Check network connectivity and RPC endpoints

**Transaction Errors**  
- Verify wallet has sufficient balance for gas fees
- Check if transaction exceeds network limits

**Build Failures**
- Clear `node_modules` and reinstall dependencies
- Ensure Node.js version matches `.nvmrc` if present
```

### Examples Gallery
```markdown
## Examples

| Feature | Component | Description |
|---------|-----------|-------------|
| Login | `src/app/page.tsx` | Privy authentication flow |
| Wallet Creation | `src/components/sections/create-a-wallet.tsx` | Embedded wallet generation |
| {{PRIMARY_ACTION_NAME}} | `{{PRIMARY_ACTION_FILE_PATH}}` | {{PRIMARY_ACTION_DESCRIPTION}} |
```

These additions provide more comprehensive documentation while maintaining the core structure focused on the three-step user journey: login → create wallet → take action.