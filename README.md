# Privy x Base Paymaster Demo

This demo app that showcases a user flow of:
- Signing-in with email/social
- Getting a smart wallet (ERC-4337)
- Taking an on-chain action (minting an ERC-721), without requiring the user or the app to pay _any_ gas fees.

This app uses:
- [**Privy**](https://www.privy.io/) for simple onboarding, secure authentication, and powerful embedded wallets
- [**AccountKit**](https://accountkit.alchemy.com/) for ERC-4337 support and smart contract account functionality
- [**viem**](https://viem.sh/) for interfacing with wallets and public clients
- the **Base Goerli Paymaster** for having Coinbase sponsor all gas fees, for both the user and the app
- [**NextJS**](https://nextjs.org/) as the web application framework

**You can see the deployed app at [`https://base-paymaster-example.vercel.app/`](https://base-paymaster-example.vercel.app/)!**

## Local setup

First, clone a fork of this repository locally and install its dependencies
```sh
git clone https://github.com/privy-io/base-paymaster-example.git
cd base-paymaster-example
npm i 
```

Next, create your own `.env` file by running:
```sh
cp .env.example .env
```

and then add your Privy App ID and an Alchemy API key (must include support for Base Goerli):

```
NEXT_PUBLIC_PRIVY_APP_ID='insert-your-Privy-App-ID'
NEXT_PUBLIC_ALCHEMY_API_KEY='insert-your-Alchemy-API-Key'
```

Lastly, run:

```sh
npm run dev
```

and visit `http://localhost:3000` in your browser to see the app in action! You can make edits to the code directly, and updates should appear in your browser. 

## Copying into your code

If you don't want to use _all_ of the boilerplate in this repository, you can just copy-paste the three following files into your code:
- `hooks/SmartAccountContext.tsx`: React Context that initializes the user's smart account and returns functionality for sending sponsored user operations
- `lib/user-operations.ts`: helper functions to perform low-level actions on user operations
- `lib/constants.ts`: a few required constants

You may need to update import paths in these files depending on how your repo is laid out.

You should then wrap your app with the `SmartAccountProvider` exported by `hooks/SmartAccountContext.tsx`:

```tsx
// You might place this in `_app.tsx` for the NextJS Pages Router, `providers.tsx` for the NextJS App Router, `index.tsx` for Create React App, etc.
import {PrivyProvider} from '@privy-io/react-auth';
import {SmartAccountProvider} from '../hooks/SmartAccountContext.tsx';

...

<PrivyProvider {...insertYourPrivyProviderProps} >
  <SmartAccountProvider>
    <Component {...pageProps} />
  </SmartAccountProvider>
</PrivyProvider>
```

You can now use the smart account from components/pages in your app, like so:
```tsx
import {useSmartAccount} from '../hooks/SmartAccountContext.tsx';

...

// The rest of this code must be used within a React Component
const {smartAccountReady, smartAccountAddress, smartAccountProvider, sendSponsoredUserOperation} = useSmartAccount();

// Determine if the smart account is ready to be used
const ready = smartAccountReady;

// Get the smart account's address
const address = smartAccountAddress;

// Get an `AlchemyProvider` for the smart account
const provider = smartAccountProvider;

// Send a user operation with the smart account. Gas fees will be covered by the Base Goerli paymaster
const userOpHash = sendSponsoredUserOperation({
    ...insertRpcTransactionRequest
});
```

## Check out
- `pages/_app.tsx` for how to setup your `PrivyProvider` and wrap your app's pages/components with it
- `hooks/SmartAccountContext.tsx` for how to initialize smart contract wallets from your users' Privy embedded wallets (EOA)
- `lib/user-operations.ts` for helper functions to format, populate, hash, and sign user operations
- `pages/dashboard.tsx` for how to send a user operation for minting an ERC-721
- Privy Docs: https://docs.privy.io/
- Alchemy AccountKit Docs: https://accountkit.alchemy.com/
- Viem Docs: https://viem.sh/
