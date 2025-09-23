# Privy x MiniApp Starter

This is an example Next.js app to demonstrate how you can use Frames alongside Privy's [**Farcaster login**](https://docs.privy.io/guide/guides/farcaster-login) feature to create novel, cross-app experiences for your users.

When a user first opens this app in their Farcaster client a few things happen. Behind the scenes, Privy automatically logs the user in with their Farcaster account, The client injexts the available wallet automatically (Warplet Wallet in Farcaster and Coinbase Wallet in TBA). 

This app is built with [NextJS](https://nextjs.org/), and makes uses of miniapp-sdk [`@farcaster/miniapp-sdk`](https://www.npmjs.com/package/@farcaster/miniapp-sdk)

>Note: If you are looking to use Wagmi in your app, checkout [Miniapp Starter with Wagmi](https://github.com/privy-io/privy-frames-v2-demo/tree/feat/miniapp-v2-wagmi) for a complete implementation.
## Live Demo

To see this demo in action, share [`https://privy-frames-v2-demo.vercel.app/`](https://privy-frames-v2-demo.vercel.app/) in any Farcaster client that supports Frames (e.g. Farcaster, TBA) and interact with it.

## Setup

1. Configure [a new Privy app](https://dashboard.privy.io/) with [Farcaster login enabled](https://docs.privy.io/guide/react/recipes/misc/farcaster#login-with-farcaster).

2. Fork this repository, clone it, and open it in your command line:

```sh
git clone https://github.com/<your-github-handle>/privy-frames-v2-demo
```

3. Install the necessary dependencies using your preferred package manager:

```sh
npm i
```

4. Initialize your environment variables by copying the contents of `.env.example` to a new `.env.local` file, and fill in the required values. You'll need to set a base URL, and your Privy app ID.

```sh
NEXT_PUBLIC_URL=<insert-the-url-for-your-frame>
PRIVY_APP_ID=<insert-your-privy-app-id>
```

**That's it!** To run the demo locally, execute `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## Testing the frame

You can test this Frame using [Farcaster Developer site](https://farcaster.xyz/~/developers/mini-apps/embed) to preview the miniapp. Please note that a `localhost` URL will not work with the developer Tools, so you should set up a public tunnel to your local app using a tool like [`ngrok`](https://ngrok.com/) or [Cloudflare](https://www.cloudflare.com/products/tunnel/).

## Check out

- `src/page.tsx` to see how to use Privy to seamlessly login a user in a Farcaster frame
