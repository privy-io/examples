# README Template Instructions

This guide explains how to use the `README_TEMPLATE.md` to create READMEs for new Privy starter repositories.

## Template Variables

Replace the following placeholders with repo-specific values:

### Basic Information
- `{{BLOCKCHAIN_NAME}}` - The blockchain/network (e.g., "Solana", "Ethereum", "Base", "Polygon")
- `{{FRAMEWORK_NAME}}` - The frontend framework (e.g., "Next.js", "React", "Vite")
- `{{REPO_NAME}}` - The repository directory name (e.g., "privy-next-solana", "privy-react-funding")
- `{{PACKAGE_MANAGER}}` - Package manager used (usually "pnpm", but could be "npm" or "yarn")
- `{{DEPLOY_URL}}` - The live demo URL for the deployed example

### Environment Configuration
- `{{ADDITIONAL_ENV_VARS}}` - Any blockchain-specific environment variables beyond the standard Privy ones

### File Paths & Code Snippets
- `{{LOGIN_FILE_PATH}}` - Path to the main page/component that handles login (usually `./src/app/page.tsx`)
- `{{CREATE_WALLET_FILE_PATH}}` - Path to wallet creation component (e.g., `./src/components/sections/create-a-wallet.tsx`)
- `{{CREATE_WALLET_CODE}}` - Code snippet showing how to create a wallet for this blockchain
- `{{PRIMARY_ACTION_FILE_PATH}}` - Path to the main action component
- `{{PRIMARY_ACTION_NAME}}` - The main action users perform (e.g., "Send a Transaction", "Fund Your Wallet", "Sign a Message")
- `{{PRIMARY_ACTION_DESCRIPTION}}` - Description of what the primary action does
- `{{PRIMARY_ACTION_CODE}}` - Code snippet showing the primary action
- `{{ADDITIONAL_LINKS}}` - Any blockchain-specific documentation links

## Step-by-Step Instructions

### 1. Analyze the Repository Structure

Before creating the README, examine the codebase to understand:

1. **Framework & Setup**: Check `package.json` for framework and dependencies
2. **Main Components**: Look in `src/components/sections/` for key functionality
3. **Primary Action**: Identify the main feature (usually the most complex component)
4. **Environment Needs**: Check `.env.example` for required variables

### 2. Determine Primary Action

The primary action varies by repository purpose:

- **Transaction-focused repos**: "Send a Transaction" (wallet-actions.tsx)
- **Funding-focused repos**: "Fund Your Wallet" (fund-wallet.tsx) 
- **Signing-focused repos**: "Sign a Message" (message-signing.tsx)
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

### 4. Repository-Specific Examples

#### Solana Repository
```
{{BLOCKCHAIN_NAME}} = "Solana"
{{FRAMEWORK_NAME}} = "Next.js"
{{CREATE_WALLET_CODE}} = 
import { useSolanaWallets } from "@privy-io/react-auth";
const { createWallet } = useSolanaWallets();
createWallet();

{{PRIMARY_ACTION_NAME}} = "Send a Transaction"
{{PRIMARY_ACTION_DESCRIPTION}} = "Send a transaction on Solana by either prompting your users for confirmation, or abstract away confirmations by enabling headless signing."
```

#### Funding Repository
```
{{BLOCKCHAIN_NAME}} = "Ethereum" (or relevant chain)
{{PRIMARY_ACTION_NAME}} = "Fund Your Wallet"
{{PRIMARY_ACTION_DESCRIPTION}} = "Fund your wallet using a card, exchange, or external wallet. Privy has bridging integration out of the box powered by Relay."
{{PRIMARY_ACTION_CODE}} = 
import { useFundWallet } from "@privy-io/react-auth";
const { fundWallet } = useFundWallet();
fundWallet(address, { amount: "1" });
```

### 5. Quality Checklist

Before finalizing the README:

- [ ] All placeholder variables are replaced
- [ ] File paths are accurate and exist in the repository  
- [ ] Code snippets compile and use correct imports
- [ ] Environment variables match `.env.example`
- [ ] Clone command uses correct repository path
- [ ] Package manager commands match project setup
- [ ] Primary action reflects the repository's main purpose
- [ ] Links are valid and relevant

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