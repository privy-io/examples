# Privy Cross App Connect Demo

This is a demo NextJS app that showcases how requester applications can use [RainbowKit](https://rainbowkit.com) to connect to [Privy](https://www.privy.io/) wallets created by provider applications. Requester apps do not need to be using Privy to access the cross app wallets, they can simply use the RainbowKit connector as provided in the [`@privy-io/cross-app-connect`](https://www.npmjs.com/package/@privy-io/cross-app-connect) package.

To try the demo, go to https://cross-app-connect-demo.vercel.app/ and connect to the provider app wallet. Once connected, click the buttons to invoke various [`wagmi`](https://wagmi.sh/) hooks, like `useSignMessage`, to interface with your connected cross app wallet.

**Check out our [cross app connect docs](https://docs.privy.io/guide/react/cross-app/cross-app-connect) for more guidance!**

# Setup

1. Fork this repository, clone it, and open it in your terminal.

```sh
git clone https://github.com/<your-github-handle>/cross-app-connect-demo
```

2. Install the necessary dependencies by running `npm i`.

## Building locally

In your project directory, run `npm run dev`. You can now visit http://localhost:3000 to see your app and login with Privy!

## Check out:

`src/config` for how to add the Privy wallet connector to your RainbowKit `ConnectButton`.
`src/pages/components` for how to use Wagmi hooks to interact with the cross app wallet.
