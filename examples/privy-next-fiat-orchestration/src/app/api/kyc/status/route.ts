import { NextResponse } from "next/server";
import { withAuth } from "@/lib/server-auth";
import { privyApiCall } from "@/lib/privy-client";
import { ENVIRONMENT, PROVIDER, type KyxStatusResponse } from "@/lib/kyx";

// Full KYC/KYB snapshot for the authenticated user.
export const GET = withAuth(async (_req, userId) => {
  const result = await privyApiCall<{
    kyc_statuses?: KyxStatusResponse[];
    next_cursor?: string | null;
  }>("GET", `/v1/users/${userId}/kyc?provider=${PROVIDER}`);

  // The endpoint returns one snapshot per configured provider/environment, in a
  // `kyc_statuses` array. Surface the sandbox one (falling back to the first
  // available snapshot).
  const snapshots = result.result?.kyc_statuses ?? [];
  const match =
    snapshots.find((snapshot) => snapshot.environment === ENVIRONMENT) ??
    snapshots[0] ??
    null;

  return NextResponse.json({ ...result, result: match });
});
