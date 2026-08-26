"use client";

/** Privy API base. Override only if you point the demo at a non-production Privy API. */
const PRIVY_API_URL =
  process.env.NEXT_PUBLIC_PRIVY_API_URL ?? "https://auth.privy.io";

export type Card = {
  /** Privy card id — what the card views take. */
  id: string;
  /** Stripe Issuing card id — what Stripe's test helpers take. */
  provider_id: string;
  /** `active`, `inactive` (frozen), or `canceled`. A replaced card is left `canceled`. */
  status: string;
};

/** A card that is still usable. Cancelled cards stay in the list, so they have to be filtered out. */
export const isOpen = (card: Card) => card.status !== "canceled";

/**
 * The authenticated user's cards in one environment, newest first.
 *
 * Hand-rolled because the SDK exports no card-list hook, which is also why the demo needs it: it is
 * the only way to tell whether a user already has a card, and the only source of the Stripe card id.
 *
 * A user can accumulate several cards — replacing a card cancels the old one and issues a new one —
 * so callers want the newest open card rather than simply the first.
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

  if (!response.ok) {
    // Carry the status and the API's own message. The list request fails for reasons that are worth
    // reading rather than collapsing into "no card": cards not enabled for this environment, no
    // Stripe key saved for it, or a card the API could not enrich — it treats Stripe lookup and
    // balance reads as all-or-none, so one bad card fails the whole page.
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Could not list ${environment} cards (${response.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`,
    );
  }

  const { data }: { data: Card[] } = await response.json();
  return data;
};
