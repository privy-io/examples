# x402 Agent Demo

A demo application showcasing the [x402](https://x402.org) payment protocol with [Privy's](https://privy.io) agentic wallets.

## What is x402?

[x402](https://x402.org) is an open protocol that enables machine-to-machine payments over HTTP. When a service requires payment, it returns HTTP status `402 Payment Required` with payment details. The client then signs a payment authorization and retries the request.

This demo shows how AI agents can use x402 to autonomously pay for services within policy-defined limits.

## What This Demo Shows

1. **Agent Creation**: Create an AI agent with its own Ethereum wallet via Privy
2. **Wallet Funding**: Fund agent wallets with USDC from an app-level treasury
3. **Spending Policies**: Configure transaction limits to protect funds
4. **x402 Payments**: Execute autonomous payments that either succeed or get rejected based on policy

## Demo Flow

1. User clicks "Create Agent" -> creates a new wallet via Privy
2. User selects $0.10, $0.50, or $1.00 to deposit into the agent's wallet
3. User accepts the $1/transaction spending policy
4. User can execute two actions:
   - **Fetch Weather** ($0.10) - Succeeds because it's under the policy limit
   - **Buy Sweater** ($5.00) - Fails because it exceeds the $1 policy limit

## Tech Stack

- **Protocol**: [x402](https://x402.org) - HTTP 402 payment protocol
- **Wallets**: [@privy-io/node](https://www.npmjs.com/package/@privy-io/node) - Server-side agentic wallets
- **x402 Client**: [@x402/fetch](https://www.npmjs.com/package/@x402/fetch), [@x402/evm](https://www.npmjs.com/package/@x402/evm)
- **Settlement**: [Stripe](https://stripe.com) - Crypto payment settlement
- **Framework**: Next.js with App Router
- **Ethereum**: [viem](https://viem.sh)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- A [Privy](https://dashboard.privy.io) account with App ID and Secret
- A treasury wallet created via the Privy dashboard, funded with USDC
- A [Stripe](https://dashboard.stripe.com) account with a secret key (for settlement)

### Installation

```bash
npm install
```

### Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials (see `.env.example` for all options):
   ```env
   PRIVY_APP_ID=your-app-id
   PRIVY_APP_SECRET=your-app-secret
   TREASURY_WALLET_ID=your-treasury-wallet-id
   STRIPE_SECRET_KEY=sk_test_...
   NETWORK_MODE=testnet
   ```

3. Get testnet USDC from [Circle's faucet](https://faucet.circle.com/) and fund your treasury wallet.

### Running the Demo

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## How x402 Works

```
┌─────────────────┐                    ┌─────────────────┐
│   AI Agent      │ ── GET /weather ──▶│   x402 Service  │
│   (with wallet) │                    │                 │
│                 │◀── 402 + payment ──│                 │
│                 │    requirements    │                 │
│                 │                    │                 │
│                 │ ── GET /weather ──▶│                 │
│                 │    + X-PAYMENT     │                 │
│                 │    header (signed) │                 │
│                 │                    │                 │
│                 │◀── 200 + data ─────│                 │
└─────────────────┘                    └─────────────────┘
```

1. Agent requests a resource
2. Service returns `402 Payment Required` with payment details (amount, recipient, network)
3. Agent signs an EIP-712 payment authorization using Privy
4. Agent retries request with `X-PAYMENT` header containing the signed authorization
5. Service validates payment and returns the requested resource

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   API Routes     │────▶│   Privy SDK     │
│   (React)       │     │   (Next.js)      │     │   (@privy-io/   │
│                 │     │                  │     │    node)        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   x402 Client    │
                        │   (@x402/fetch)  │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Mock Services   │
                        │  (Weather/Shop)  │
                        └──────────────────┘
```

## Key Files

- `lib/privy.ts` - Privy client configuration, wallet creation, and policy management
- `lib/network.ts` - Network configuration (mainnet/testnet toggle)
- `lib/x402-client.ts` - Server-side x402 fetch wrapper
- `lib/x402-server.ts` - x402 resource server with Stripe settlement
- `lib/x402-settlement.ts` - Direct EIP-3009 on-chain settlement
- `lib/treasury.ts` - Treasury wallet funding logic
- `lib/policies.ts` - Spending policy validation
- `app/api/agent/` - API routes for agent operations
- `app/api/mock-services/` - x402-enabled service endpoints

## Learn More

- [x402 Protocol](https://x402.org)
- [x402 Documentation](https://docs.x402.org)
- [x402 Quickstart for Buyers](https://docs.x402.org/getting-started/quickstart-for-buyers)
- [Privy Agentic Wallets](https://docs.privy.io/recipes/wallets/agentic-wallets)
- [Privy x402 Integration](https://docs.privy.io/recipes/x402)

## License

MIT
