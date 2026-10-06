import { NextResponse } from "next/server";
import { withAuthParams } from "@/lib/server-auth";
import { privyApiCall, PRIVY_ID_PATTERN } from "@/lib/privy-client";

/**
 * Assign the authenticated user as the wallet's entity. Set-once and immutable.
 *
 * Neither login-time wallet creation nor POST /v1/users assigns an entity, but
 * the V2 fiat endpoints resolve KYC by entity rather than owner — so a
 * login-created wallet is rejected until this runs.
 */
export const POST = withAuthParams<{ walletId: string }>(
  async (_req, userId, { params }) => {
    const { walletId } = await params;
    if (!PRIVY_ID_PATTERN.test(walletId)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 });
    }

    const result = await privyApiCall(
      "POST",
      `/v1/wallets/${walletId}/entity`,
      { id: userId, type: "user" },
    );

    return NextResponse.json(result);
  },
);
