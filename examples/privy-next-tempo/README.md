# Privy + Tempo Demo

A minimal Next.js app demonstrating Privy wallet integration with Tempo testnet for TIP-20 token transfers.

## Features

- **Privy Authentication**: Email/social login with embedded wallet creation
- **Tempo Testnet**: Connect to Tempo testnet (chain ID 42429)
- **TIP-20 Transfers**: Send AlphaUSD tokens with gas fees paid in AlphaUSD

## Getting Started

```bash
pnpm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Files

- `src/providers/providers.tsx` - Privy + Wagmi configuration with Tempo chain
- `src/components/sections/tempo-transfer.tsx` - Transfer form using tempo.ts hooks
- `src/app/api/rpc/route.ts` - RPC proxy to Tempo testnet

## Resources

- [Privy Documentation](https://docs.privy.io/)
- [Tempo Documentation](https://docs.tempo.xyz/)
