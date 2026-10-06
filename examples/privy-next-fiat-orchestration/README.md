# Privy Fiat Orchestration

Example app that exercises Privy's fiat orchestration APIs (KYC → Onramp → Offramp) with a real-time API Inspector.

## Setup

### Prerequisites

- Node.js 22+
- A Privy app with Bridge integration configured (Bridge API keys in dashboard)

### 1. Install

```bash
pnpm install
```

### 2. Configure

Copy `.env.example` to `.env.local` and fill it in. Only `NEXT_PUBLIC_*` values
reach the browser; everything else stays server-side.

### 3. (Optional) Seed the showcase user

Logged-out visitors see a "See it in action" panel: a sandbox user that has
already been through every step, so the end state is visible before any setup.
To enable it:

1. Log in to the demo as a dedicated user and finish every step: terms of
   service, KYC, a deposit account and a bank account.
2. Set `SHOWCASE_USER_ID` (the Privy user ID, `did:privy:...`) and
   `SHOWCASE_WALLET_ID` (that user's embedded wallet ID) in `.env.local`, or in
   the Vercel project settings.

`GET /api/showcase` is unauthenticated and read-only. It only ever reads that
one configured user, and the response is CDN-cached for 60 seconds. Without the
two variables the panel is hidden.

### 4. Run

```bash
pnpm dev
```

Everything runs on http://localhost:3000 — UI and API routes together.

## Architecture

A single Next.js app. The UI is client components; the API routes hold the app
secret and proxy to Privy, returning request/response metadata so the inspector
can render it.

```
src/
├── app/
│   ├── page.tsx                UI entry
│   ├── tos-callback/           Bridge ToS redirect target
│   └── api/                    server routes (hold the app secret)
│       ├── kyc/status          GET  /v1/users/:id/kyc
│       ├── kyc/tos             POST /v1/users/:id/kyc/tos
│       ├── kyc/links           POST /v1/users/:id/kyc/links
│       ├── accounts/           GET|POST|DELETE /v1/users/:id/external_fiat_accounts
│       ├── deposit-accounts/   GET|POST /v1/wallets/:id/deposit_accounts/fiat
│       ├── wallet/[walletId]/  GET wallet, POST .../entity, GET .../actions/:id
│       ├── onramp/             POST /v1/users/:id/fiat/onramp
│       ├── payout/             POST /v1/wallets/:id/payout/fiat
│       ├── showcase/           GET  read-only snapshot of the showcase user
│       └── webhooks/           privy (Svix receiver), stream (SSE to the UI)
├── components/                 step wizard, API inspector
└── lib/
    ├── api.ts                  client fetch helper
    ├── use-kyc-stream.ts       client SSE consumer
    ├── privy-client.ts         server: calls Privy, captures inspector metadata
    ├── privy-env.ts            server: production/staging host resolution
    ├── server-auth.ts          server: verifies the caller's Privy access token
    └── kyc-events.ts           server: in-memory webhook store + SSE fan-out
```

### Webhooks and the SSE stream

`POST /api/webhooks/privy` verifies the Svix signature over the **raw** request
body, then records the event. Four event types are handled: `user.kyc.updated`
(keyed by user id) and the three deposit lifecycle events —
`wallet.deposit_account.deposit_started`, `.deposit_completed`, and
`.deposit_failed` — all keyed by wallet id, since their payloads carry no user
id. Subscribe to all four in the Privy dashboard, or the feed will stall partway
through a deposit. `GET /api/webhooks/stream` pushes those events to the UI over
SSE (the access token travels as a query param because `EventSource` cannot set
headers); pass `?wallet_id=` to also receive that wallet's deposit events.

The event store is **process-local and in-memory**, which is fine for local dev
but does not survive a serverless deployment: the receiver and the stream can
land on different instances, so events recorded by one will not reach a client
subscribed to another. Making this work in production needs a shared store and
a transport that tolerates connection limits.

## Deploying

Zero-config on Vercel — Next.js is auto-detected. Set the environment variables
from `.env.example` in the project settings. `PRIVY_APP_SECRET` and
`PRIVY_WEBHOOK_SIGNING_SECRET` must **not** carry the `NEXT_PUBLIC_` prefix, or
they would be inlined into the public client bundle. See the SSE caveat above.

## Flow

1. **Login** — Email or Google via Privy
2. **Accept ToS** — Generates a Bridge ToS link
3. **KYC** — Hosted KYC link; status arrives over the webhook stream
4. **Onramp** — Fiat → USDC on Base (returns deposit instructions)
5. **Deposit Account** — Provision a persistent fiat deposit account for the
   wallet; deposits arrive over the webhook stream
6. **Add Bank Account** — Link an external fiat account for offramps
7. **Offramp** — One `payout/fiat` call sends crypto to the linked bank
   account; Privy handles the liquidation address and returns a wallet action
   to poll
