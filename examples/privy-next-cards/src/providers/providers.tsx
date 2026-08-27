"use client";

import { PrivyProvider } from "@privy-io/react-auth";

import { TEMPO_MAINNET, TEMPO_TESTNET } from "@/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        // The card is created for an embedded Ethereum wallet, so every user needs one before they
        // can sign up. This demo is EVM-only, so no Solana wallets are configured.
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        // Both Tempo chains have to be declared here, not just labelled in the Cards section. The
        // spend-approval step calls `wallet_switchEthereumChain` to the card's chain before it reads
        // the allowance, and a chain the provider does not know about fails that switch — which
        // surfaces as a generic approval error rather than anything pointing at chain config.
        defaultChain: TEMPO_TESTNET,
        supportedChains: [TEMPO_TESTNET, TEMPO_MAINNET],
        appearance: { walletChainType: "ethereum-only" },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
