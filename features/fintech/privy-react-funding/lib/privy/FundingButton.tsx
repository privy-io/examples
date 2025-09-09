"use client";

import { useFundWallet, useWallets } from "@privy-io/react-auth";

const FundingButton = () => {
  const { wallets } = useWallets();
  const { fundWallet } = useFundWallet();

  return (
    <button
      onClick={() =>
        fundWallet(wallets[0].address, { asset: "USDC", amount: "15" }).catch(
          console.error,
        )
      }
    >
      Fund 15 USDC
    </button>
  );
};

export default FundingButton;
