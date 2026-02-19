# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **x402 Agent Demo** - a reference implementation showcasing the [x402](https://x402.org) payment protocol with [Privy's](https://privy.io) server-side agentic wallets. The x402 protocol enables machine-to-machine HTTP payments using the `402 Payment Required` status code.

The demo allows users to create AI agents with their own Ethereum wallets, fund them, set spending policies, and execute autonomous x402 payments.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Privy branding
- **Wallet SDK**: `@privy-io/node` (server-side)
- **Payments**: `@x402/fetch`, `@x402/evm` (x402 protocol)
- **Settlement**: `stripe` (Stripe crypto payment settlement)
- **Ethereum**: `viem` for encoding/utilities

## Essential Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Repository Structure

```
/app/                           # Next.js App Router
├── page.tsx                    # Landing page - agent creation
├── agent/[id]/
│   ├── page.tsx                # Agent dashboard - actions
│   ├── fund/page.tsx           # Funding step - deposit USDC
│   └── policy/page.tsx         # Policy step - configure spending limits
├── api/
│   ├── agent/
│   │   ├── create/route.ts     # POST - creates agent + wallet via Privy
│   │   ├── fund/route.ts       # POST - transfers USDC from treasury
│   │   ├── policy/route.ts     # POST - updates spending policy
│   │   └── execute/route.ts    # POST - executes x402 actions with policy
│   └── mock-services/
│       ├── weather/route.ts    # GET - x402 weather API ($0.10)
│       └── sweater/route.ts    # GET - x402 sweater API ($5.00)
├── layout.tsx
└── globals.css                 # Privy-branded styles

/components/                    # React components
├── Logo.tsx                    # Privy logo
├── AgentCard.tsx               # Displays agent wallet info
├── StepIndicator.tsx           # Wizard step progress indicator
├── ActionCard.tsx              # Weather/Sweater action buttons
└── TransactionResult.tsx       # Success/failure result display

/lib/                           # Core business logic
├── privy.ts                    # Privy client (lazy init) + wallet/policy management
├── network.ts                  # Network config (mainnet/testnet toggle)
├── treasury.ts                 # USDC transfer logic
├── x402-client.ts              # x402 fetch wrapper with Privy signing
├── x402-server.ts              # x402 resource server + Stripe settlement
├── x402-settlement.ts          # Direct EIP-3009 on-chain settlement
├── x402-utils.ts               # Payment encoding utilities
└── policies.ts                 # Policy validation logic
```

## Key Concepts

### Privy Node SDK

The Privy client is lazily initialized to avoid build-time errors:

```typescript
import { PrivyClient } from '@privy-io/node';

// Use getPrivyClient() instead of direct instantiation
export function getPrivyClient(): PrivyClient {
  // Lazy init with env vars
}

// Wallet creation
const wallet = await getPrivyClient().wallets().create({
  chain_type: 'ethereum',
});

// Signing (note the parentheses on wallets() and ethereum())
await getPrivyClient().wallets().ethereum().signTypedData(walletId, { params: {...} });
await getPrivyClient().wallets().ethereum().sendTransaction(walletId, { caip2, params: {...} });
```

### Policy Engine

Policies validate transactions before execution:

```typescript
interface AgentPolicy {
  maxPerTransaction: number;  // Max cents per transaction
  accepted: boolean;          // User must accept policy
}

// Validation returns { allowed: boolean, reason?: string }
const result = validateTransaction(policy, costCents);
```

### Demo Flow

1. User clicks "Create Agent" → `POST /api/agent/create` → creates Privy wallet
2. User funds wallet with $0.10, $0.50, or $1.00 USDC from treasury
3. User configures spending policy (default $1/transaction)
4. User executes actions:
   - **Weather** ($0.10) → succeeds (under policy)
   - **Sweater** ($5.00) → rejected by policy

### x402 Payment Flow

The services return x402 payment requirements:

```typescript
// 402 response with payment requirements
// Network and asset are configured via NETWORK_MODE env var
{
  x402Version: 2,
  accepts: [{
    scheme: 'exact',
    network: 'eip155:84532',  // CAIP-2 chain ID (testnet) or 'eip155:8453' (mainnet)
    amount: '100000',  // USDC base units
    asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',  // USDC contract (varies by network)
    payTo: '0x...',  // Stripe deposit address
  }]
}
```

The x402 client signs EIP-712 typed data via Privy and retries with `X-PAYMENT` header.

## Environment Variables

```env
# Required
PRIVY_APP_ID=your-app-id
PRIVY_APP_SECRET=your-app-secret
TREASURY_WALLET_ID=your-treasury-wallet-id
STRIPE_SECRET_KEY=sk_test_...

# Network mode: 'testnet' (Base Sepolia) or 'mainnet' (Base)
# Chain ID and USDC contract are derived automatically from this setting
# - testnet: eip155:84532, USDC 0x036CbD53842c5426634e7929541eC2318f3dCF7e
# - mainnet: eip155:8453, USDC 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NETWORK_MODE=testnet

# Optional
FACILITATOR_URL=https://x402.org/facilitator
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Styling Conventions

- Uses Privy brand colors: violet (`#8B5CF6`), offblack (`#0f0f10`)
- Tailwind for layout and spacing
- Card-based UI with subtle shadows and hover effects

## API Route Patterns

All API routes use Next.js App Router format:

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  // ... logic
  return NextResponse.json({ success: true, data });
}
```

## Common Tasks

### Adding a New Action

1. Add cost to `ACTION_COSTS` in `app/api/agent/execute/route.ts`
2. Create x402 service endpoint in `app/api/mock-services/[action]/route.ts`
3. Add ActionCard in the agent dashboard page (`app/agent/[id]/page.tsx`)

### Modifying Policy Rules

Edit `lib/policies.ts`:
- `DEFAULT_POLICY` for default values
- `validateTransaction()` for validation logic

### Changing Branding

- Colors: `app/globals.css` CSS variables
- Logo: `components/Logo.tsx`
- Layout: `app/layout.tsx`

## Troubleshooting

### Port Already in Use
Next.js will automatically use the next available port (3001, 3002, etc.)

### Turbopack Crash
Clear the cache: `rm -rf .next && npm run dev`

### Privy API Errors
- Check env vars are set correctly
- Verify app ID/secret in Privy dashboard
- Privy methods use `()` accessors: `wallets().ethereum().signTypedData()`

### x402 Payment Issues
- Ensure wallet has USDC (not just ETH)
- Check network matches your `NETWORK_MODE` setting (testnet = Base Sepolia, mainnet = Base)
- Verify Privy wallet has signing permissions
- Ensure `STRIPE_SECRET_KEY` is set for settlement

## Resources

- [Privy Node SDK](https://www.npmjs.com/package/@privy-io/node)
- [Privy Agentic Wallets Docs](https://docs.privy.io/recipes/wallets/agentic-wallets)
- [x402 Protocol](https://x402.org)
- [x402 Quickstart for Buyers](https://docs.x402.org/getting-started/quickstart-for-buyers)
