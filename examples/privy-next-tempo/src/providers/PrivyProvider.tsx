"use client";

import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { tempo as configureTempo } from "tempo.ts/chains";

const tempo = configureTempo({
  feeToken: "0x20c0000000000000000000000000000000000001",
});

const queryClient = new QueryClient();

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <BasePrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "sms", "wallet"],
        defaultChain: tempo,
        supportedChains: [tempo],
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

function ViemProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState();

  useEffect(() => {}, []);

  return <>{children}</>;
}
