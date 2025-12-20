"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// IMPORTANT: Privy's embedded wallet uses `postMessage` internally. viem's Tempo chain
// (`viem/chains` -> `tempoTestnet`) includes functions on the chain config (formatters,
// serializers, prepareTransactionRequest), which cannot be cloned across `postMessage`.
// So we provide a plain-data chain object here.
const privyTempoTestnet = {
  id: 42429,
  name: "Tempo Testnet",
  nativeCurrency: { name: "USD", symbol: "USD", decimals: 6 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.tempo.xyz"],
      webSocket: ["wss://rpc.testnet.tempo.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "Tempo Explorer", url: "https://explore.tempo.xyz" },
  },
} as const;

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <BasePrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "sms", "wallet"],
        defaultChain: privyTempoTestnet,
        supportedChains: [privyTempoTestnet],
        appearance: {
          theme: "dark",
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
          showWalletUIs: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BasePrivyProvider>
  );
}
