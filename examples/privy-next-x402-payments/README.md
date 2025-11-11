# x402 Payments with Privy

This example demonstrates how to integrate the [x402 payment protocol](https://x402.org) with Privy embedded wallets to enable automatic USDC payments for API access.

## What is x402?

x402 is an open payment protocol that enables instant, programmatic payments for APIs and digital content over HTTP. When a resource requires payment, the server responds with `402 Payment Required`. The client automatically constructs an `X-PAYMENT` header with a signed authorization and retries the request.

## What You'll Learn

- Using Privy's `useX402Fetch` hook for automatic payments
- Building x402-enabled API endpoints that require payment
- Verifying and settling payments with Coinbase's x402 facilitator
- Decoding payment receipts with transaction details

## Prerequisites

- Node.js 18+ and npm
- A Privy account ([sign up here](https://dashboard.privy.io))
- Testnet USDC on Base Sepolia ([get from Circle's faucet](https://faucet.circle.com/))

## Setup

1. **Clone and install**:

```bash
git clone https://github.com/privy-io/examples.git
cd examples/examples/privy-next-x402-payments
npm install
```

2. **Configure environment**:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Privy App ID from [dashboard.privy.io](https://dashboard.privy.io).

3. **Run the example**:

```bash
npm run dev
```

4. **Open** [http://localhost:3200](http://localhost:3200)

## How It Works

### Client Side (`pages/index.tsx`)

```typescript
import { useX402Fetch, useWallets } from "@privy-io/react-auth";

const { wallets } = useWallets();
const { wrapFetchWithPayment } = useX402Fetch();

// Wrap fetch to automatically handle 402 payments
const fetchWithPayment = wrapFetchWithPayment({
  walletAddress: wallets[0].address,
  fetch,
  maxValue: BigInt(10000000), // Max 10 USDC
});

// Use like normal fetch - automatically handles payments
const response = await fetchWithPayment("/api/weather");
```

### Server Side (`pages/api/weather.ts`)

The API endpoint:

1. Returns `402 Payment Required` if no `X-PAYMENT` header is present
2. Verifies the payment with Coinbase's facilitator
3. Settles the payment onchain
4. Returns the weather data with a payment receipt

## Testing

1. **Login** with Privy (creates an embedded wallet)
2. **Get testnet USDC** from [Circle's faucet](https://faucet.circle.com/) for Base Sepolia
3. **Click** "Fetch Paid Weather Data"
4. **Sign** the payment authorization when prompted
5. **See** the weather data and transaction receipt!

## Payment Flow

1. Client calls `fetchWithPayment('/api/weather')`
2. Server responds with `402 Payment Required` + payment requirements
3. Hook builds EIP-712 typed data for USDC transfer authorization
4. Privy prompts user to sign (no gas required - facilitator pays)
5. Hook retries request with `X-PAYMENT` header
6. Server verifies payment with Coinbase facilitator
7. Facilitator settles payment onchain on Base Sepolia
8. Server returns weather data + `X-PAYMENT-RESPONSE` receipt
9. Client displays data and transaction link

## Code Walkthrough

### useX402Fetch Hook

The `useX402Fetch` hook wraps the native fetch API to automatically:

- Detect `402 Payment Required` responses
- Build and sign payment authorizations using Privy embedded wallets
- Retry requests with the `X-PAYMENT` header
- Protect users with max payment limits

### Payment Requirements

The server specifies:

- **Scheme**: `exact` (pay exact amount)
- **Network**: `base-sepolia` (testnet)
- **Amount**: `1000` (0.001 USDC, 6 decimals)
- **Asset**: USDC contract address
- **PayTo**: Receiving wallet address

### EIP-3009 Authorization

Payments use USDC's `transferWithAuthorization` method:

- User signs an off-chain authorization
- Facilitator submits it onchain (pays gas)
- USDC transfers from user to merchant
- No ETH needed by the user!

## Resources

- [x402 Protocol Specification](https://github.com/coinbase/x402)
- [Coinbase x402 Documentation](https://docs.cdp.coinbase.com/x402/welcome)
- [Privy x402 Recipe](https://docs.privy.io/recipes/x402)
- [Privy Documentation](https://docs.privy.io)
- [EIP-3009: Transfer With Authorization](https://eips.ethereum.org/EIPS/eip-3009)

## Production Considerations

For production use:

- Use mainnet (`base` network) instead of `base-sepolia`
- Use Coinbase's mainnet facilitator (requires CDP API keys)
- Set appropriate `maxValue` limits
- Add proper error handling and user feedback
- Monitor payment settlement and handle failures

See the [Coinbase x402 Mainnet Guide](https://docs.cdp.coinbase.com/x402/quickstart-for-sellers#running-on-mainnet) for production setup.

## Questions?

- Join the [Privy Discord](https://privy.io/discord)
- Check out [Privy docs](https://docs.privy.io)
- Visit [x402.org](https://x402.org)
