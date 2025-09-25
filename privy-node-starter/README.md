# Privy + Node.js Server Starter

This example showcases how to get started using Privy's Node.js SDK in a server-side Express.js application.

## Getting Started

### 1. Clone the Project

```bash
npx gitpick privy-io/examples/tree/main/privy-node-starter && cd privy-node-starter
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

Update `.env` with your Privy app credentials and treasury configuration:

```env
# Privy App Credentials
PRIVY_APP_ID=your_app_id_here
PRIVY_APP_SECRET=your_app_secret_here

# Treasury Configuration
TREASURY_WALLET_ID=your_treasury_wallet_id
TREASURY_WALLET_ADDRESS=your_treasury_wallet_address
TREASURY_AUTHORIZATION_KEY=your_base64_encoded_private_key
TREASURY_OWNER_ID=your_treasury_owner_id

# Key Quorum Configuration
TREASURY_QUORUM_PRIVATE_KEY=your_base64_encoded_private_key
TREASURY_QUORUM_PUBLIC_KEY=your_base64_encoded_public_key

# Policy Configuration
ALLOWLIST_USDC_POLICY_ID=your_allowlist_policy_id
```

**Important:** Get your credentials from the [Privy Dashboard](https://dashboard.privy.io). Never expose `PRIVY_APP_SECRET` in client-side code.

### 4. Start Development Server

```bash
npm run dev
```

The server will start on [http://localhost:3300](http://localhost:3300).

## Core Functionality

### 1. Initialize Privy Server Client

Server-side initialization with app credentials.

[`src/lib/privy.ts`](./src/lib/privy.ts)
```typescript
import { PrivyClient } from "@privy-io/node";

export const privy = new PrivyClient({
  appId: PRIVY_APP_ID,
  appSecret: PRIVY_APP_SECRET,
});
```

### 2. Create Wallets with Key Quorums

Create wallets owned by multi-signature key quorums for enhanced security.

[`src/handlers/key_quorums/create_wallet.ts`](./src/handlers/key_quorums/create_wallet.ts)
```typescript
import { privy } from "../../lib/privy";

// Create 2-of-2 key quorum
const keyQuorum = await privy.keyQuorums().create({
  public_keys: [public_key, TREASURY_QUORUM_PUBLIC_KEY],
  authorization_threshold: 2,
  display_name: `Treasury 2-of-2 Key Quorum with ${alias}`,
});

// Create wallet owned by key quorum
const wallet = await privy.wallets().create({
  chain_type: "ethereum",
  owner_id: keyQuorum.id,
});
```

### 3. Send USDC Transactions

Execute server-side USDC transactions with policy enforcement.

[`src/handlers/transactions/send_usdc.ts`](./src/handlers/transactions/send_usdc.ts)
```typescript
import { privy } from "../../lib/privy";

// Send USDC with treasury approval
const transactionRequest = await privy.transactions().create({
  wallet_id: TREASURY_WALLET_ID,
  chain_type: "ethereum",
  // Transaction details configured server-side
});
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [Node.js SDK](https://www.npmjs.com/package/@privy-io/node)
- [Express.js Documentation](https://expressjs.com/)
