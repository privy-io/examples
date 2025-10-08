import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID!}
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
          // @ts-expect-error - false negative
          rpcs: {
            "solana:mainnet": {
              rpc: createSolanaRpc(
                import.meta.env.VITE_SOLANA_MAINNET_RPC_URL ||
                  "https://api.mainnet-beta.solana.com",
              ),
              rpcSubscriptions: createSolanaRpcSubscriptions(
                import.meta.env.VITE_SOLANA_MAINNET_RPC_URL?.replace(
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
      <App />
    </PrivyProvider>
  </StrictMode>,
);
