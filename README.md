This is a [DecentSDK](https://docs.decent.xyz) + [Privy Auth](https://www.privy.io/) + [Next.js](https://nextjs.org/) project.

The purpose of this repository is to get you up & running quickly with the Decent SDK (@decent.xyz/sdk).  The primary functionality demonstrated in this repo is the ability to deploy Decent's 721A smart contract and fetch the address.  The deployment function used here can be copied to launch each of the other contracts included in the SDK.  This repository also demonstrates the Metadata Renderer module.

## Getting Started

First, install dependencies using npm (note: ```yarn add``` has reported mixed results):

```bash
npm i
```

Next, run `cp .env.example .env.local`. In `.env.local`, copy in your Privy App ID. You may leave the other environment variables blank.
```
NEXT_PUBLIC_PRIVY_APP_ID=<your-privy-app-id>
...
```

Lastly, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about this stack, take a look at the following resources:

- [DecentSDK Documentation](https://docs.decent.xyz) - Learn more about Decent's contracts and capabilities.
- [Privy Auth Documentation](https://docs.privy.io/) - Learn how to use Privy Auth to seamlessly connect user's wallets.
- [ethers Documentation](https://docs.ethers.io/v5/) - Learn how to interact with Ethereum.
- [Next.js Documentation](https://nextjs.org/docs) - Learn how to build a Next.js application.

Check is out & let us know what you think!  The [DecentHQ](https://hq.decent.xyz) represents a full implementation of the protocol.  It is built using the latest version of the Decent SDK (@decent.xyz/sdk) and will reflect all capabilities.  Check it out if you're looking for inspiration.  Your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
# Decent-Mint-Page
