# Privy + ZeroDev Session Keys Demo

This example showcases how to integrate Privy's embedded wallets with ZeroDev session keys for automated transaction execution.

## Getting Started

### 1. Clone the Project

```bash
mkdir -p privy-next-starter && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=2 -C privy-next-starter privy-examples-main/privy-next-starter && cd privy-next-starter
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the example environment file and configure your Privy app credentials:

```bash
cp .env.sample .env.local
```

Update `.env.local` with your Privy app credentials:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_PRIVY_SIGNER_ID=your_signer_id_here

# ZeroDev Configuration
NEXT_PUBLIC_ZERODEV_RPC=your_zerodev_rpc_url
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

### 2. Create Ethereum Wallet

Programmatically create embedded wallets for multiple blockchains. Supports Ethereum, Solana, Bitcoin, and more.

[`src/components/sections/create-a-wallet.tsx`](./src/components/sections/create-a-wallet.tsx)

```tsx
import { useCreateWallet } from "@privy-io/react-auth";

const { createWallet: createWalletEvm } = useCreateWallet();

// Create Ethereum wallet
createWalletEvm({ createAdditional: true });
```

### 3. Privy + ZeroDev Smart Account Integration

This section shows the complete integration between Privy embedded wallets and ZeroDev smart accounts with server-side session keys.

[`src/components/sections/zerodev-session-keys.tsx`](./src/components/sections/zerodev-session-keys.tsx)

**Architecture Flow:**

1. **Privy Wallet** Creates ZeroDev Smart Account
2. **Server** Generates session key pair
3. **Privy Wallet** Approves server's session key
4. **Server** Executes transactions autonomously

```tsx
// 1. Create smart account with Privy wallet as owner
// Create ECDSA validator for the Privy wallet
const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
  entryPoint,
  signer: privyWalletSigner,
  kernelVersion: KERNEL_V3_1,
});

// Create the smart account with Privy wallet as owner
const smartAccount = await createKernelAccount(publicClient, {
  entryPoint,
  plugins: {
    sudo: ecdsaValidator,
  },
  kernelVersion: KERNEL_V3_1,
});


// 2. Server generates session key
const sessionPrivateKey = generatePrivateKey();
const sessionKeyAccount = privateKeyToAccount(sessionPrivateKey);

// 3. Privy wallet approves server session key
const approval = await serializePermissionAccount(sessionKeyAccount);

// 4. Server executes transaction using session key
const userOpHash = await kernelClient.sendUserOperation({
  callData: await sessionKeyAccount.encodeCalls([...]),
});
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [ZeroDev Dashboard](https://dashboard.zerodev.app/)
- [ZeroDev Documentation](https://docs.zerodev.app/)
- [Zerodev Session Keys Documentation](https://docs.zerodev.app/sdk/permissions/intro)
