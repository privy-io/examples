# Privy x Frames Demo

This is an example [**Frame**](https://warpcast.notion.site/Farcaster-Frames-4bd47fe97dc74a42a48d3a234636d8c5) to demonstrate how you can use [**Frames**](https://warpcast.notion.site/Farcaster-Frames-4bd47fe97dc74a42a48d3a234636d8c5) alongside Privy's [**Farcaster login**](https://docs.privy.io/guide/guides/farcaster-login) feature to create novel, cross-app experiences for your users.

When a user first sees this demo Frame in their Farcaster client, they can click a button to redeem a testnet NFT. Behind the scenes, Privy creates an embedded wallet associater with the current Farcaster user and airdrops an NFT to it. Users can view their NFT by signing in with their Farcaster account to the [**Privy Demo**](https://demo.privy.io). This is a **testnet NFT** on the Optimism Sepolia testnet.

This app is built with [NextJS](https://nextjs.org/), and makes uses of libraries like [`@coinbase/onchainkit`](https://github.com/coinbase/onchainkit), [`@farcaster/hub-node-js`](https://github.com/farcasterxyz/hub-monorepo/tree/main/packages/hub-nodejs), and [`viem`](https://viem.sh/) for interacting with the blockchain and the [Farcaster](https://www.farcaster.xyz/) protocol. 

## Live Demo

To see this demo in action, share [`https://privy-frames-demo.vercel.app`](https://privy-frames-demo.vercel.app) in any Farcaster client that supports Frames (e.g. Warpcast) and interact with it. You can then login to [`https://demo.privy.io`](https://demo.privy.io) to view your NFT. 

## Setup

1. Fork this repository, clone it, and open it in your command line:

```sh
git clone https://github.com/<your-github-handle>/privy-frames-demo
```

2. Install the necessary dependencies using your preferred package manager:

```sh
npm i 
```

3. Using a fresh development wallet, deploy an ERC-721 contract at to the Optimism Sepolia testnet. **Do not use a real wallet, as you must store the development wallet's seed phrase as an environment secret.** You can use a tool like [Remix](https://remix.ethereum.org/) or [`hardhat`](https://www.npmjs.com/package/hardhat) to deploy your contract.

4. Initialize your environment variables by copying the contents of `.env.example.local` to a new `.env.local` file, and fill in the required values. You'll need to set a base URL, your NFT contract address, the seed phrase for your development wallet, and your Privy app ID and secret. 

```sh
NEXT_PUBLIC_BASE_URL=<insert-the-url-for-your-frame>
NFT_CONTRACT_ADDRESS=<insert-the-nft-address>
NFT_WALLET_MNEMONIC=<insert-the-seed-phrase-for-your-dev-wallet>
PRIVY_APP_ID=<insert-your-privy-app-id>
PRIVY_APP_SECRET=<insert-your-privy-app-secret>
```

**That's it!** To run the demo locally, execute `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## Testing the frame

You can test this Frame using [Warpcast Embed Tools](https://warpcast.com/~/developers/frames) to preview the frame interaction. Please note that a `localhost` URL will not work with Warpcast Embed Tools, so you should set up a public tunnel to your local app using a tool like [`ngrok`](https://ngrok.com/) or [Cloudflare](https://www.cloudflare.com/products/tunnel/). 

## Check out
- `lib/embedded-wallet.ts` to see how to use Privy to pre-generate embedded wallets for a user's Farcaster accounts
- `lib/farcaster.ts` to see how Frames are generated and how to verify a user's Farcaster account and query the protocol for their Farcaster data
- `lib/nft.ts` to see how to airdrop the ERC-721 you deployed to a user's wallet address
- `api/wallet/route.ts` to see how the first Frame interaction generates an embedded wallet for the user
- `api/mint/[address].ts` to see how the second Frame interaction airdrops an NFT to the user
- `contracts/FrameDrop.sol` for the sample contract used, from OpenZeppelin
