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

## Optional preflight before signing (Base mainnet)

The default testnet demo is unchanged. Operators can explicitly set
`SPENDPREFLIGHT_ENABLED=true` together with `NETWORK_MODE=mainnet` to screen
each selected x402 quote with [SpendPreflight](https://spendpreflight.com)
before Privy creates a payment payload. This contribution is from SpendPreflight's
operator; Privy does not endorse the service.

The hook sends the selected payment quote and actual HTTPS resource URL to
`https://api.spendpreflight.com/v1/preflight?trial=1` using ordinary fetch.
It does not send Privy credentials, wallet IDs, signatures, request headers or
merchant request bodies. See the [service privacy policy](https://spendpreflight.com/privacy).
The free trial is **three calls per day per public IP, shared with MCP**.
After the trial, HTTP 402 stops the merchant payment; this example never pays
for screening automatically. Paid preflight currently costs $0.02 per review
and requires a separately configured screening buyer, outside this example.

Only exact Base USDC quotes up to $1 are admitted locally. `hold`, `block`,
invalid results, an unavailable service, an eight-second timeout or exhausted
trial abort before signing or retrying the merchant. The hook checks the returned
receipt ID's presence; it does **not** cryptographically verify the receipt.
This is a screening signal, not a guarantee of merchant identity, delivery or
safety. Keep Privy's spending policies: the hook supplies no durable daily budget
or settlement ledger. Localhost and testnet deployments cannot use this opt-in
mode; deploy the merchant demo at an HTTPS URL before enabling it.

Run the network-free tests (mock mechanism; no wallet, signing or payments):

```bash
npm test
npm run typecheck
npm run build
```

## Learn More

- [x402 Protocol](https://x402.org)
- [x402 Documentation](https://docs.x402.org)
- [x402 Quickstart for Buyers](https://docs.x402.org/getting-started/quickstart-for-buyers)
- [Privy Agentic Wallets](https://docs.privy.io/recipes/wallets/agentic-wallets)
- [Privy x402 Integration](https://docs.privy.io/recipes/x402)

## License

MIT
