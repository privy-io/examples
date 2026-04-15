# Privy Wallet Agent

A crypto wallet assistant that signs messages and sends transactions on
Ethereum and Solana via the Privy Agent CLI.

## Features

- Ethereum and Solana wallet management via Privy
- Sign messages and send on-chain transactions
- Paid API requests via x402 and MPP payment protocols
- Human oversight dashboard at agents.privy.io

## Setup

1. Deploy this template
2. Run `pnpm dlx @privy-io/agent-wallet-cli login --non-interactive`
3. Complete browser authentication and paste the credentials blob back to the agent
4. Fund your wallet by running `pnpm dlx @privy-io/agent-wallet-cli fund`

## Commands

- "Show my wallets" — lists your Ethereum and Solana addresses
- "Send 0.01 ETH to 0x..." — executes a transaction after confirmation
- "Sign this message" — signs a plaintext or typed data message
- "Fund my wallet" — opens the Privy funding flow
- "Log out" — clears the local session
