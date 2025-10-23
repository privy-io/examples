'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import {baseSepolia} from 'viem/chains';
import {SmartWalletsProvider} from '@privy-io/react-auth/smart-wallets';
import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';
import {createSolanaRpc, createSolanaRpcSubscriptions} from '@solana/kit';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {theme: 'light', walletChainType: 'ethereum-and-solana'},
        externalWallets: {solana: {connectors: toSolanaWalletConnectors()}},
        defaultChain: baseSepolia,
        embeddedWallets: {
          showWalletUIs: false,
        },
        mfa: {
          // Use custom UIs for MFA
          noPromptOnMfaRequired: true,
        },
        solana: {
          rpcs: {
            'solana:mainnet': {
              rpc: createSolanaRpc(
                process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL ||
                  'https://api.mainnet-beta.solana.com',
              ),
              rpcSubscriptions: createSolanaRpcSubscriptions(
                process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL?.replace('http', 'ws') ||
                  'wss://api.mainnet-beta.solana.com',
              ),
            },
            'solana:devnet': {
              rpc: createSolanaRpc('https://api.devnet.solana.com'),
              rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com'),
            },
          },
        },
      }}
    >
      {/* Remove <SmartWalletsProvider if you do not want to use smart wallets */}
      <SmartWalletsProvider>{children}</SmartWalletsProvider>
    </PrivyProvider>
  );
}
