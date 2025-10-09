# Privy x `permissionless` Starter

## Live Demo

[https://permissionless-example.privy.io/](https://permissionless-example.privy.io/)

## Intro

This is a template for integrating [**Privy**](https://www.privy.io/) and [**`permissionless.js` (Pimlico)**](https://docs.pimlico.io/permissionless) into a [NextJS](https://nextjs.org/) project. Check out the deployed app [here](https://permissionless-example.privy.io/)!

In this demo app, a user can login with their email or Google account, and get a Privy embedded wallet. Once the user has logged in and created an embedded wallet, `permissionless.js` will create a **smart wallet** for the user behind the scenes, which can then be used to incorporate gas sponsorship, batched transactions, and more into your app.

You can test this by logging into the app and attempting to mint an NFT with your smart wallet; it should cost you no gas!

## Setup

1. Fork this repository, clone it, and open it in your terminal.

```sh
mkdir -p privy-next-permissionless && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=3 -C privy-next-permissionless examples-main/examples/privy-next-permissionless && cd privy-next-permissionless
```

2. Install the necessary dependencies (including [Privy](https://www.npmjs.com/package/@privy-io/react-auth) and [Permissionless](https://www.npmjs.com/package/permissionless)) with `npm`.

```sh
npm i
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`, paste your **Privy App ID** from the [Privy console](https://console.privy.io) and your **Pimlico Bundler and Paymaster URLs** from the [Pimlico dashboard](https://dashboard.pimlico.io/). This app uses the **Base Sepolia** testnet; you should make sure to apply the same settings to your Pimlico configuration in the dashboard.

```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local

# Add your Privy App ID to .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
NEXT_PUBLIC_PIMLICO_PAYMASTER_URL=<your-pimlico-paymaster-url>
NEXT_PUBLIC_PIMLICO_BUNDLER_URL=<your-pimlico-bundler-url>
```

## Building locally

In your project directory, run `npm run dev`. You can now visit http://localhost:3000 to see your app and login with Privy!

## Check out:

- `pages/_app.tsx` for how to set your app up with the `PrivyProvider`
- `hooks/SmartAccountContext.tsx` for how to deploy a smart account for users, using their Privy embedded wallet as a signer, and how to store it in a React context
- `pages/dashboard.tsx` for how to use the custom `useSmartAccount` hook to send an NFT minting transaction

**Check out our [Pimlico integration guide](https://docs.privy.io/guide/frontend/account-abstraction/pimlico) for more guidance!**
