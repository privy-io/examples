"use client";

/** Privy API base. Override only if you point the demo at a non-production Privy API. */
const PRIVY_API_URL =
  process.env.NEXT_PUBLIC_PRIVY_API_URL ?? "https://auth.privy.io";

export type Card = {
  /** Privy card id — what the card views take. */
  id: string;
  /** Stripe Issuing card id — what Stripe's test helpers take. */
  provider_id: string;
};

/**
 * The authenticated user's cards in one environment.
 *
 * Hand-rolled because the SDK exports no card-list hook, which is also why the demo needs it: it is
 * the only way to tell whether a user already has a card, and the only source of the Stripe card id.
 *
 * TODO: replace with an SDK card lookup once one exists.
 */
export const listCards = async ({
  environment,
  accessToken,
}: {
  environment: string;
  accessToken: string;
}) => {
  const url = new URL("/api/v1/cards", PRIVY_API_URL);
  url.searchParams.set("environment", environment);

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "privy-app-id": process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "",
    },
  });

  if (!response.ok) throw new Error("Could not list cards");

  const { data }: { data: Card[] } = await response.json();
  return data;
};
