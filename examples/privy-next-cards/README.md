# Cards with Privy

This Next.js example shows how to issue and manage cards for your users with the Privy React SDK, using `useSignUpForCard`, `SignUpForCardView`, and `CardSummaryView` from `@privy-io/react-auth/cards`.

It is scaffolded from [`privy-next-starter`](../../privy-next-starter), trimmed down to just the card flow — the wallet, funding, linking, signer, and MFA sections are intentionally removed (opted out under `sectionOverrides` in [`.sync-manifest.json`](../../.sync-manifest.json), so base syncs don't re-add them).

The card funds from **Tempo** — Tempo Testnet (Moderato) in sandbox, Tempo mainnet in production.

> **⚠️ Production signup needs a spend-approval target.** `SignUpForCardView` grants the card's stablecoin spend allowance to a Bridge spender. The SDK ships built-in targets for sandbox testnets, but not for mainnets — on `environment="production"` it requires a `spendApproval` prop naming the stablecoin contract and Bridge spender to approve. This demo uses the PathUSD or OUSD address from the funding-token toggle and reads the spender from env. Production signup stays disabled until that spender is set. See [Environments](#environments).

## Flow

1. Sign in with Privy. The provider creates an embedded Ethereum wallet for users without one.
2. Choose **PathUSD** or **OUSD**, then press **Sign up for a card**. The demo calls `useSignUpForCard().signUp(...)`, and `SignUpForCardView` walks the e-sign disclosure, the bank agreements (which name your app, the issuing bank, and Bridge as the card-program manager), the provider terms, and KYC, then creates the card and prompts for the on-chain spend approval.
3. On success the `signUp` promise returns the card id, and the demo hands straight off to the summary.
4. `CardSummaryView` shows the balance, card face, transactions, card details and reveal, statement downloads, and the freeze/cancel/replace actions.
5. Optionally press **Simulate a $0.50 purchase** to put a real row on the transaction list. See [Simulating a purchase](#simulating-a-purchase).

A pill next to the funding wallet address shows whether a card exists yet. The demo finds an existing card by listing the user's cards for the selected environment, so a reload goes straight to the summary.

**Sign up for a card** stays available even once a card exists, so the onboarding flow is always there to walk through. A returning user starts at "Get started" again and re-walks the disclosure and KYC steps, but the SDK hands back the card they already have rather than issuing a second one. To get a genuinely new card, use **Replace** in the card details.

### Replacements

**Replace** in the card details closes the current card and issues a new one in a single call, carrying the reason the user picked. `CardSummaryView` does not adopt the replacement — the open panel is scoped to the card that just closed, so it shows a "card cancelled" banner and reports the new card id through `onReplaced`. This demo points its card id at the replacement and keys the view on it, so the panel remounts on the new card.

Because a replacement leaves the old card behind as `canceled`, a user accumulates cards. The list endpoint returns them newest first and includes cancelled ones, so the demo picks the newest card whose `status` isn't `canceled` (see [`cards-api.ts`](./src/components/sections/cards-api.ts)).

## Source map

- [`src/app/page.tsx`](./src/app/page.tsx): Login state, page layout, and the `Cards` section
- [`src/chains.ts`](./src/chains.ts): Tempo chain ids, PathUSD and OUSD addresses, and the production spend-approval target
- [`src/providers/providers.tsx`](./src/providers/providers.tsx): Privy provider configuration; EVM-only, declares both Tempo chains, creates an embedded Ethereum wallet on login
- [`src/components/sections/cards.tsx`](./src/components/sections/cards.tsx): Launches signup with `useSignUpForCard`, hosts both card views, and owns the environment toggle, the PathUSD / OUSD toggle, and the card id
- [`src/components/sections/tempo-faucet.ts`](./src/components/sections/tempo-faucet.ts) and [`src/app/api/faucet/route.ts`](./src/app/api/faucet/route.ts): Testnet faucet top-up via the `tempo_fundAddress` RPC method
- [`src/components/sections/cards-api.ts`](./src/components/sections/cards-api.ts): Lists the user's cards for an environment. The page keeps the newest open card for the selected wallet, chain, and asset
- [`src/components/sections/find-embedded-wallet.ts`](./src/components/sections/find-embedded-wallet.ts): Picks the embedded EVM wallet whose Privy wallet id the card views need
- [`src/components/sections/modal.tsx`](./src/components/sections/modal.tsx): Centered 440px modal the card views render inside
- [`src/components/sections/simulate-spend.ts`](./src/components/sections/simulate-spend.ts): Resolves the Privy card id to its Stripe card id, then calls the test-spend route
- [`src/app/api/test-spend/route.ts`](./src/app/api/test-spend/route.ts): Server-only route that creates and captures a Stripe Issuing test authorization

## Quick start

### 1. Clone the example

```bash
mkdir -p privy-next-cards && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=3 -C privy-next-cards examples-main/examples/privy-next-cards && cd privy-next-cards
```

### 2. Install dependencies

```bash
pnpm install
```

The card APIs are available from the card-specific `@privy-io/react-auth/cards` entrypoint.

### 3. Configure environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Set the public Privy app ID:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Do not add secrets to client components. If a card flow needs an app secret, call it from a route handler under `src/app/api/` and read the secret from a non-public env var.

### 4. Configure the Privy dashboard

In the [Privy dashboard](https://dashboard.privy.io), configure the app used by `NEXT_PUBLIC_PRIVY_APP_ID`:

- Enable login methods for the users who will try the demo.
- Enable embedded wallets.
- Enable cards for the app.
- Save the app's Stripe publishable key in the cards config. `CardSummaryView` fetches it itself from `GET /api/v1/apps/:app_id/cards/config` — there is no key prop. If it is missing, **Show details** stays silently inert.
- Set the app's **legal name** on the card design. `CardSummaryView`'s footer disclosure names your legal entity as the Platform Provider and reads it from the app config — there is no `developerName` prop. It falls back to the app's display name when no legal name is set, so an app that skips this ships the display name in regulatory copy.
- Make sure the Bridge **sandbox** account behind the app's card configuration has the `cards` endorsement. Sandbox and production are separate Bridge accounts with separate capabilities, so enabling cards in production does not cover sandbox. Without it, signup fails with `'cards' endorsement not allowed — Cards is not enabled on the developer account`, which no amount of retrying or KYC will clear.

### 5. Fund the wallet

The card spends PathUSD or OUSD on Tempo Testnet (Moderato) from the user's embedded wallet. Use the **Funding token** toggle to choose. Log in and press **Fund wallet from faucet** — Moderato's faucet is the `tempo_fundAddress` JSON-RPC method on the chain's own endpoint, so there is no separate faucet service or API key. See [Funding on Tempo](#funding-on-tempo).

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Environments

A **sandbox / production** toggle sits at the top of the Cards section. It switches the `environment` prop on both card views, the funding chain, and which ledger the card lookup queries. It defaults to sandbox on every load rather than persisting, so you can't land in production by accident.

A **PathUSD / OUSD** toggle sits under it. Both Tempo and Tempo Moderato use the same two token addresses. Sandbox sends `asset: "pathusd"` or `asset: "ousd"` and lets the SDK pick the built-in Moderato spend target (`ousd` swaps that target to the OUSD contract). Production sends the same asset and a `spendApproval` whose `stablecoinAddress` is the selected token. The lookup keeps the newest open card for that wallet, chain, and asset.

Production needs its own credentials, separate from sandbox: a Bridge production integration with the `cards` endorsement on that live account, and a live Stripe key in the app's production card configuration. Sandbox credentials do not carry over.

|  | Sandbox | Production |
| --- | --- | --- |
| Funding chain | Tempo Testnet (Moderato) (`eip155:42431`) | Tempo (`eip155:4217`) |
| Funding token | PathUSD or OUSD, from the faucet | PathUSD or OUSD, real money |
| Spend approval target | built in | `spendApproval` prop, from env |
| Card signup | ✅ | ✅ once the target is set |
| Card summary | ✅ | ✅ |
| Faucet top-up | ✅ | ❌ testnet only |
| Simulated purchase | ✅ | ❌ not possible |

**Production needs the spend-approval target.** `signUp`'s options are discriminated on `environment`: sandbox resolves the stablecoin contract and Bridge spender from the SDK's built-in testnet targets and rejects a supplied one, while production **requires** a `spendApproval` — Bridge does not publish its mainnet targets to the SDK, and approving the wrong spender would leave a `ready` card that cannot spend. Passing neither, or passing one on sandbox, is a type error rather than a silently unusable card.

This demo reads the production target from two public env vars and gates signup on them:

```env
NEXT_PUBLIC_CARD_SPENDER_ADDRESS=0x…
```

The spender is the issuer address from the Bridge **production** integration behind your app's card configuration. The stablecoin address is not configured: the funding-token toggle selects PathUSD (`0x20C0…0000`) or OUSD (`0x20c0…6a37DA5C996874BE`). With the spender missing, the production **Sign up for a card** button is disabled. Sandbox is unaffected and needs no configuration.

`SignUpForCardView` also accepts a Solana target (`{stablecoinAddress, programId, merchantId}`) for a `solana:*` `chainId`; this demo is EVM-only, so it always supplies the EVM shape.

**Why simulated purchases are sandbox-only.** Stripe's Issuing test helpers do not exist for live keys — there is no API to fabricate a live authorization, so live spend must be a real purchase at a real merchant. The button is hidden in production, and the route refuses non-test keys.

## Funding on Tempo

Tempo's fee model differs from an ETH-gas chain in a way that shows up throughout this demo:

- **No native gas token.** Fees are paid in a TIP-20 stablecoin, with automatic conversion between supported tokens. There is no separate "get some ETH for gas" step — one stablecoin balance covers everything. [`src/chains.ts`](./src/chains.ts) pins the sandbox chain's `feeToken` to pathUSD. The card can spend PathUSD or OUSD. Privy sponsors the approval, so the fee token does not have to match the card asset.
- **The approval is sponsored.** `SignUpForCardView` sends the spend-approval transaction with `sponsor: true` and only falls back to a pre-funded send if sponsorship is unavailable. On the sponsored path the wallet needs no fee balance at all to complete signup — the balance matters for spending.
- **The faucet is an RPC method.** Moderato exposes `tempo_fundAddress` on its own endpoint (`https://rpc.moderato.tempo.xyz`), which hands out test OUSD, pathUSD, AlphaUSD, BetaUSD, and ThetaUSD. **Fund wallet from faucet** calls it through [a route handler](./src/app/api/faucet/route.ts), since the RPC endpoint sends no CORS headers for browsers. There is also a [browser faucet](https://tempo.xyz/developers/docs/quickstart/faucet) if you would rather fund an address by hand.

The sandbox spend-approval target the SDK builds in for `eip155:42431` uses pathUSD (`0x20C0…0000`). Asset `ousd` keeps the same spender and swaps the stablecoin to OUSD (`0x20c0…6a37DA5C996874BE`).

Both Tempo chains are declared in [`providers.tsx`](./src/providers/providers.tsx) under `supportedChains`. This is not cosmetic: the approval step calls `wallet_switchEthereumChain` to the card's chain before reading the allowance, and an undeclared chain fails that switch with an error that says nothing about chain configuration.

## Simulating a purchase

`CardSummaryView`'s transaction list is fed from Stripe Issuing, so a new card has nothing to show. **Simulate a $0.50 purchase** creates an authorization with [Stripe's Issuing test helpers](https://docs.stripe.com/api/issuing/authorizations/test-helpers-create) and captures it, which puts a real row on the list.

To enable it, set a **test-mode** Stripe secret key for the account that issues the cards:

```env
STRIPE_SECRET_KEY=sk_test_…
```

Notes:

- This is a **server-only** variable, read by [`src/app/api/test-spend/route.ts`](./src/app/api/test-spend/route.ts). Never expose a Stripe secret key to the browser via `NEXT_PUBLIC_`. The route refuses to run with anything that isn't an `sk_test_`/`rk_test_` key and caps the amount at $100.
- The button is a demo affordance, not something to deploy. Anyone who can reach the route can create authorizations on the configured account's cards.
- **It does not move the balance.** `CardSummaryView` shows the funding wallet's on-chain balance, so a simulated purchase changes the transaction list only. Real settlement pulls the stablecoin through the Bridge spender.
- Reopen the modal to see the new row — closing it unmounts the view, so opening again refetches.
- Stripe may **decline** the authorization, since stablecoin-backed cards check funding. A declined authorization still appears in the list, and the toast reports the reason.

## SDK version

`CardSummaryView`, `SignUpForCardView`, and `useSignUpForCard` are exported from `@privy-io/react-auth/cards`. These interfaces may include breaking changes between SDK releases, so review the release notes when upgrading and update the integration as needed.

## Relevant links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
