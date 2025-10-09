# Privy + Expo Starter

This example showcases how to get started using Privy's Expo SDK inside an Expo React Native application.

## Getting Started

### 1. Clone the Project

```bash
mkdir -p privy-expo-starter && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=2 -C privy-expo-starter examples-main/privy-expo-starter && cd privy-expo-starter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Update the `app.json` file with your Privy app credentials:

```json
{
  "expo": {
    "extra": {
      "privyAppId": "your_app_id_here",
      "privyClientId": "your_client_id_here",
      "passkeyAssociatedDomain": "https://your-associated-domain.com"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp",
      "associatedDomains": ["webcredentials:your-associated-domain.com"]
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

**Important:**

- Configure an app client in your [Privy Dashboard](https://dashboard.privy.io/apps?page=settings&setting=clients)
- Add 'exp' to Allowed app URL schemas in the mobile client in your [Privy Dashboard](https://dashboard.privy.io/apps?page=settings&setting=clients)
- For Expo Go development, add `host.exp.Exponent` to Allowed app identifiers in your Dashboard
- For iOS passkey support, configure the `associatedDomains` and `passkeyAssociatedDomain`

### 4. Start Development Server

```bash
npm start
```

This will start the Expo development server. You can then:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your device

## Core Functionality

### 1. Login with Privy

Login or sign up using Privy's pre-built modals optimized for mobile.

[`app/index.tsx`](./app/index.tsx)

```tsx
import { usePrivy } from "@privy-io/expo";
const { user } = usePrivy();
// User is automatically shown LoginScreen if not authenticated
```

### 2. Create Multi-Chain Wallets

Programmatically create embedded wallets for multiple blockchains. Supports Ethereum, Solana, Bitcoin, and more.

[`components/userManagement/Wallets.tsx`](./components/userManagement/Wallets.tsx)

```tsx
import {
  useEmbeddedEthereumWallet,
  useEmbeddedSolanaWallet,
} from "@privy-io/expo";
import { useCreateWallet } from "@privy-io/expo/extended-chains";

const { create: createEthereumWallet } = useEmbeddedEthereumWallet();
const { create: createSolanaWallet } = useEmbeddedSolanaWallet();
const { createWallet } = useCreateWallet();

// Create Ethereum wallet
createEthereumWallet({ createAdditional: true });

// Create Solana wallet
createSolanaWallet({ createAdditional: true, recoveryMethod: "privy" });

// Create Bitcoin/other chain wallets
createWallet({ chainType: "bitcoin-segwit" });
```

### 3. Send Transactions

Send transactions on EVM-compatible chains with native mobile UX.

[`components/walletActions/EVMWalletActions.tsx`](./components/walletActions/EVMWalletActions.tsx)

```tsx
import { useEmbeddedEthereumWallet } from "@privy-io/expo";

const { wallets } = useEmbeddedEthereumWallet();
const wallet = wallets?.[0];
const provider = await wallet?.getProvider?.();

// Sign and send transaction
const response = await provider.request({
  method: "eth_sendTransaction",
  params: [
    {
      from: wallet.address,
      to: "0x0000000000000000000000000000000000000000",
      value: "1",
    },
  ],
});
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [Expo SDK](https://www.npmjs.com/package/@privy-io/expo)
- [Expo Documentation](https://docs.expo.dev/)
