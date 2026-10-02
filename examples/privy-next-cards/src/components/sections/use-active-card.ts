"use client";

import { useEffect, useState } from "react";

import type { CardEnvironment } from "@/chains";
import { isOpen, listCards } from "./cards-api";

export const useActiveCard = ({
  userId,
  environment,
  getAccessToken,
}: {
  userId?: string;
  environment: CardEnvironment;
  getAccessToken: () => Promise<string | null>;
}) => {
  const [cardId, setCardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCardId(null);
      setTotalCards(0);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("No access token");

        const cards = await listCards({ environment, accessToken: token });
        if (!active) return;

        setCardId(cards.find(isOpen)?.id ?? null);
        setTotalCards(cards.length);
      } catch (error) {
        if (!active) return;
        setCardId(null);
        setTotalCards(0);
        setError(error instanceof Error ? error.message : "Card lookup failed");
        console.error("Cards: card lookup failed", error);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId, environment, getAccessToken]);

  return { cardId, setCardId, error, isLoading, totalCards };
};
