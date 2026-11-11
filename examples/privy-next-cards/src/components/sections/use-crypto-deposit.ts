"use client";

import { useState } from "react";
import { useDepositFunds } from "@privy-io/react-auth";

import { showErrorToast } from "../ui/custom-toast";

/**
 * Opens Privy's crypto deposit modal for the production funding wallet. The user sends USDC on Base
 * to a Privy deposit address, and Privy converts it to OUSD on Tempo
 * and delivers it to the funding wallet. With Earn auto-deposit on, that delivery then moves into
 * Earn, so the card can spend it.
 *
 * The default `dedicated` deposit address strategy keeps the deposit address separate from the
 * funding wallet, so the converted OUSD arrives as an ordinary deposit that the Earn automation
 * picks up.
 */
export const useCryptoDeposit = ({ walletId }: { walletId?: string }) => {
  const { depositFunds } = useDepositFunds();
  const [isDepositing, setIsDepositing] = useState(false);

  const deposit = async () => {
    if (!walletId) return;

    setIsDepositing(true);
    try {
      await depositFunds({
        destination: { asset: "ousd", chain: "tempo", wallet: walletId },
        // Privy requires app-pays gas sponsorship on every source chain a deposit account accepts,
        // so the demo accepts only USDC on Base. Widen this to the chains your app sponsors.
        crypto: {
          source: {
            mode: "include",
            values: [{ asset: "usdc", chain: "base" }],
          },
        },
      });
    } catch (error) {
      // Closing the deposit modal rejects with one of these instead of resolving.
      const cancelled =
        error instanceof Error &&
        ["User cancelled funding", "USER_EXITED"].includes(error.message);
      if (!cancelled) {
        showErrorToast(
          error instanceof Error ? error.message : "Crypto deposit failed",
        );
      }
    } finally {
      setIsDepositing(false);
    }
  };

  return { deposit, isDepositing };
};
