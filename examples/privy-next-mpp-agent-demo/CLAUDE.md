# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **MPP Agent Demo** - a reference implementation showcasing the [MPP](https://machinepayments.dev) (Machine Payments Protocol) with [Privy's](https://privy.io) server-side agentic wallets. MPP enables machine-to-machine HTTP payments using the `402 Payment Required` status code.

The demo allows users to create AI agents with their own Ethereum wallets, fund them with PathUSD, and execute autonomous MPP payments on the Tempo blockchain.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Privy branding
- **Wallet SDK**: `@privy-io/node` (server-side)
- **Payments**: `mppx` (MPP client and server SDK)
- **Blockchain**: Tempo with PathUSD
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
│   ├── page.tsx                # Agent dashboard - actions (step 3)
│   └── fund/page.tsx           # Funding step - deposit PathUSD (step 2)
├── api/
│   ├── agent/
│   │   ├── create/route.ts     # POST - creates agent + wallet via Privy
│   │   ├── fund/route.ts       # POST - transfers PathUSD from treasury
│   │   └── execute/route.ts    # POST - executes MPP actions
│   └── mock-services/
│       └── weather/route.ts    # GET - MPP weather API ($0.10)
├── layout.tsx
└── globals.css                 # Privy-branded styles

/components/                    # React components
├── Logo.tsx                    # Privy logo
├── AgentCard.tsx               # Displays agent wallet info
├── StepIndicator.tsx           # 3-step wizard progress indicator
├── ActionCard.tsx              # Weather action button
└── TransactionResult.tsx       # Success/failure result display

/lib/                           # Core business logic
├── privy.ts                    # Privy client (lazy init) + wallet management
├── mpp-client.ts               # MPP fetch wrapper with Privy signing
├── network.ts                  # Network config (Tempo)
├── treasury.ts                 # PathUSD transfer logic
└── policies.ts                 # USD formatting utilities
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

### MPP Payment Flow

MPP simplifies the payment flow:

**Client side** (`lib/mpp-client.ts`):
- Creates a custom viem account backed by Privy for signing
- Uses `Mppx.create()` with `tempo()` method to handle 402 responses automatically
- The MPP client intercepts 402 responses, signs payment credentials, and retries

**Server side** (`mppx/nextjs`):
- Mock services use `Mppx.create()` with `tempo.charge()` middleware
- Wraps route handlers to return 402 challenges and verify credentials
- Settlement is handled natively by Tempo (no Stripe needed)

### Demo Flow (3 steps)

1. User clicks "Create Agent" → `POST /api/agent/create` → creates Privy wallet
2. User funds wallet with $0.10, $0.50, or $1.00 PathUSD from treasury
3. User executes actions:
   - **Weather** ($0.10) → agent pays via MPP

## Environment Variables

```env
# Required
PRIVY_APP_ID=your-app-id
PRIVY_APP_SECRET=your-app-secret
TREASURY_WALLET_ID=your-treasury-wallet-id
MPP_RECIPIENT=0x...your-tempo-recipient-address

# Optional
MPP_CURRENCY=0x20c0000000000000000000000000000000000000
TEMPO_CHAIN_ID=98865
TEMPO_RPC_URL=https://rpc.tempo.xyz
TEMPO_EXPLORER_URL=https://explorer.tempo.xyz
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Styling Conventions

- Uses Privy brand colors: primary (`#5B4FFF`), hover (`#4A3EE6`), active (`#3F35D9`)
- Borders: `#E2E3F0`, highlight backgrounds: `#E0E7FF`, code/info backgrounds: `#F1F2F9`
- Three button classes defined in globals.css: `.button-primary`, `.button-outline`, `.button`
- Font: Inter via `next/font/google`
- Tailwind CSS v4 for layout and spacing
- Card-based UI with rounded-2xl corners and subtle hover effects

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

MPP-enabled service routes use `mppx/nextjs` middleware:

```typescript
import { Mppx, tempo } from 'mppx/nextjs';

const mppx = Mppx.create({
  methods: [tempo.charge({ currency: '0x...', recipient: '0x...' })],
});

export const GET = mppx.charge({ amount: '0.1' })(() =>
  Response.json({ data: 'your response' })
);
```

## Common Tasks

### Adding a New Action

1. Add cost to `ACTION_COSTS` in `app/api/agent/execute/route.ts`
2. Create MPP service endpoint in `app/api/mock-services/[action]/route.ts` using `mppx/nextjs`
3. Add ActionCard in the agent dashboard page (`app/agent/[id]/page.tsx`)

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

### MPP Payment Issues
- Ensure wallet has PathUSD (not just ETH)
- Verify `MPP_RECIPIENT` is set correctly
- Check Tempo RPC connectivity
- Verify Privy wallet has signing permissions

## Resources

- [Privy Node SDK](https://www.npmjs.com/package/@privy-io/node)
- [Privy Agentic Wallets Docs](https://docs.privy.io/recipes/wallets/agentic-wallets)
- [MPP Protocol](https://machinepayments.dev)
- [mppx SDK](https://www.npmjs.com/package/mppx)
