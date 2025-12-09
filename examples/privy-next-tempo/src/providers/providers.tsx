"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import { http, defineChain } from "viem";

export const alphaUsd = "0x20c0000000000000000000000000000000000001" as const;

const queryClient = new QueryClient();

export const tempoChain = defineChain({
  id: 42429,
  name: "Tempo Testnet",
  nativeCurrency: {
    name: "AlphaUSD",
    symbol: "AUSD",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ["/api/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Tempo Explorer",
      url: "https://explore.tempo.xyz",
    },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [tempoChain],
  transports: {
    [tempoChain.id]: http("/api/rpc"),
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
        },
        appearance: { walletChainType: "ethereum-only" },
        supportedChains: [tempoChain],
        defaultChain: tempoChain,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
