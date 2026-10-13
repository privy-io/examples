import { NextResponse } from "next/server";
import { withAuthParams } from "@/lib/server-auth";
import { privyApiCall, PRIVY_ID_PATTERN } from "@/lib/privy-client";

export const DELETE = withAuthParams<{ accountId: string }>(
  async (_req, userId, { params }) => {
    const { accountId } = await params;
    if (!PRIVY_ID_PATTERN.test(accountId)) {
      return NextResponse.json({ error: "Invalid account ID" }, { status: 400 });
    }

    const result = await privyApiCall(
      "DELETE",
      `/v1/users/${userId}/external_fiat_accounts/${accountId}`,
    );

    return NextResponse.json(result);
  },
);
