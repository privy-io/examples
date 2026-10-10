import { NextResponse } from "next/server";
import { withAuth } from "@/lib/server-auth";
import { privyApiCall, PRIVY_ID_PATTERN } from "@/lib/privy-client";
import { ENVIRONMENT, PROVIDER } from "@/lib/kyx";

// List a wallet's fiat deposit accounts.
export const GET = withAuth(async (req) => {
  const params = new URL(req.url).searchParams;
  const walletId = params.get("wallet_id") ?? "";
  if (!PRIVY_ID_PATTERN.test(walletId)) {
    return NextResponse.json({ error: "Invalid wallet_id" }, { status: 400 });
  }

  const result = await privyApiCall(
    "GET",
    `/v1/wallets/${walletId}/deposit_accounts/fiat?provider=${PROVIDER}&environment=${ENVIRONMENT}`,
  );

  return NextResponse.json(result);
});

// Create a fiat deposit account for a wallet.
export const POST = withAuth(async (req) => {
  const walletId = new URL(req.url).searchParams.get("wallet_id") ?? "";
  if (!PRIVY_ID_PATTERN.test(walletId)) {
    return NextResponse.json({ error: "Invalid wallet_id" }, { status: 400 });
  }
  const depositAccountData = await req.json();

  const result = await privyApiCall(
    "POST",
    `/v1/wallets/${walletId}/deposit_accounts/fiat`,
    { ...depositAccountData, provider: PROVIDER, environment: ENVIRONMENT },
  );

  return NextResponse.json(result);
});
