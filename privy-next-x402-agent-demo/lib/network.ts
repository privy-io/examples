/**
 * Network configuration for Base mainnet and testnet (Sepolia)
 *
 * Set NETWORK_MODE env var to 'mainnet' or 'testnet' (default: testnet)
 */

export const NETWORK_MODE = process.env.NETWORK_MODE || 'testnet';

export const NETWORK_CONFIG = {
  testnet: {
    chainId: 'eip155:84532',
    chainIdNumber: 84532,
    usdcContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
    name: 'Base Sepolia',
    rpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    // Testnet uses facilitator for settlement
    useDirectSettlement: false,
    // EIP-712 domain for USDC (FiatTokenV2)
    usdcDomainName: 'USD Coin',
    usdcDomainVersion: '2',
  },
  mainnet: {
    chainId: 'eip155:8453',
    chainIdNumber: 8453,
    usdcContract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    name: 'Base',
    rpcUrl: process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    // Mainnet uses direct settlement (no facilitator)
    useDirectSettlement: true,
    // EIP-712 domain for USDC (FiatTokenV2)
    usdcDomainName: 'USD Coin',
    usdcDomainVersion: '2',
  },
} as const;

export type NetworkMode = keyof typeof NETWORK_CONFIG;

export function getNetworkConfig() {
  const mode = NETWORK_MODE as NetworkMode;
  if (!(mode in NETWORK_CONFIG)) {
    return NETWORK_CONFIG.testnet;
  }
  return NETWORK_CONFIG[mode];
}
