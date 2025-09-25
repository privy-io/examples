# Privy + Next.js Starter

This example showcases how to get started using Privy's React SDK inside a Next.js application.

## Live Demo

[View Demo]({{DEPLOY_URL}})

## Getting Started

### 1. Clone the Project

```bash
npx gitpick privy-io/examples/tree/main/examples/privy-next-farcaster && cd privy-next-farcaster
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the example environment file and configure your Privy app credentials:

```bash
cp .env .env.local
```

Update `.env.local` with your Privy app credentials:

```env
# Public - Safe to expose in the browser
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_PRIVY_SIGNER_ID=your_signer_id_here
```

**Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Get your credentials from the [Privy Dashboard](https://dashboard.privy.io).

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

### 2. Create Multi-Chain Wallets

Programmatically create embedded wallets for multiple blockchains. Supports Ethereum, Solana, Bitcoin, and more.

[`src/components/sections/create-a-wallet.tsx`](./src/components/sections/create-a-wallet.tsx)
```tsx
import { useCreateWallet, useSolanaWallets } from "@privy-io/react-auth";
import { useCreateWallet as useCreateWalletExtendedChains } from "@privy-io/react-auth/extended-chains";

const { createWallet: createWalletEvm } = useCreateWallet();
const { createWallet: createWalletSolana } = useSolanaWallets();
const { createWallet: createWalletExtendedChains } = useCreateWalletExtendedChains();

// Create Ethereum wallet
createWalletEvm({ createAdditional: true });

// Create Solana wallet
createWalletSolana({ createAdditional: true });

// Create Bitcoin/other chain wallets
createWalletExtendedChains({ chainType: "bitcoin-segwit" });
```

### 3. Send Transactions

Send transactions on both Ethereum and Solana with comprehensive wallet action support.

[`src/components/sections/wallet-actions.tsx`](./src/components/sections/wallet-actions.tsx)
```tsx
import { useSendTransaction } from "@privy-io/react-auth";
import { useSendTransaction as useSendTransactionSolana } from "@privy-io/react-auth/solana";

const { sendTransaction: sendTransactionEvm } = useSendTransaction();
const { sendTransaction: sendTransactionSolana } = useSendTransactionSolana();

// Send Ethereum transaction
const txHash = await sendTransactionEvm(
  { to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C", value: 10000 },
  { address: selectedWallet.address }
);

// Send Solana transaction
const receipt = await sendTransactionSolana({
  transaction: transaction,
  connection: connection,
  address: selectedWallet.address,
});
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
- [Next.js Documentation](https://nextjs.org/docs)
