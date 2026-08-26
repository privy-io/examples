"use client";

import { PrivyProvider } from "@privy-io/react-auth";

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
        appearance: { walletChainType: "ethereum-only" },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
