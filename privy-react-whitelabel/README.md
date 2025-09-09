# Privy Whitelabel Starter

This is a template for integrating whitelabel [**Privy**](https://www.privy.io/) into a [NextJS](https://nextjs.org/) project. Check out the deployed app [here](https://whitelabel.privy.io/)!

This demo uses NextJS's [App Router](https://nextjs.org/docs/app).

## Setup Privy App

1. Enable all the login methods you want to use in the [dashboard](https://dashboard.privy.io/apps?page=login-methods).

2. [optional] Enable guest accounts in the [dashboard](https://dashboard.privy.io/apps?page=settings) under Settings > Advanced settings > Guest accounts.

3. Enable smart wallets in the [dashboard](https://dashboard.privy.io/apps?page=embedded&tab=smart-wallets) or remove <SmartWalletProvider/> in app/providers if you do not wish to use them.

## Setup Repository

1. Clone this repository and open it in your terminal.

```sh
git clone https://github.com/privy-io/whitelabel-starter.git
```

2. Install the necessary dependencies (including [Privy Auth](https://www.npmjs.com/package/@privy-io/react-auth)) with `yarn`.

```sh
yarn install
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`, [paste your Privy App ID from the dashboard](https://docs.privy.io/guide/dashboard/api-keys).

```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local

# Add your Privy App ID to .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
```

## Building locally

In your project directory, run `yarn dev`. You can now visit http://localhost:3000 to see your app and login with Privy!

## Check out:

- `app/providers.tsx` for how to use the `PrivyProvider` and initialize it with your Privy App ID
- `app/components/Login.tsx` for whitelabel login methods
- `app/components/Wallets.tsx` for how to create wallets, send transactions and sign messages in a whitelabeled experience

## Optional features:

- OAuth methods can be enabled on the dashboard [here](https://dashboard.privy.io/apps?page=login-methods&logins=socials)

**Check out [our docs](https://docs.privy.io/) for more guidance around using Privy in your app!**
