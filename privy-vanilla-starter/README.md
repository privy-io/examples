# Privy + Vanilla JS Starter

This example showcases how to get started using Privy's Core JS SDK inside a pure vanilla JavaScript application without any frontend framework.


## Getting Started

### 1. Clone the Project

```bash
mkdir -p privy-vanilla-starter && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=2 -C privy-vanilla-starter examples-main/privy-vanilla-starter && cd privy-vanilla-starter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and configure your Privy app credentials:

```bash
cp env.sample .env
```

Update `.env` with your Privy app credentials:

```env
# Public - Safe to expose in the browser
VITE_PRIVY_APP_ID=your_app_id_here
VITE_PRIVY_APP_CLIENT_ID=your_client_id_here  # Optional
```

**Important:** Variables prefixed with `VITE_` are exposed to the browser. Get your credentials from the [Privy Dashboard](https://dashboard.privy.io).

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the application.

## Core Functionality

### 1. Initialize Privy Client

Initialize the Core JS SDK with your app credentials and set up the embedded wallet iframe.

[`src/lib/privy-client.js`](./src/lib/privy-client.js)

```javascript
import Privy, { LocalStorage } from '@privy-io/js-sdk-core';

const privy = new Privy({
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  clientId: import.meta.env.VITE_PRIVY_APP_CLIENT_ID,
  storage: new LocalStorage()
});

// Setup iframe for embedded wallet
const iframe = document.getElementById('privy-iframe');
iframe.src = privy.embeddedWallet.getURL();

privy.setMessagePoster(iframe.contentWindow);
window.addEventListener('message', (e) => {
  privy.embeddedWallet.onMessage(e.data);
});
```

### 2. Authenticate with Email

Login or sign up using passwordless email authentication with OTP codes.

[`src/ui/auth-manager.js`](./src/ui/auth-manager.js)

```javascript
// Send OTP code
await privy.auth.email.sendCode(email);

// Verify code and login
const session = await privy.auth.email.loginWithCode(
  email,
  code,
  undefined,
  {
    ethereum: { createOnLogin: 'user-without-wallets' },
    solana: { createOnLogin: 'user-without-wallets' }
  }
);
```

### 3. Create Embedded Wallets

Programmatically create embedded wallets for Ethereum and Solana blockchains.

[`src/sections/create-wallet.js`](./src/sections/create-wallet.js)

```javascript
// Create Ethereum wallet
await privy.embeddedWallet.create({});

// Create Solana wallet
await privy.embeddedWallet.createSolana();
```

### 4. Sign Messages and Transactions

Send transactions on both Ethereum and Solana with comprehensive wallet action support.

[`src/sections/wallet-actions.js`](./src/sections/wallet-actions.js)

```javascript
import {
  getUserEmbeddedEthereumWallet,
  getUserEmbeddedSolanaWallet,
  getEntropyDetailsFromUser
} from '@privy-io/js-sdk-core';

// Get wallet and entropy details
const wallet = getUserEmbeddedEthereumWallet(user);
const { entropyId, entropyIdVerifier } = getEntropyDetailsFromUser(user);

// Get provider
const provider = await privy.embeddedWallet.getEthereumProvider({
  wallet,
  entropyId,
  entropyIdVerifier
});

// Sign message
const signature = await provider.request({
  method: 'personal_sign',
  params: ['Hello, world!', wallet.address]
});

// Send transaction
const txHash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{
    from: wallet.address,
    to: wallet.address,
    value: '0x0',
    chainId: chainId
  }]
});
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [Core JS SDK Recipe](https://docs.privy.io/recipes/core-js)

