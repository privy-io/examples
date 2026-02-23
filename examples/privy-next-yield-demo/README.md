# Privy Yield Demo

A demo Next.js app showcasing **Privy Yield** - where users authenticate, receive an embedded wallet, deposit USDC into a yield-generating Morpho vault on Base mainnet, and withdraw with earned yield.

![Privy Yield Demo](https://privy.io/privy-logo-dark.png)

## Features

- 🔐 **Privy Authentication** - Email, wallet, Google, Apple login
- 💰 **Embedded Wallets** - Automatic wallet creation on login
- 📈 **Yield Generation** - Deposit USDC into Morpho vaults on Base
- 💸 **Easy Withdrawals** - Withdraw principal + earned yield anytime
- 📊 **Position Tracking** - View your current position and earnings

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth/Wallets**: Privy React SDK (`@privy-io/react-auth`)
- **Styling**: Tailwind CSS v4
- **Network**: Base Mainnet (Chain ID: 8453)
- **Asset**: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
PRIVY_APP_SECRET=your-privy-app-secret

# Vault Configuration  
NEXT_PUBLIC_VAULT_ID=your-vault-id

# Optional: Fee Recipient Address (for display purposes)
NEXT_PUBLIC_FEE_RECIPIENT=0x...
```

Get your Privy credentials from [console.privy.io](https://console.privy.io).

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with PrivyProvider
│   ├── page.tsx            # Landing/login page
│   ├── dashboard/
│   │   └── page.tsx        # Main dashboard after login
│   ├── api/
│   │   ├── deposit/route.ts   # Deposit to vault
│   │   ├── withdraw/route.ts  # Withdraw from vault
│   │   ├── position/route.ts  # Get user position (mock)
│   │   └── vault/route.ts     # Get vault info (mock)
│   └── globals.css         # Privy Home design system
├── components/
│   ├── PrivyProvider.tsx   # Privy SDK configuration
│   ├── WalletCard.tsx      # Wallet address + USDC balance
│   ├── DepositForm.tsx     # Deposit input + submit
│   ├── WithdrawForm.tsx    # Withdraw input + submit
│   ├── PositionDisplay.tsx # User's vault position
│   ├── FeeRecipientCard.tsx # Vault info display
│   └── PrivyLogo.tsx       # Privy branding
└── lib/
    ├── constants.ts        # USDC address, chain config, utilities
    └── utils.ts            # Helper functions
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/deposit` | POST | Deposit USDC into the yield vault |
| `/api/withdraw` | POST | Withdraw USDC from the vault |
| `/api/position` | GET | Get user's position (mock data) |
| `/api/vault` | GET | Get vault info (mock data) |

**Note**: Position and vault endpoints return mock data until the Privy API endpoints are fully implemented.

## Design System

The app uses the **Privy Home** design system with:

- Brand off-black: `#010110`
- Primary interactive: `#5B4FFF`
- Background: `#FFFFFF`
- Elevated background: `#F1F2F9`
- Success: `#DCFCE7` / `#135638`
- Error: `#FEE2E2` / `#991B1B`

## Learn More

- [Privy Documentation](https://docs.privy.io)
- [Privy Yield API](https://docs.privy.io/guide/yield)
- [Morpho Protocol](https://morpho.org)
- [Base Network](https://base.org)

## License

MIT
