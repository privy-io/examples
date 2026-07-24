# Funding onramps with Privy

This Next.js example shows a single-page funding demo with Privy React SDK modals. It covers login, automatic embedded-wallet creation, manual wallet creation, unified Add funds, crypto deposit addresses, direct fiat onramp funding, and sandbox Bridge bank deposits for Ethereum and Solana wallets.

## Live demo

[View demo](https://privy-next-funding.vercel.app/)

## Source map

- [`src/app/page.tsx`](./src/app/page.tsx): Login state, page layout, active sections, and `UserObject`
- [`src/providers/providers.tsx`](./src/providers/providers.tsx): Privy provider configuration that creates Ethereum and Solana embedded wallets on login for users without wallets
- [`src/components/sections/create-a-wallet.tsx`](./src/components/sections/create-a-wallet.tsx): Manual embedded-wallet creation examples
- [`src/components/sections/fund-wallet.tsx`](./src/components/sections/fund-wallet.tsx): Modern funding hooks for Base USDC and Solana USDC funding, deposit addresses, direct fiat onramp funding, and sandbox Bridge bank deposits
- [`src/components/sections/user-object.tsx`](./src/components/sections/user-object.tsx): Authenticated user object for learning and debugging

## Quick start

### 1. Clone the example

```bash
mkdir -p privy-next-funding && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=3 -C privy-next-funding examples-main/examples/privy-next-funding && cd privy-next-funding
```

### 2. Install dependencies

```bash
pnpm install
```

This example already includes `@stripe/crypto` for Stripe Embedded Components onramp support. If you copy the funding flow into an existing app, install `@stripe/crypto` separately. Learn more in [Fiat-to-crypto onramps](https://docs.privy.io/wallets/funding/fiat-onramp).

### 3. Configure environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Set the public Privy app ID. This example does not need an app secret because it does not call server routes or direct REST APIs.

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here

# Optional Solana mainnet RPC used by src/providers/providers.tsx
NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL=https://api.mainnet-beta.solana.com
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Do not add secrets to this client-only example.

### 4. Configure the Privy dashboard

In the [Privy dashboard](https://dashboard.privy.io), configure the app used by `NEXT_PUBLIC_PRIVY_APP_ID`:

- Enable login methods for the users who will try the demo.
- Enable embedded wallets. The provider in `src/providers/providers.tsx` creates Ethereum and Solana embedded wallets on login for users without wallets.
- Enable the funding methods you want surfaced in the unified `useAddFunds` modal.
- Configure deposit-address support for the USDC routes you want to test. The example hardcodes Base USDC for Ethereum wallets and Solana USDC for Solana wallets.
- Configure a production fiat onramp provider for the direct `useFiatOnramp` action and the same destination routes.
- Configure Bridge sandbox bank deposits on the Account Funding page for the `useFundWalletWithBankDeposit` action. The example requests sandbox virtual account deposit instructions for USDC on Base for Ethereum wallets and USDC on Solana for Solana wallets.

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Funding flow

1. Log in or sign up with Privy. The app creates embedded wallets automatically for users without wallets.
2. Review the manual wallet creation section. It remains available for creating additional wallets across supported chains.
3. Select an Ethereum or Solana wallet in the fund wallet section.
4. Open unified funding. The example calls `useAddFunds().addFunds()` with a Base USDC or Solana USDC destination based on the selected wallet and lets the SDK modal present configured fiat and crypto options.
5. Open deposit address. The example calls `useDepositAddress().createDepositAddress()` with the selected wallet address and matching USDC destination.
6. Open fiat onramp. The example calls `useFiatOnramp().fund()` for a production fiat-to-USDC flow to the selected wallet's network.
7. Open bank deposit. The example calls `useFundWalletWithBankDeposit().fund()` with `provider: "bridge-sandbox"` and shows Bridge KYC plus virtual account deposit instructions.
8. Use the `UserObject` panel to inspect the authenticated user and wallet state while learning.

Each action requires a selected wallet and displays in-progress or error state in the page.

## Relevant docs

- [Account Funding configuration](https://docs.privy.io/wallets/funding/configuration)
- [Automatic wallet creation](https://docs.privy.io/basics/react/advanced/automatic-wallet-creation)
- [Add funds](https://docs.privy.io/wallets/funding/add-funds)
- [Crypto deposit addresses](https://docs.privy.io/wallets/funding/crypto-deposit-addresses)
- [Bank deposits](https://docs.privy.io/wallets/funding/bank-deposits)

## Sandbox bank deposit note

The bank deposit action uses `provider: "bridge-sandbox"`. Bridge sandbox is for testing only: it returns sandbox deposit instructions and does not move real fiat or crypto. Configure a Bridge sandbox API key and bank transfer funding in the Privy dashboard before testing this action.

The first sandbox bank deposit run creates a Bridge sandbox customer for the logged-in email user, opens Bridge KYC, then requests sandbox virtual account instructions.

## Production fiat onramp warning

The fiat-onramp action uses `environment: "production"`. Use an app intended for real-money testing, and only continue with fiat onramp flows when production money movement is expected for the selected Ethereum or Solana wallet.
