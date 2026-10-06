import { NextResponse } from "next/server";
import { withAuth } from "@/lib/server-auth";
import { privyApiCall } from "@/lib/privy-client";
import { ENVIRONMENT, PROVIDER } from "@/lib/kyx";

// List external fiat accounts.
export const GET = withAuth(async (_req, userId) => {
  const result = await privyApiCall(
    "GET",
    `/v1/users/${userId}/external_fiat_accounts?provider=${PROVIDER}&environment=${ENVIRONMENT}`,
  );

  return NextResponse.json(result);
});

// Create an external fiat account.
export const POST = withAuth(async (req, userId) => {
  const accountData = await req.json();

  const result = await privyApiCall(
    "POST",
    `/v1/users/${userId}/external_fiat_accounts`,
    { ...accountData, provider: PROVIDER, environment: ENVIRONMENT },
  );

  return NextResponse.json(result);
});
