# Agents

## Delegation Rules
When a task requires on-chain execution, delegate to the transaction
sub-agent by passing the RPC method and params.

## Communication
- Use structured JSON messages between agents
- Always include a `taskId` for tracking
- Report results back to the requesting agent

## Available Agents
- **Wallet Manager**: Lists wallets, checks balances, and manages session state via `privy-agent-wallets`
- **Transaction Executor**: Signs and broadcasts transactions on Ethereum and Solana using the `rpc` command
- **Session Handler**: Manages login, logout, and credential storage for the Privy agent session
