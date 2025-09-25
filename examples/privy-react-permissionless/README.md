# Account Abstraction + Privy

This example showcases how to get started using account abstraction with Privy's React SDK and Permissionless.js inside a Next.js application.

## Live Demo

[View Demo](https://permissionless-example.privy.io/)

## Quick Start

### 0. Dashboard setup
- Create an app in the Privy dashboard [here](https://dashboard.privy.io/)
- Set up a Pimlico project for Base Sepolia [here](https://dashboard.pimlico.io/)

### 1. Clone the Project

```bash
npx gitpick privy-io/examples/tree/main/examples/privy-react-permissionless && cd privy-react-permissionless
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

Update `.env.local` with your Privy app credentials and Pimlico configuration:

```env
# Public - Safe to expose in the browser
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here

# Pimlico Configuration (Base Sepolia)
# Get these from https://dashboard.pimlico.io/apikeys
NEXT_PUBLIC_PIMLICO_PAYMASTER_URL=your_pimlico_paymaster_url_here
NEXT_PUBLIC_PIMLICO_BUNDLER_URL=your_pimlico_bundler_url_here

# Private - Keep server-side only
PRIVY_APP_SECRET=your_app_secret_here

# Optional: Uncomment if using custom auth URLs or client IDs
# NEXT_PUBLIC_PRIVY_CLIENT_ID=your_client_id_here
# NEXT_PUBLIC_PRIVY_AUTH_URL=https://auth.privy.io
```

**Important:**
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep `PRIVY_APP_SECRET` private and server-side only.
- This app uses **Base Sepolia** testnet. Make sure to configure your Pimlico project for Base Sepolia in the [Pimlico dashboard](https://dashboard.pimlico.io/).

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Core Functionality

### 1. Login with Privy

Login or sign up using Privy's pre-built modals.

[`pages/index.tsx`](./pages/index.tsx)
```tsx
import { usePrivy } from "@privy-io/react-auth";
const { login } = usePrivy();
login();
```

### 2. Create Smart Accounts

Create embedded wallets

[`hooks/SmartAccountContext.tsx`](./hooks/SmartAccountContext.tsx)
```tsx
import { useCreateWallet } from "@privy-io/react-auth";
const { createWallet } = useCreateWallet();
createWallet({ createAdditional: true });
```

### 3. Mint NFT with Gas Sponsorship

Create smart accounts with gas sponsorship using Permissionless.js and Pimlico. Users can mint NFTs without paying gas fees.

[`hooks/SmartAccountContext.tsx`](./hooks/SmartAccountContext.tsx)
```tsx
import { signerToSafeSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { createPimlicoBundlerClient, createPimlicoPaymasterClient } from "permissionless/clients/pimlico";

const safeAccount = await signerToSafeSmartAccount(publicClient, {
  signer: customSigner,
  safeVersion: '1.4.1',
  entryPoint: ENTRYPOINT_ADDRESS_V07
});

const smartAccountClient = createSmartAccountClient({
  account: safeAccount,
  entryPoint: ENTRYPOINT_ADDRESS_V07,
  chain: baseSepolia,
  bundlerTransport: http(process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL),
  middleware: {
    sponsorUserOperation: pimlicoPaymaster.sponsorUserOperation,
    gasPrice: async () => (await pimlicoBundler.getUserOperationGasPrice()).fast,
  },
});
```

## Relevant Links

- [Privy + Account Abstraction integration guide](https://docs.privy.io/recipes/account-abstraction/custom-implementation#safe)
- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
- [Permissionless.js Documentation](https://docs.pimlico.io/permissionless)
- [Safe Smart Accounts](https://docs.safe.global/)
