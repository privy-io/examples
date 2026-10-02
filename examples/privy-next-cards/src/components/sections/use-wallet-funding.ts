"use client";

import { useState } from "react";

import { showErrorToast, showSuccessToast } from "../ui/custom-toast";
import { fundWallet } from "./tempo-faucet";

export const useWalletFunding = ({
  address,
  token,
}: {
  address?: string;
  token: string | null;
}) => {
  const [isFunding, setIsFunding] = useState(false);

  const fund = async () => {
    if (!address) return;

    setIsFunding(true);
    try {
      await fundWallet(address);
      showSuccessToast(
        `Faucet sent test stablecoins to the wallet. ${token} balances may take a moment to show up.`,
      );
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Faucet request failed",
      );
    } finally {
      setIsFunding(false);
    }
  };

  return { fund, isFunding };
};
