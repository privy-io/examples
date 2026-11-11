"use client";

import { useEffect, useState } from "react";
import { useAuthorizationSignature } from "@privy-io/react-auth";

import { showErrorToast, showSuccessToast } from "../ui/custom-toast";

const ROUTE = "/api/earn-auto-deposit";

const readError = async (response: Response) => {
  const body = await response.json().catch(() => null);
  return body?.error ?? `Request failed (${response.status})`;
};

/**
 * Reads and turns on Earn auto-deposit for the production funding wallet. See
 * `src/app/api/earn-auto-deposit/route.ts` for the wallet automation behind it.
 *
 * Turning it on takes two calls to the route: the first returns the attach request, which the user
 * signs here with their wallet's authorization key, and the second sends the signed request.
 */
export const useEarnAutoDeposit = ({
  walletId,
  isProduction,
  getAccessToken,
}: {
  walletId?: string;
  isProduction: boolean;
  getAccessToken: () => Promise<string | null>;
}) => {
  const { generateAuthorizationSignature } = useAuthorizationSignature();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    if (!walletId || !isProduction) return;

    let active = true;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("No access token");

        const response = await fetch(
          `${ROUTE}?walletId=${encodeURIComponent(walletId)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!active) return;
        setIsConfigured(response.status !== 503);
        if (!response.ok) throw new Error(await readError(response));
        const { enabled } = await response.json();
        if (active) setIsEnabled(enabled === true);
      } catch (error) {
        if (!active) return;
        setIsEnabled(false);
        setError(
          error instanceof Error
            ? error.message
            : "Earn auto-deposit lookup failed",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [walletId, isProduction, getAccessToken]);

  const enable = async () => {
    if (!walletId) return;

    setIsEnabling(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Log in first");

      const post = (body: object) =>
        fetch(ROUTE, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletId, ...body }),
        });

      const prepared = await post({});
      if (!prepared.ok) throw new Error(await readError(prepared));
      const { automationId, requestExpiry, input } = await prepared.json();

      const { signature } = await generateAuthorizationSignature(input);

      const attached = await post({ automationId, requestExpiry, signature });
      if (!attached.ok) throw new Error(await readError(attached));

      setIsEnabled(true);
      setError(null);
      showSuccessToast(
        "Earn auto-deposit is on. OUSD in the wallet moves into Earn.",
      );
    } catch (error) {
      showErrorToast(
        error instanceof Error
          ? error.message
          : "Could not turn on Earn auto-deposit",
      );
    } finally {
      setIsEnabling(false);
    }
  };

  return { isEnabled, isConfigured, error, isLoading, isEnabling, enable };
};
