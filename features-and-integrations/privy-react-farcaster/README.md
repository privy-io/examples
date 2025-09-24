# Farcaster + Privy

This example showcases how to get started using Farcaster social login and casting with Privy's React SDK inside a Next.js application.

## Live Demo

[View Demo]({{DEPLOY_URL}})

## Quick Start

### 0. Dashboard setup
- Create an app in the Privy dashboard [here](https://dashboard.privy.io/)
- Enable Farcaster as a login method in your app settings [here](https://docs.privy.io/guide/react/recipes/misc/farcaster)

### 1. Clone the Project

```bash
mkdir -p privy-react-farcaster && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=3 -C privy-react-farcaster privy-examples-main/examples/privy-react-farcaster && cd privy-react-farcaster
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the example environment file and configure your Privy app credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Privy app credentials:

```env
# Public - Safe to expose in the browser
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here

# Private - Keep server-side only
PRIVY_APP_SECRET=your_app_secret_here

# Optional: Uncomment if using custom auth URLs or client IDs
# NEXT_PUBLIC_PRIVY_CLIENT_ID=your_client_id_here
# NEXT_PUBLIC_PRIVY_AUTH_URL=https://auth.privy.io
```

**Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep `PRIVY_APP_SECRET` private and server-side only.

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Core Functionality

### 1. Login with Farcaster

Login or sign up using Privy's pre-built Farcaster authentication.

[`pages/index.tsx`](./pages/index.tsx)
```tsx
import { usePrivy } from "@privy-io/react-auth"; 
const { login } = usePrivy();
// Login using Privy's prebuilt modal
login()
```

### 2. Request Farcaster Signer

Get permission to write to Farcaster on behalf of the user by requesting a signer from Farcaster. Farcaster signers are only availabe with the "On device" execution environment.

[`pages/farcaster.tsx`](./pages/farcaster.tsx)
```tsx
import { useFarcasterSigner } from "@privy-io/react-auth";
const { requestFarcasterSignerFromWarpcast } = useFarcasterSigner();
// Request signer permission from Warpcast
requestFarcasterSignerFromWarpcast();
```

### 3. Submit Farcaster Casts

Login with Farcaster, submit casts, like and recast content, and manage your Farcaster social presence.

[`pages/farcaster.tsx`](./pages/farcaster.tsx)
```tsx
import { useFarcasterSigner } from "@privy-io/react-auth";
import { ExternalEd25519Signer, HubRestAPIClient } from "@standard-crypto/farcaster-js";

const { signFarcasterMessage, getFarcasterSignerPublicKey } = useFarcasterSigner();

const privySigner = new ExternalEd25519Signer(
  signFarcasterMessage,
  getFarcasterSignerPublicKey
);

const hubClient = new HubRestAPIClient({
  hubUrl: 'https://hub-api.neynar.com',
});

// Submit a cast
const { hash } = await hubClient.submitCast(
  { text: "Hello from Privy!" },
  farcasterAccount.fid!,
  privySigner
);
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
- [Farcaster Integration Guide](https://docs.privy.io/guide/react/recipes/misc/farcaster)
- [Farcaster Writes Documentation](https://docs.privy.io/guide/react/recipes/misc/farcaster-writes)
- [Farcaster Protocol](https://docs.farcaster.xyz/)
- [Neynar Hub API](https://docs.neynar.com/)