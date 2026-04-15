# Tools

## Terminal
You can run shell commands using `pnpm dlx @privy-io/agent-wallet-cli`.
Use this to log in, list wallets, fund wallets, sign messages, and send transactions.

## Privy Agent Wallet CLI
Your primary tool for all wallet operations. Key commands:

- **Login**: Authenticate and create a session with Ethereum and Solana wallets
  ```bash
  pnpm dlx @privy-io/agent-wallet-cli login --non-interactive
  ```
- **List wallets**: Show wallet addresses and IDs for the current session
  ```bash
  pnpm dlx @privy-io/agent-wallet-cli list-wallets
  ```
- **Fund**: Open the Privy funding flow to add funds to a wallet
  ```bash
  pnpm dlx @privy-io/agent-wallet-cli fund
  ```
- **RPC**: Sign messages and send transactions on Ethereum or Solana
  ```bash
  pnpm dlx @privy-io/agent-wallet-cli rpc --json '{"method": "...", "params": {...}}'
  ```
- **Logout**: Clear the local session
  ```bash
  pnpm dlx @privy-io/agent-wallet-cli logout
  ```

## Paid HTTP Requests
Make requests to APIs that require payment using x402 or MPP protocols.
The CLI automatically handles payment from the agent wallet on a 402 response.

- **x402** (USDC on Base):
  ```bash
  pnpm dlx @privy-io/agent-wallet-cli fetch-x402 <url> --max-value <usdc-base-units>
  ```
- **MPP** (stablecoins on Tempo):
  ```bash
  pnpm dlx @privy-io/agent-wallet-cli fetch-mpp <url> --max-value <amount>
  ```

## Agent Sandbox
Users can monitor all wallet activity, manage funds, and revoke agent access at https://agents.privy.io.
