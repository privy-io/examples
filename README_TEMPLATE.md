# {{CORE_FEATURE_NAME}} + Privy

This example showcases how to get started using {{CORE_FEATURE_DESCRIPTION}} with Privy's React SDK inside a {{FRAMEWORK_NAME}} application.

## Live Demo

[View Demo]({{DEPLOY_URL}})

## Quick Start

### 0. Dashboard setup
- Create an app in the Privy dashboard [here](https://dashboard.privy.io/)
{{DASHBOARD_SETUP_INSTRUCTIONS}}

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

### 1. {{SETUP_SECTION_TITLE}}

{{SETUP_SECTION_DESCRIPTION}}

[`{{SETUP_FILE_PATH}}`]({{SETUP_FILE_PATH}})
```tsx
{{SETUP_CODE}}
```

### 2. {{WALLET_CREATION_TITLE}}

{{WALLET_CREATION_DESCRIPTION}}

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