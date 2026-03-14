import { PrivyClient } from '@privy-io/node';

// Lazy initialization to avoid build-time errors
let _privy: PrivyClient | null = null;

export function getPrivyClient(): PrivyClient {
  if (_privy) return _privy;

  if (!process.env.PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
    throw new Error(
      'Missing PRIVY_APP_ID or PRIVY_APP_SECRET environment variables'
    );
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
