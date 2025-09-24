"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import {createConfig} from '@privy-io/wagmi';
import {http} from 'viem';
import {mainnet, sepolia, base, baseSepolia} from 'viem/chains';
import {WagmiProvider} from '@privy-io/wagmi';


const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, base, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {

  
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
        appearance: { walletChainType: "ethereum-and-solana" },
        externalWallets: { solana: { connectors: toSolanaWalletConnectors() } },
      }}
    >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            {children}
          </WagmiProvider>
        </QueryClientProvider>
    </PrivyProvider>
  );
}


