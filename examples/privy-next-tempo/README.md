# Tempo + Privy Example Project

A basic example showing how to send tokens with memos on [Tempo](https://tempo.xyz) using [Privy](https://privy.io) for wallet authentication.

## Features

- **Transaction Memos**: Attach human-readable memos to token transfers
- **Privy Authentication**: Embedded wallet creation and social login via Privy
- **Token Transfers**: Send alphaUSD tokens to other users

## Tech Stack

- [Next.js](https://nextjs.org) 15 with App Router
- [Tempo SDK](https://www.npmjs.com/package/tempo.ts) (`tempo.ts`)
- [Privy](https://privy.io) for wallet management
- [Viem](https://viem.sh) for Ethereum interactions
- [TailwindCSS](https://tailwindcss.com) for styling

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Copy the example environment file and add your Privy credentials:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Implementation Details

### Transaction Memos

Memos are attached to transfers using the `memo` parameter:

```typescript
await client.token.transferSync({
  to: recipient,
  amount: parseUnits(amount, metadata.decimals),
  memo: stringToHex(memo),
  token: alphaUsd,
});
```

## Resources

- [Tempo Documentation](https://docs.tempo.xyz)
- [Privy Documentation](https://docs.privy.io)
- [Viem Documentation](https://viem.sh)
