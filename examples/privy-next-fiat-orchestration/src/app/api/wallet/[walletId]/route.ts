import { NextResponse } from "next/server";
import { withAuthParams } from "@/lib/server-auth";
import { privyApiCall, PRIVY_ID_PATTERN } from "@/lib/privy-client";

// Read a wallet, including whether it has an entity assigned.
export const GET = withAuthParams<{ walletId: string }>(
  async (_req, _userId, { params }) => {
    const { walletId } = await params;
    if (!PRIVY_ID_PATTERN.test(walletId)) {
      return NextResponse.json({ error: "Invalid wallet ID" }, { status: 400 });
    }

    const result = await privyApiCall<{ id: string; entity: unknown }>(
      "GET",
      `/v1/wallets/${walletId}`,
    );

    return NextResponse.json(result);
  },
);
