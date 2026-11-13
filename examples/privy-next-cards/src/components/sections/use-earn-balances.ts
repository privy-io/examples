"use client";

import { useEffect, useState } from "react";

import {
  type EarnFundingSource,
  getEarnFundingSource,
  readEarnBalances,
} from "./use-earn-actions";

/** Purchases move shares without the page knowing, so balances refresh on a timer too. */
const REFRESH_INTERVAL_MS = 15_000;

type EarnBalances = Awaited<ReturnType<typeof readEarnBalances>>;

/**
 * The funding wallet's OUSD and Earn balances for a production card that spends from Earn, or
 * `null` for any other card. The funding source is looked up once per card; the balances are read
 * onchain on a timer and whenever `refreshKey` changes, e.g. when an Earn action settles.
 */
export const useEarnBalances = ({
  cardId,
  walletId,
  walletAddress,
  getAccessToken,
  refreshKey,
}: {
  cardId: string | null;
  walletId?: string;
  walletAddress?: string;
  getAccessToken: () => Promise<string | null>;
  refreshKey: unknown;
}) => {
  const [vault, setVault] = useState<EarnFundingSource | null>(null);
  const [balances, setBalances] = useState<EarnBalances | null>(null);

  useEffect(() => {
    setVault(null);
    setBalances(null);
    if (!cardId || !walletId) return;

    let active = true;
    void (async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) return;
      const source = await getEarnFundingSource({
        cardId,
        walletId,
        accessToken,
      }).catch(() => null);
      if (active) setVault(source);
    })();
    return () => {
      active = false;
    };
  }, [cardId, walletId, getAccessToken]);

  useEffect(() => {
    if (!vault || !walletAddress) return;

    let active = true;
    const refresh = () =>
      readEarnBalances({ vault, walletAddress })
        .then((next) => active && setBalances(next))
        .catch((error) => console.error("Cards: balance read failed", error));
    void refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [vault, walletAddress, refreshKey]);

  return balances;
};
