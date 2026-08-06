# Privy + Solana Next.js Starter

This example showcases how to get started using Solana with Privy's React SDK inside a Next.js application.

## 📖 Related Recipe

For a step-by-step guide on getting started with Privy and Solana, check out our [Getting Started with Privy and Solana Recipe](https://docs.privy.io/recipes/solana/getting-started-with-privy-and-solana) in the Privy documentation.

## Live Demo

[View Demo]({{DEPLOY_URL}})

## Quick Start

### 1. Clone the Project

```bash
mkdir -p privy-next-solana && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=3 -C privy-next-solana examples-main/examples/privy-next-solana && cd privy-next-solana
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

### Using wallet-adapter-based SDKs

Some Solana SDKs, including Metaplex Umi and Irys, expect a
`@solana/wallet-adapter`-style signer whose `signTransaction` method receives
and returns `Transaction` or `VersionedTransaction` objects. Privy's Solana
wallet methods receive serialized transaction bytes, so those SDKs need a small
adapter layer at the integration boundary.

If your integration does not already depend on `@solana/web3.js`, add it before
using this adapter.

```tsx
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

function createSolanaWalletAdapter(wallet: {
  address: string;
  signMessage: (args: { message: Uint8Array }) => Promise<{ signature: Uint8Array }>;
  signTransaction: (args: {
    transaction: Uint8Array;
  }) => Promise<{ signedTransaction: Uint8Array }>;
}) {
  const adapter = {
    publicKey: new PublicKey(wallet.address),
    signMessage: async (message: Uint8Array) => {
      const { signature } = await wallet.signMessage({ message });
      return new Uint8Array(signature);
    },
    signTransaction: async <T extends Transaction | VersionedTransaction>(
      transaction: T,
    ): Promise<T> => {
      const serialized =
        transaction instanceof VersionedTransaction
          ? transaction.serialize()
          : transaction.serialize({ requireAllSignatures: false });

      const { signedTransaction } = await wallet.signTransaction({
        transaction: serialized,
      });

      return (
        transaction instanceof VersionedTransaction
          ? VersionedTransaction.deserialize(signedTransaction)
          : Transaction.from(signedTransaction)
      ) as T;
    },
    signAllTransactions: async <T extends Transaction | VersionedTransaction>(
      transactions: T[],
    ) => Promise.all(transactions.map((transaction) => adapter.signTransaction(transaction))),
  };

  return adapter;
}
```

Use this adapter when passing a Privy Solana wallet into APIs that expect a
wallet-adapter signer, for example `createSignerFromWalletAdapter(...)`.

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
