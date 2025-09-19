# Privy + {{BLOCKCHAIN_NAME}} {{FRAMEWORK_NAME}} Starter

This example showcases how to get started using {{BLOCKCHAIN_NAME}} with Privy's React SDK inside a {{FRAMEWORK_NAME}} application.

## Live Demo

[View Demo]({{DEPLOY_URL}})

## Quick Start

### 1. Clone the Project

```bash
mkdir -p {{REPO_NAME}} && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=3 -C {{REPO_NAME}} privy-examples-main/examples/{{REPO_NAME}} && cd {{REPO_NAME}}
```

### 2. Install Dependencies

```bash
{{PACKAGE_MANAGER}} install
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
{{ADDITIONAL_ENV_VARS}}
```

**Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep `PRIVY_APP_SECRET` private and server-side only.

### 4. Start Development Server

```bash
{{PACKAGE_MANAGER}} dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Core Functionality

### 1. Login with Privy

Login or sign up using Privy's pre-built modals.

[`{{LOGIN_FILE_PATH}}`]({{LOGIN_FILE_PATH}})
```tsx
import { usePrivy } from "@privy-io/react-auth"; 
const { login } = usePrivy();
login();
```

### 2. Create a {{BLOCKCHAIN_NAME}} wallet

Programmatically create a {{BLOCKCHAIN_NAME}} embedded wallet for your user. Wallets can also be automatically created on login by configuring your PrivyProvider, learn more [here](https://docs.privy.io/basics/react/advanced/automatic-wallet-creation).

[`{{CREATE_WALLET_FILE_PATH}}`]({{CREATE_WALLET_FILE_PATH}})
```tsx
{{CREATE_WALLET_CODE}}
```

### 3. {{PRIMARY_ACTION_NAME}}

{{PRIMARY_ACTION_DESCRIPTION}}

[`{{PRIMARY_ACTION_FILE_PATH}}`]({{PRIMARY_ACTION_FILE_PATH}})
```tsx
{{PRIMARY_ACTION_CODE}}
```

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
{{ADDITIONAL_LINKS}}