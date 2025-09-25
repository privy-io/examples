# Privy + Solana Next.js Starter

This example showcases how to get started using Solana with Privy's React SDK inside a Next.js application.

## Live Demo

[View Demo]({{DEPLOY_URL}})

## Quick Start

### 1. Clone the Project

```bash
npx gitpick privy-io/examples/tree/main/examples/privy-next-solana && cd privy-next-solana
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the example environment file and configure your Privy app credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Privy app credentials:

```env
# Public - Safe to expose in the browser
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here

# Private - Keep server-side only
PRIVY_APP_SECRET=your_app_secret_here

# Optional: Uncomment if using custom auth URLs or client IDs
# NEXT_PUBLIC_PRIVY_CLIENT_ID=your_client_id_here
# NEXT_PUBLIC_PRIVY_AUTH_URL=https://auth.privy.io
```

**Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep `PRIVY_APP_SECRET` private and server-side only.

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Core Functionality

### 1. Login with Privy

Login or sign up using Privy's pre-built modals.

[`src/app/page.tsx`](./src/app/page.tsx)
```tsx
import { usePrivy } from "@privy-io/react-auth";
const { login } = usePrivy();
login();
```

### 2. Create a Solana wallet

Programmatically create a Solana embedded wallet for your user. Wallets can also be automatically created on login by configuring your PrivyProvider, learn more [here](https://docs.privy.io/basics/react/advanced/automatic-wallet-creation).

[`src/components/sections/create-a-wallet.tsx`](./src/components/sections/create-a-wallet.tsx)
```tsx
import { useSolanaWallets } from "@privy-io/react-auth";
const { createWallet } = useSolanaWallets();
createWallet();
```

### 3. Send a Transaction

Send a transaction on Solana by either prompting your users for confirmation, or abstract away confirmations by enabling headless signing.

[`src/components/sections/wallet-actions.tsx`](./src/components/sections/wallet-actions.tsx)
```tsx
import { useSendTransaction } from "@privy-io/react-auth/solana";
const { sendTransaction } = useSendTransaction();
const receipt = await sendTransaction({
  transaction: transaction,
  connection: connection,
  address: selectedWallet.address,
});
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
