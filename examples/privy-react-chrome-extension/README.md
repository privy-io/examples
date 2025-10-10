# Privy + React Starter

This example showcases how to get started using Privy's React SDK inside a React + Vite application.

## 📖 Related Recipe

For a step-by-step guide on Chrome extension authentication, check out our [Chrome Extension Authentication Recipe](https://docs.privy.io/recipes/react/chrome-extension) in the Privy documentation.

## Getting Started

### 1. Clone the Project

```bash
mkdir -p privy-react-chrome-extension && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=3 -C privy-react-chrome-extension examples-main/examples/privy-react-chrome-extension && cd privy-react-chrome-extension
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and configure your Privy app credentials:

```bash
cp .env.example .env
```

Update `.env` with your Privy app credentials:

```env
# Vite Environment Variables (exposed to browser)
VITE_PRIVY_APP_ID=your_app_id_here
VITE_PRIVY_CLIENT_ID=your_client_id_here
VITE_PRIVY_SIGNER_ID=your_signer_id_here
```

**Important:** Variables prefixed with `VITE_` are exposed to the browser. Get your credentials from the [Privy Dashboard](https://dashboard.privy.io).

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the application.

## Core Functionality

### 1. Login with Privy

Login or sign up using Privy's pre-built modals.

[`src/App.tsx`](./src/App.tsx)

```tsx
import { usePrivy } from "@privy-io/react-auth";
const { login } = usePrivy();
login();
```

### 2. Create Multi-Chain Wallets

Programmatically create embedded wallets for multiple blockchains.

[`src/components/create-wallet-card.tsx`](./src/components/create-wallet-card.tsx)

```tsx
import { useCreateWallet, useSolanaWallets } from "@privy-io/react-auth";
import { useCreateWallet as useCreateWalletExtendedChains } from "@privy-io/react-auth/extended-chains";

const { createWallet: createWalletEvm } = useCreateWallet();
const { createWallet: createWalletSolana } = useSolanaWallets();
const { createWallet: createWalletExtendedChains } =
  useCreateWalletExtendedChains();

// Create Ethereum wallet
createWalletEvm({ createAdditional: true });

// Create Solana wallet
createWalletSolana({ createAdditional: true });

// Create Bitcoin/other chain wallets
createWalletExtendedChains({ chainType: "bitcoin-segwit" });
```

### 3. Send Transactions

Send transactions on both Ethereum and Solana.

[`src/components/wallet-actions-card.tsx`](./src/components/wallet-actions-card.tsx)

```tsx
import { useSendTransaction } from "@privy-io/react-auth";
import { useSendTransaction as useSendTransactionSolana } from "@privy-io/react-auth/solana";

const { sendTransaction: sendTransactionEvm } = useSendTransaction();
const { sendTransaction: sendTransactionSolana } = useSendTransactionSolana();

// Send Ethereum transaction
const txHash = await sendTransactionEvm(
  { to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C", value: 10000 },
  { address: walletsEvm[0]?.address }
);

// Send Solana transaction
const receipt = await sendTransactionSolana({
  transaction: transaction,
  connection: connection,
  address: walletsSolana[0].address,
});
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
- [Vite Documentation](https://vitejs.dev/)
