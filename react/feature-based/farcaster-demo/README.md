# Privy Farcaster Demo

This is a simple demo using Privy to login and write with Farcaster.

## Documentation

Integrate Farcaster login with Privy by following [this guide](https://docs.privy.io/guide/react/recipes/misc/farcaster).
To enable your users to write to their Farcaster account, please refer to the [Privy Farcaster Write documentation](https://docs.privy.io/guide/react/recipes/misc/farcaster-writes).

## Run this demo locally

```sh
# Clone repo
git clone git@github.com:privy-io/farcaster-demo.git
cd farcaster-demo

# Create .env.local file from example, filling in your Privy App ID.
cp .env.example.local .env.local

# Install dependencies
npm i

# Start the demo
npm run dev
```
