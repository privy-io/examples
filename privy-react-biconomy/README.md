# Privy x Biconomy Starter

## Live Demo

https://biconomy-example.privy.io/

## Intro

This is a template for integrating [**Privy**](https://www.privy.io/) and [**Biconomy**](https://www.biconomy.io/) into a [NextJS](https://nextjs.org/) project. Check out the deployed app here!

In this demo app, a user can login with their email, Google account, Discord account, Twitter account, or Apple account, and get a Privy embedded wallet. Once the user has logged in and created an embedded wallet, Biconomy will create a **smart wallet** for the user behind the scenes, which can then be used to incorporate gas sponsorship, batched transactions, and more into your app.

You can test this by logging into the app and attempting to mint an NFT with your smart wallet; it should cost you no gas!

## Setup

1. Fork this repository, clone it, and open it in your terminal.
```sh
git clone https://github.com/<your-github-handle>/
```

2. Install the necessary dependencies (including [the Privy SDK](https://www.npmjs.com/package/@privy-io/react-auth) and [Biconomy's SDKs](https://docs.biconomy.io/category/smart-accounts)) with `npm`.
```sh
npm i
```

3. Initialize your environment variables by copying the `.env.example` file to an `.env.local` file. Then, in `.env.local`, paste:
- your **Privy App ID** from the [Privy console](https://console.privy.io)
- an **Infura API Key** from the [Infura dashboard](https://app.infura.io/dashboard). You can create an Infura account for free.
- your **Biconomy Bundler URL** from the [Biconomy Dashboard](https://dashboard.biconomy.io/). Make sure this corresponds to Polygon Mumbai.
- your **Biconomy Paymaster URL** from the [Biconomy Dashboard](https://dashboard.biconomy.io/). Make sure this corresponds to Polygon Mumbai.

```sh
# In your terminal, create .env.local from .env.example
cp .env.example .env.local

# Add your environment variables to .env.local
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
NEXT_PUBLIC_INFURA_API_KEY=<your-infura-api-key>
NEXT_PUBLIC_BICONOMY_BUNDLER_URL=<your-biconomy-bundler-url-for-mumbai>
NEXT_PUBLIC_BICONOMY_PAYMASTER_URL=<your-biconomy-paymaster-url-for-mumbai>
```

## Building locally

In your project directory, run `npm run dev`. You can now visit http://localhost:3000 to see your app and login with Privy!


## Learn more

Check out the following files to learn more about the integration!

### `pages/_app.tsx`

This demonstrates how to wrap your React app with the `PrivyProvider`, and how to configure Privy's login methods, embedded wallets, etc.

### `hooks/BiconomyContext.tsx`

This demonstrates how to initialize a Biconomy smart account from a Privy embedded wallet. In this example app, we store the user's Biconomy smart account in a React context to allow us to easily access it from other pages/components.

### `pages/index.tsx`

This demonstrates how to use Privy's `login` method to authenticate your users and create an embedded wallet for them.

### `pages/dashboard.tsx`

This demonstrates how to use a Biconomy smart account's `buildUserOp` and `sendUserOp` methods to mint an ERC-721 NFT gaslessly. 
