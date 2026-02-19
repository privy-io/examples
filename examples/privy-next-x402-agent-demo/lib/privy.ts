import { PrivyClient } from '@privy-io/node';

// Lazy initialization to avoid build-time errors
let _privy: PrivyClient | null = null;

export function getPrivyClient(): PrivyClient {
  if (_privy) return _privy;
  
  if (!process.env.PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
    throw new Error('Missing PRIVY_APP_ID or PRIVY_APP_SECRET environment variables');
  }
  
  _privy = new PrivyClient({
    appId: process.env.PRIVY_APP_ID,
    appSecret: process.env.PRIVY_APP_SECRET,
  });
  
  return _privy;
}

export type AgentWallet = {
  id: string;
  address: string;
  chainType: 'ethereum';
};

/**
 * Create a new wallet for an agent
 */
export async function createAgentWallet(): Promise<AgentWallet> {
  const wallet = await getPrivyClient().wallets().create({
    chain_type: 'ethereum',
  });

  return {
    id: wallet.id,
    address: wallet.address,
    chainType: 'ethereum',
  };
}

/**
 * Get wallet details by ID
 */
export async function getWallet(walletId: string) {
  return getPrivyClient().wallets().get(walletId);
}

/**
 * TransferWithAuthorization typed data definition for x402/EIP-3009
 */
const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
};

/**
 * Convert cents to USDC base units (6 decimals)
 * $1.00 = 100 cents = 1000000 base units
 */
function centsToUsdcBaseUnits(cents: number): string {
  return String(cents * 10000);
}

/**
 * Create a spending policy for an agent wallet
 * This policy will ALLOW eth_signTypedData_v4 requests where the value is within the limit
 */
export async function createSpendingPolicy(
  agentId: string,
  maxPerTransactionCents: number
): Promise<{ id: string }> {
  const policy = await getPrivyClient().policies().create({
    chain_type: 'ethereum',
    name: `agent-${agentId}-spending-policy`,
    version: '1.0',
    rules: [
      {
        name: 'per-transaction-limit',
        method: 'eth_signTypedData_v4',
        action: 'ALLOW',
        conditions: [
          {
            field_source: 'ethereum_typed_data_message',
            field: 'value',
            operator: 'lte',
            value: centsToUsdcBaseUnits(maxPerTransactionCents),
            typed_data: {
              primary_type: 'TransferWithAuthorization',
              types: TRANSFER_WITH_AUTHORIZATION_TYPES,
            },
          },
        ],
      },
    ],
  });

  return { id: policy.id };
}

/**
 * Update an existing spending policy with a new transaction limit
 */
export async function updateSpendingPolicy(
  policyId: string,
  maxPerTransactionCents: number
): Promise<void> {
  await getPrivyClient().policies().update(policyId, {
    rules: [
      {
        name: 'per-transaction-limit',
        method: 'eth_signTypedData_v4',
        action: 'ALLOW',
        conditions: [
          {
            field_source: 'ethereum_typed_data_message',
            field: 'value',
            operator: 'lte',
            value: centsToUsdcBaseUnits(maxPerTransactionCents),
            typed_data: {
              primary_type: 'TransferWithAuthorization',
              types: TRANSFER_WITH_AUTHORIZATION_TYPES,
            },
          },
        ],
      },
    ],
  });
}

/**
 * Attach a policy to a wallet
 */
export async function attachPolicyToWallet(
  walletId: string,
  policyId: string
): Promise<void> {
  await getPrivyClient().wallets().update(walletId, {
    policy_ids: [policyId],
  });
}
