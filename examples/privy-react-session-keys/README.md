# Privy account abstraction example with session keys

This is a example using Privy to create an signer for an account abstraction (AA) account and provision server-side access to the AA wallet using session keys.

Please follow this guide to [access wallets from your backend](https://docs.privy.io/guide/react/recipes/misc/session-keys) for a deep dive into this integration.


## Installation

```sh
# Clone repo
git clone git@github.com:privy-io/session-keys-example.git
cd session-keys-example

# Create .env.local file from example, filling in your Privy App ID and other environment variables.
cp .env.example .env.local

# Install dependencies
npm i

# Start the demo
npm run dev
```

## Setup

### Account abstraction provider
To run this example, you will need to set up a project with an Account Abstraction provider. This example uses [Zerodev](https://zerodev.app).

See the [Zerodev docs](https://docs.zerodev.app/sdk/getting-started/tutorial#create-a-zerodev-project) to configure your project and environment.

### Server-side storage provider
To run this example, you will need to set up server-side storage. This example uses [Supabase](https://supabase.com).

See the [Supabase docs](https://supabase.com/docs/guides/getting-started) to configure your database and credentials.

By default, this example expects a database table called `SessionKeyApprovals` with two columns:
- `privy_did`: The Privy user ID for all users who approved session keys. This is the table's primary key
- `session_key_approval`: The session key approvals associated with each user. This approval grants your server permissioned access to the user's AA account, via a session key that your server has access to.
