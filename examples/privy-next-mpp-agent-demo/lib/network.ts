/**
 * Network configuration for Tempo blockchain (testnet)
 *
 * Tempo Testnet (Moderato):
 * - Chain ID: 42431
 * - RPC: https://rpc.moderato.tempo.xyz
 * - Currency: PathUSD (0x20c0000000000000000000000000000000000000)
 */

export const NETWORK_CONFIG = {
  tempo: {
    chainId: 'eip155:42431',
    caip2: 'eip155:42431',
    pathUsdContract:
      '0x20c0000000000000000000000000000000000000' as `0x${string}`,
    name: 'Tempo Testnet',
    rpcUrl: 'https://rpc.moderato.tempo.xyz',
    explorerUrl: 'https://explore.tempo.xyz',
  },
} as const;

export function getNetworkConfig() {
  return NETWORK_CONFIG.tempo;
}
