"use client";

import { useState } from "react";

import type { CardEnvironment } from "@/chains";
import { showErrorToast, showSuccessToast } from "../ui/custom-toast";
import { simulateSpend } from "./simulate-spend";

const AMOUNT = 50;

export const useSimulatedCardSpend = ({
  cardId,
  environment,
  getAccessToken,
}: {
  cardId: string | null;
  environment: CardEnvironment;
  getAccessToken: () => Promise<string | null>;
}) => {
  const [isSpending, setIsSpending] = useState(false);

  const simulate = async () => {
    if (!cardId) return;

    setIsSpending(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Log in first");

      const result = await simulateSpend({
        cardId,
        environment,
        accessToken: token,
        amount: AMOUNT,
      });

      if (result.approved) {
        showSuccessToast("Simulated purchase captured. Open the card summary.");
      } else {
        showErrorToast(
          `Authorization declined${result.declineReason ? `: ${result.declineReason}` : ""}. It still appears in the transaction list.`,
        );
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Simulated purchase failed",
      );
    } finally {
      setIsSpending(false);
    }
  };

  return {
    isSpending,
    label: `$${(AMOUNT / 100).toFixed(2)}`,
    simulate,
  };
};
