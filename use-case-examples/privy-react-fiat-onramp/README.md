# Privy Fiat On-Ramp Demo

This is a demo of integrating [Privy](https://www.privy.io/) alongside a fiat on-ramp, [Moonpay](https://www.moonpay.com/). In this app, users can sign in with their email address, create an embedded wallet, and then _fund_ their embedded wallet on the Goerli testnet.

This app is built using [NextJS](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/), [`@privy-io/react-auth`](https://www.npmjs.com/package/@privy-io/react-auth), and [`ethers`](https://docs.ethers.org/v5/).

## Integration Overview

At a high-level, integrating Privy with a fiat on-ramp provider (Moonpay or otherwise) looks like:

1. In your **frontend**, collect details about your user and their desired on-ramp flow, such as their wallet address, email, the asset they'd like to purchase, how much they'd like to purchase, etc. Make a request to your backend with this info.
2. In your **backend**, configure your user's on-ramp flow by taking a generic fiat on-ramp URL from your provider and attaching the details from step (1) as URL query parameters. Authorize this on-ramp URL with your provider's secret key, and return the URL to the frontend.
3. In your **frontend**, take your user to the URL from step (2) by redirecting them to it in a new tab, or showing it within an `iframe` embedded in your site. In this URL, your user will be able to complete their purchase.

## Useful Code Snippets

These are the specific points of integration:

### `pages/home.tsx`

- See the `fundWallet` method for an example of how to collect information about the current user and send it in a request to your backend.
- See the `updateBalance` method for an example of how to retrieve the user's current wallet balance
- See also sample uses of `signMessage`, `sendTransaction`, `exportWallet`, and other embedded wallet functionality.

### `components/Onramp.tsx`

- See a sample modal to provide explanatory context about a fiat on-ramp to your user
- See how to redirect your user to the on-ramp URL in a new tab

### `pages/api/onramp.ts`

- The `POST` handler in this file receives the on-ramp configuration from the front-end and constructs the on-ramp URL with this configuration
- See how to configure the on-ramp URL via query parameters
- See how to authorize the on-ramp URL by signing it with your provider's secret key

## Local development

1. Clone this repository

```sh
git clone git@github.com:privy-io/fiat-onramp-demo.git
cd fiat-onramp-demo
```

2. Create your `.env.local` file from `.env.local.example`. Fill in your:

- Privy App ID and App Secret
- Infura API Key
- Moonpay Base URL and Moonpay Secret Key

```
cp .env.local.example .env.local
```

3. Install your dependencies

```
npm i
```

4. Start your app, and visit `http://localhost:3200` to test it!

```
npm run dev
```
