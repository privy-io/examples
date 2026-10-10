import type { ApiMeta, FiatDepositAccount, KyxStatusResponse } from "@/lib/api";

/** A linked bank account, as the external fiat accounts list returns it. */
export interface ShowcaseBankAccount {
  id: string;
  bank_name?: string;
  last_4?: string;
  currency?: string;
}

/**
 * GET /api/showcase: a pre-seeded sandbox user that has already finished
 * every step, shown before login so visitors see the end state first.
 */
export interface ShowcaseResponse {
  kyc: KyxStatusResponse | null;
  depositAccounts: FiatDepositAccount[];
  bankAccounts: ShowcaseBankAccount[];
  /** USDC on Base, or null when the balance lookup fails. */
  balance: string | null;
  /** The Privy API calls behind this snapshot, for the inspector. */
  calls: ApiMeta[];
}
