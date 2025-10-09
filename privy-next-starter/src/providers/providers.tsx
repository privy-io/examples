"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

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
        solana: {
          rpcs: {
            "solana:mainnet": {
              rpc: createSolanaRpc(
                process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL ||
                  "https://api.mainnet-beta.solana.com",
              ),
              rpcSubscriptions: createSolanaRpcSubscriptions(
                process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL?.replace(
                  "http",
                  "ws",
                ) || "wss://api.mainnet-beta.solana.com",
              ),
            },
            "solana:devnet": {
              rpc: createSolanaRpc("https://api.devnet.solana.com"),
              rpcSubscriptions: createSolanaRpcSubscriptions(
                "wss://api.devnet.solana.com",
              ),
            },
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
