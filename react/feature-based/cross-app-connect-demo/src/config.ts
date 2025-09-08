import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { mainnet, sepolia, base, baseSepolia } from "wagmi/chains";

import { toPrivyWallet } from "@privy-io/cross-app-connect/rainbow-kit";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        toPrivyWallet({
          id: "clxva96js0039k9pb3pw2uovx", // The Privy app id of provider application
          name: "Strawberry Fields", // The name of the provider application
          iconUrl:
            "https://privy-assets-public.s3.amazonaws.com/strawberry.png", // The icon to appear in the connector modal
        }),
      ],
    },
  ],
  {
    appName: "Privy",
    projectId: "Example",
  }
);

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, base, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors,
  ssr: true,
});
