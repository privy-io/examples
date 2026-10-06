import { NextResponse } from "next/server";
import { withAuth } from "@/lib/server-auth";
import { privyApiCall, PRIVY_ID_PATTERN } from "@/lib/privy-client";

/**
 * Payout is a single Privy call. Privy resolves the Bridge customer from the
 * wallet's entity, finds or creates a liquidation address for the destination
 * fiat account, and initiates the on-chain transfer to it — so the client never
 * sees a deposit address.
 *
 * It does spend from the wallet, so a user-owned wallet requires the user's
 * authorization signature (built by /api/payout/prepare). Without one Privy
 * returns "No valid authorization keys or user signing keys available".
 */
export const POST = withAuth(async (req) => {
  const {
    wallet_id: walletId,
    requestBody,
    authorization_signature: authorizationSignature,
  } = await req.json();

  if (typeof walletId !== "string" || !PRIVY_ID_PATTERN.test(walletId)) {
    return NextResponse.json({ error: "Invalid wallet_id" }, { status: 400 });
  }

  const result = await privyApiCall(
    "POST",
    `/v1/wallets/${walletId}/payout/fiat`,
    requestBody,
    authorizationSignature
      ? { "privy-authorization-signature": authorizationSignature }
      : undefined,
  );

  return NextResponse.json(result);
});
