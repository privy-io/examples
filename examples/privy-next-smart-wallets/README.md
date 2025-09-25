# Privy + Smart Wallets

This example showcases how to get started using Multi-Chain EVM smart wallets with Privy's React SDK inside a Next.js application.

## Live Demo

[View Demo]({{DEPLOY_URL}})

## Quick Start

### 0. Dashboard set up
- Create an app in the Privy dashboard [here](https://dashboard.privy.io/)
- Configure the dashboard to enable smart wallets [here](https://docs.privy.io/wallets/using-wallets/evm-smart-wallets/setup/configuring-dashboard)

### 1. Clone the Project

```bash
npx gitpick privy-io/examples/tree/main/examples/privy-next-smart-wallets && cd privy-next-smart-wallets
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
NEXT_PUBLIC_PRIVY_SIGNER_ID=your_signer_id_here

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

### 1. Setup Smart Wallets Provider

Configure your app to use smart wallets by wrapping your PrivyProvider with the SmartWalletsProvider.

[`src/providers/providers.tsx`](./src/providers/providers.tsx)
```tsx
import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}>
      <SmartWalletsProvider>
        {children}
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}
```

### 2. Create Smart Wallets

Create embedded wallets, smart wallets are automatically provisioned when the SmartWalletsProvider is configured.

[`src/components/sections/create-a-wallet.tsx`](./src/components/sections/create-a-wallet.tsx)
```tsx
import { useCreateWallet } from "@privy-io/react-auth";
const { createWallet: createWalletEvm } = useCreateWallet();

// Create Ethereum embedded wallet (smart wallet created automatically!)
createWalletEvm({ createAdditional: true });

```

### 3. Send Batch Transactions

Send batch transactions, sign messages and typed data, manage session signers, and switch between chains using smart wallets.

[`src/components/sections/evm-smart-wallet-actions.tsx`](./src/components/sections/evm-smart-wallet-actions.tsx)
```tsx
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { encodeFunctionData, erc20Abi } from "viem";

const { client } = useSmartWallets();

// Send batch transaction
client.sendTransaction({
  calls: [
    {
      to: USDC_ADDRESS,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress, amount],
      }),
    },
    {
      to: USDC_ADDRESS,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipientAddress, amount],
      }),
    },
  ],
});
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
- [Smart Wallets Guide](https://docs.privy.io/guide/react/smart-wallets)
- [Session Keys Guide](https://docs.privy.io/guide/react/recipes/misc/session-keys)
