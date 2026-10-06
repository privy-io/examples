import { NextResponse } from "next/server";
import { privyApiCall } from "@/lib/privy-client";
import { PROVIDER, type KyxStatusResponse } from "@/lib/kyx";
import type { FiatDepositAccount } from "@/lib/api";
import type { ShowcaseBankAccount, ShowcaseResponse } from "@/lib/showcase";

export const dynamic = "force-dynamic";

const ENVIRONMENT = "sandbox";

/**
 * Read-only snapshot of a pre-seeded sandbox user (SHOWCASE_USER_ID) that has
 * already finished ToS, KYC, a deposit account and a bank account. This route
 * is unauthenticated, so it only ever reads that one configured user and
 * wallet, never an ID from the request.
 */
export async function GET() {
  const userId = process.env.SHOWCASE_USER_ID;
  const walletId = process.env.SHOWCASE_WALLET_ID;
  if (!userId || !walletId) {
    return NextResponse.json({ result: null }, { status: 404 });
  }

  const [kyc, depositAccounts, bankAccounts, balance] = await Promise.all([
    privyApiCall<{ kyc_statuses?: KyxStatusResponse[] }>(
      "GET",
      `/v1/users/${userId}/kyc?provider=${PROVIDER}`,
    ),
    privyApiCall<{ fiat_deposit_accounts?: FiatDepositAccount[] }>(
      "GET",
      `/v1/wallets/${walletId}/deposit_accounts/fiat?provider=${PROVIDER}&environment=${ENVIRONMENT}`,
    ),
    privyApiCall<{ external_fiat_accounts?: ShowcaseBankAccount[] }>(
      "GET",
      `/v1/users/${userId}/external_fiat_accounts?provider=${PROVIDER}&environment=${ENVIRONMENT}`,
    ),
    privyApiCall<{
      balances?: Array<{ display_values?: Record<string, string> }>;
    }>("GET", `/v1/wallets/${walletId}/balance?asset=usdc&chain=base`),
  ]);

  const result: ShowcaseResponse = {
    kyc:
      kyc.result.kyc_statuses?.find((s) => s.environment === ENVIRONMENT) ??
      null,
    depositAccounts: depositAccounts.result.fiat_deposit_accounts ?? [],
    bankAccounts: bankAccounts.result.external_fiat_accounts ?? [],
    balance: balance.result.balances?.[0]?.display_values?.usdc ?? null,
    calls: [kyc.meta, depositAccounts.meta, bankAccounts.meta, balance.meta],
  };

  // Every visitor sees the same snapshot, so let the CDN absorb the traffic
  // instead of forwarding each page view to the Privy API.
  return NextResponse.json(
    { result },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
