import { NextResponse } from "next/server";
import { withAuth } from "@/lib/server-auth";
import { PRIVY_API_BASE } from "@/lib/privy-env";
import { PRIVY_ID_PATTERN } from "@/lib/privy-client";

/**
 * Builds the payload the client must sign before a payout can execute.
 *
 * payout/fiat spends from the wallet, so a user-owned wallet requires a user
 * authorization signature — an app secret alone returns
 * "No valid authorization keys or user signing keys available". The endpoint is
 * server-only, so the server assembles the exact request, the client signs it
 * with useAuthorizationSignature(), and the signature comes back to
 * /api/payout to execute.
 *
 * The signature covers the URL, so it must be built from the same base the
 * server will call — staging and production differ.
 */
export const POST = withAuth(async (req) => {
  const { wallet_id: walletId, source, destination } = await req.json();

  if (typeof walletId !== "string" || !PRIVY_ID_PATTERN.test(walletId)) {
    return NextResponse.json({ error: "Invalid wallet_id" }, { status: 400 });
  }

  const requestBody = { source, destination };

  const signaturePayload = {
    version: 1,
    method: "POST",
    url: `${PRIVY_API_BASE}/v1/wallets/${walletId}/payout/fiat`,
    headers: { "privy-app-id": process.env.PRIVY_APP_ID! },
    body: requestBody,
  };

  return NextResponse.json({
    result: { signaturePayload, requestBody, wallet_id: walletId },
    meta: {
      method: "POST",
      url: `/v1/wallets/${walletId}/payout/fiat (prepare signing payload)`,
      requestBody,
      responseStatus: 200,
      responseBody: { signaturePayload },
      durationMs: 0,
    },
  });
});
