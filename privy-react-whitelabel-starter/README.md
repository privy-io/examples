# Privy + Whitelabel Next.js Starter

This example showcases how to get started using Privy's React SDK inside a React + Vite application.Privy’s frontend SDKs let you fully customize embedded wallet experiences allowing you to match wallet flows to your app’s look and feel.

## Live Demo

[View Demo](https://whitelabel.privy.io/)

## Getting Started

### 1. Clone the Project

```bash
mkdir -p privy-react-whitelabel-starter && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=2 -C privy-react-whitelabel-starter examples-main/privy-react-whitelabel-starter && cd privy-react-whitelabel-starter
```

### 2. Install Dependencies

```bash
npm install
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
```

**Important:** Get your credentials from the [Privy Dashboard](https://dashboard.privy.io).

### 4. Configure Dashboard Settings

1. Enable desired login methods in the [Privy Dashboard](https://dashboard.privy.io/apps?page=login-methods)
2. [Optional] Enable guest accounts under Settings > Advanced settings > Guest accounts
3. [Optional] Enable smart wallets or remove SmartWalletProvider in `app/providers.tsx`

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Core Functionality

### 1. Custom Authentication UI

Build custom login interfaces with multiple authentication methods.

[`app/components/Login.tsx`](./app/components/Login.tsx)
```tsx
import { useLoginWithEmail, useLoginWithSms, useGuestAccounts } from "@privy-io/react-auth";

const { sendCode: sendCodeEmail, loginWithCode: loginWithCodeEmail } = useLoginWithEmail();
const { sendCode: sendCodeSms, loginWithCode: loginWithCodeSms } = useLoginWithSms();
const { createGuestAccount } = useGuestAccounts();

// Custom email login
sendCodeEmail({ email });
loginWithCodeEmail({ code: codeEmail });
```

### 2. Create Multi-Chain Wallets

Custom wallet creation interfaces for multiple blockchains.

[`app/components/Wallets.tsx`](./app/components/Wallets.tsx)
```tsx
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useCreateWallet as useCreateExtendedWallet } from "@privy-io/react-auth/extended-chains";

const { createWallet: createEthereumWallet } = usePrivy();
const { createWallet: createSolanaWallet } = useSolanaWallets();
const { createWallet: createExtendedWallet } = useCreateExtendedWallet();

// Create wallets with custom UI
createEthereumWallet({ createAdditional: true });
createSolanaWallet();
createExtendedWallet({ chainType: "cosmos" });
```

### 3. Custom Wallet Actions

Custom transaction interfaces with whitelabel design.

[`app/components/EthereumWallet.tsx`](./app/components/EthereumWallet.tsx)
```tsx
import { useSendTransaction, useSignMessage } from "@privy-io/react-auth";

const { sendTransaction } = useSendTransaction();
const { signMessage } = useSignMessage();

// Custom transaction UI
const txHash = await sendTransaction(
  { to: recipientAddress, value: amount },
  { address: wallet.address }
);
```
## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
- [Next.js Documentation](https://nextjs.org/docs)
