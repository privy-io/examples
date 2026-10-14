"use client";

/** Privy API base. Override only if you point the demo at a non-production Privy API. */
const PRIVY_API_URL =
  process.env.NEXT_PUBLIC_PRIVY_API_URL ?? "https://auth.privy.io";

export type Card = {
  /** Privy card id — what the card views take. */
  id: string;
  /** Stripe Issuing card id — what Stripe's test helpers take. */
  provider_id: string;
  /** `active`, `inactive` (frozen), `canceled`, or `replaced`. */
  status: string;
  /** Spend asset, e.g. `pathusd` or `ousd`. */
  asset: string;
  wallet_id: string;
  chain_id: string;
};

/** A card that is still usable. Closed cards stay in the list, so they have to be filtered out. */
export const isOpen = (card: Card) =>
  card.status === "active" || card.status === "inactive";

/**
 * The authenticated user's cards in one environment, newest first.
 *
 * `useGetCardsForUser` is the SDK hook for this list. This fetch stays so the simulated
 * purchase can resolve a Stripe card id without a React hook, and so the page can follow
 * every cursor. The API returns at most 20 cards per page and includes closed cards.
 */
export const listCards = async ({
  environment,
  accessToken,
}: {
  environment: string;
  accessToken: string;
}) => {
  const cards: Card[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < 10; page++) {
    const url = new URL("/api/v1/cards", PRIVY_API_URL);
    url.searchParams.set("environment", environment);
    url.searchParams.set("limit", "20");
    if (cursor) url.searchParams.set("cursor", cursor);

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

    const body: { data: Card[]; next_cursor?: string | null } =
      await response.json();
    cards.push(...body.data);
    if (!body.next_cursor || body.next_cursor === cursor) break;
    cursor = body.next_cursor;
  }

  return cards;
};
