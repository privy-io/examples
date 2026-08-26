# Cards with Privy

This Next.js example shows how to issue and manage cards for your users with the Privy React SDK, using the `SignUpForCardView` and `CardSummaryView` components from `@privy-io/react-auth/ui`.

It is scaffolded from [`privy-next-starter`](../../privy-next-starter), trimmed down to just the card flow — the wallet, funding, linking, signer, and MFA sections are intentionally removed (opted out under `sectionOverrides` in [`.sync-manifest.json`](../../.sync-manifest.json), so base syncs don't re-add them).

> **⚠️ Production signup needs a spend-approval target.** `SignUpForCardView` grants the card's USDC spend allowance to a Bridge spender. The SDK ships built-in targets for sandbox testnets, but not for mainnets — on `environment="production"` it requires a `spendApproval` prop naming the USDC contract and Bridge spender to approve. This demo reads both from env vars and keeps production signup disabled until they are set. See [Environments](#environments).

## Flow

1. Sign in with Privy. The provider creates an embedded Ethereum wallet for users without one.
2. Press **Sign up for a card**. `SignUpForCardView` walks the e-sign disclosure, the bank agreements (which name your app, the issuing bank, and Bridge as the card-program manager), the provider terms, and KYC, then creates the card and prompts for the on-chain USDC spend approval.
3. On success it fires `onCardReady` with the card id, and the demo hands straight off to the summary.
4. `CardSummaryView` shows the balance, card face, transactions, card details and reveal, statement downloads, and the freeze/cancel/replace actions.
5. Optionally press **Simulate a $0.50 purchase** to put a real row on the transaction list. See [Simulating a purchase](#simulating-a-purchase).

A pill next to the funding wallet address shows whether a card exists yet. The demo finds an existing card by listing the user's cards for the selected environment, so a reload goes straight to the summary.

**Sign up for a card** stays available even once a card exists, so the onboarding flow is always there to walk through. A returning user starts at "Get started" again and re-walks the disclosure and KYC steps, but the SDK hands back the card they already have rather than issuing a second one. To get a genuinely new card, use **Replace** in the card details.

### Replacements

**Replace** in the card details closes the current card and issues a new one in a single call, carrying the reason the user picked. `CardSummaryView` does not adopt the replacement — the open panel is scoped to the card that just closed, so it shows a "card cancelled" banner and reports the new card id through `onReplaced`. This demo points its card id at the replacement and keys the view on it, so the panel remounts on the new card.

Because a replacement leaves the old card behind as `canceled`, a user accumulates cards. The list endpoint returns them newest first and includes cancelled ones, so the demo picks the newest card whose `status` isn't `canceled` (see [`cards-api.ts`](./src/components/sections/cards-api.ts)).

## Source map

- [`src/app/page.tsx`](./src/app/page.tsx): Login state, page layout, and the `Cards` section
- [`src/providers/providers.tsx`](./src/providers/providers.tsx): Privy provider configuration; EVM-only, creates an embedded Ethereum wallet on login
- [`src/components/sections/cards.tsx`](./src/components/sections/cards.tsx): Hosts both card views, owns the environment toggle and card id, and holds the chain map and the production spend-approval target
- [`src/components/sections/cards-api.ts`](./src/components/sections/cards-api.ts): Lists the user's cards for an environment and picks the newest open one, since the SDK exports no card-list hook
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

The card views ship in a prerelease, so `@privy-io/react-auth` is pinned to an exact beta rather than a caret range. Move it to the stable release once one contains both components.

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

The card spends USDC on Base Sepolia from the user's embedded wallet, and the approval transaction needs gas. The demo shows the wallet address and links to both faucets once you log in. Without Base Sepolia ETH the flow dead-ends on the approval step with generic error copy.

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Environments

A **sandbox / production** toggle sits at the top of the Cards section. It switches the `environment` prop on both card views, the funding chain, and which ledger the card lookup queries. It defaults to sandbox on every load rather than persisting, so you can't land in production by accident.

Production needs its own credentials, separate from sandbox: a Bridge production integration with the `cards` endorsement on that live account, and a live Stripe key in the app's production card configuration. Sandbox credentials do not carry over.

|  | Sandbox | Production |
| --- | --- | --- |
| Funding chain | Base Sepolia (`eip155:84532`) | Base (`eip155:8453`), real USDC |
| Spend approval target | built in | `spendApproval` prop, from env |
| Card signup | ✅ | ✅ once the target is set |
| Card summary | ✅ | ✅ |
| Simulated purchase | ✅ | ❌ not possible |

**Production needs the spend-approval target.** `SignUpForCardView`'s props are discriminated on `environment`: sandbox resolves the USDC contract and Bridge spender from the SDK's built-in testnet targets and rejects a supplied one, while production **requires** a `spendApproval` — Bridge does not publish its mainnet targets to the SDK, and approving the wrong spender would leave a `ready` card that cannot spend. Passing neither, or passing one on sandbox, is a type error rather than a silently unusable card.

This demo reads the production target from two public env vars and gates signup on them:

```env
NEXT_PUBLIC_CARD_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_CARD_SPENDER_ADDRESS=0x…
```

The USDC address is Base mainnet's; the spender is the issuer address from the Bridge **production** integration behind your app's card configuration. With either missing, the production **Sign up for a card** button is disabled and the modal says which vars to set. Sandbox is unaffected and needs no configuration.

`SignUpForCardView` also accepts a Solana target (`{stablecoinAddress, programId, merchantId}`) for a `solana:*` `chainId`; this demo is EVM-only, so it always supplies the EVM shape.

**Why simulated purchases are sandbox-only.** Stripe's Issuing test helpers do not exist for live keys — there is no API to fabricate a live authorization, so live spend must be a real purchase at a real merchant. The button is hidden in production, and the route refuses non-test keys.

## Simulating a purchase

`CardSummaryView`'s transaction list is fed from Stripe Issuing, so a new card has nothing to show. **Simulate a $0.50 purchase** creates an authorization with [Stripe's Issuing test helpers](https://docs.stripe.com/api/issuing/authorizations/test-helpers-create) and captures it, which puts a real row on the list.

To enable it, set a **test-mode** Stripe secret key for the account that issues the cards:

```env
STRIPE_SECRET_KEY=sk_test_…
```

Notes:

- This is a **server-only** variable, read by [`src/app/api/test-spend/route.ts`](./src/app/api/test-spend/route.ts). Never expose a Stripe secret key to the browser via `NEXT_PUBLIC_`. The route refuses to run with anything that isn't an `sk_test_`/`rk_test_` key and caps the amount at $100.
- The button is a demo affordance, not something to deploy. Anyone who can reach the route can create authorizations on the configured account's cards.
- **It does not move the balance.** `CardSummaryView` shows the funding wallet's on-chain balance, so a simulated purchase changes the transaction list only. Real settlement pulls USDC through the Bridge spender.
- Reopen the modal to see the new row — closing it unmounts the view, so opening again refetches.
- Stripe may **decline** the authorization, since stablecoin-backed cards check funding. A declined authorization still appears in the list, and the toast reports the reason.

## SDK version

`CardSummaryView` and `SignUpForCardView` are not in a stable `@privy-io/react-auth` release yet, so this example pins the beta that contains both. Their props are still moving, so the pin is exact rather than a caret range — a newer beta can be a breaking change.

To check what you actually have installed:

```bash
rg 'SignUpForCardView|CardSummaryView|spendApproval|onReplaced|developerName' node_modules/@privy-io/react-auth/dist/dts/ui.d.ts
```

Both component names must appear, `spendApproval` and `onReplaced` must appear, and `developerName` must not — that combination is the beta this example is written against. An older beta fails `tsc` on all three. If you swap in a locally built tarball to test unreleased SDK changes, note that a local build and a published release can share a version string with different contents, so a later `pnpm install` can silently replace it with no resolution error — run the check above again after any install. Don't commit a `file:` dependency; it is machine-local.

## Relevant links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
