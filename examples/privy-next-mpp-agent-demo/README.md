# MPP Agent Demo

A demo application showcasing the [MPP](https://machinepayments.dev) (Machine Payments Protocol) with [Privy's](https://privy.io) agentic wallets.

## What is MPP?

[MPP](https://machinepayments.dev) is a protocol that enables machine-to-machine payments over HTTP. When a service requires payment, it returns HTTP status `402 Payment Required` with payment details. The client then signs a payment credential and retries the request. Settlement happens on the Tempo blockchain using PathUSD.

This demo shows how AI agents can use MPP to autonomously pay for services.

## What This Demo Shows

1. **Agent Creation**: Create an AI agent with its own Ethereum wallet via Privy
2. **Wallet Funding**: Fund agent wallets with PathUSD from an app-level treasury
3. **MPP Payments**: Execute autonomous payments on the Tempo blockchain

## Demo Flow

1. User clicks "Create Agent" -> creates a new wallet via Privy
2. User selects $0.10, $0.50, or $1.00 to deposit into the agent's wallet
3. User can execute an action:
   - **Fetch Weather** ($0.10) - Agent pays via MPP

## Tech Stack

- **Protocol**: [MPP](https://machinepayments.dev) - Machine Payments Protocol
- **Wallets**: [@privy-io/node](https://www.npmjs.com/package/@privy-io/node) - Server-side agentic wallets
- **MPP SDK**: [mppx](https://www.npmjs.com/package/mppx) - Client and server middleware
- **Blockchain**: Tempo with PathUSD
- **Framework**: Next.js with App Router
- **Ethereum**: [viem](https://viem.sh)
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- A [Privy](https://dashboard.privy.io) account with App ID and Secret
- A treasury wallet created via the Privy dashboard, funded with PathUSD on Tempo

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
   MPP_RECIPIENT=0x...your-tempo-recipient-address
   ```

### Running the Demo

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the demo.

## How MPP Works

```
┌─────────────────┐                    ┌─────────────────┐
│   AI Agent      │ ── GET /weather ──▶│   MPP Service   │
│   (with wallet) │                    │                 │
│                 │◀── 402 + payment ──│                 │
│                 │    requirements    │                 │
│                 │                    │                 │
│                 │ ── GET /weather ──▶│                 │
│                 │    + payment       │                 │
│                 │    credential      │                 │
│                 │                    │                 │
│                 │◀── 200 + data ─────│                 │
└─────────────────┘                    └─────────────────┘
```

1. Agent requests a resource
2. Service returns `402 Payment Required` with payment details (amount, recipient, currency)
3. MPP client signs a payment credential using the agent's Privy wallet
4. Agent retries request with the signed payment credential
5. Service verifies the credential, settles on Tempo, and returns the requested resource

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
                        │   MPP Client     │
                        │   (mppx)         │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Mock Services   │
                        │  (mppx/nextjs)   │
                        └──────────────────┘
```

## Key Files

- `lib/privy.ts` - Privy client configuration and wallet management
- `lib/mpp-client.ts` - MPP fetch wrapper with Privy signing
- `lib/network.ts` - Tempo network configuration
- `lib/treasury.ts` - Treasury wallet funding logic
- `app/api/agent/` - API routes for agent operations
- `app/api/mock-services/` - MPP-enabled service endpoints

## Learn More

- [MPP Protocol](https://machinepayments.dev)
- [mppx SDK](https://www.npmjs.com/package/mppx)
- [Privy Agentic Wallets](https://docs.privy.io/recipes/wallets/agentic-wallets)

## License

MIT
