"use client";

import { listCards } from "./cards-api";

/**
 * Runs a simulated purchase on the card: authorize, then capture if approved.
 *
 * Sandbox only — Stripe's Issuing test helpers do not exist for live keys, so there is no way to
 * fabricate a production authorization.
 *
 * The amount only affects the transaction list. The balance shown by `CardSummaryView` is the
 * funding wallet's on-chain balance, so a simulated purchase does not move it — real settlement
 * pulls USDC through the Bridge spender.
 */
export const simulateSpend = async ({
  cardId,
  environment,
  accessToken,
  amount,
  merchantName,
}: {
  cardId: string;
  environment: string;
  accessToken: string;
  amount: number;
  merchantName?: string;
}) => {
  // Stripe's test helpers key off its own card id, not Privy's.
  const cards = await listCards({ environment, accessToken });
  const stripeCardId = cards.find((card) => card.id === cardId)?.provider_id;
  if (!stripeCardId) throw new Error("Card not found");

  const response = await fetch("/api/test-spend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId: stripeCardId, amount, merchantName }),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error ?? "Simulated purchase failed");
  }

  return body as {
    authorizationId: string;
    approved: boolean;
    captured: boolean;
    declineReason?: string | null;
  };
};
