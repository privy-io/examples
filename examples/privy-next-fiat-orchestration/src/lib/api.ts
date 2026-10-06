"use client";

// The API routes are served by this same Next.js app, so this is same-origin.
export const API_BASE = "/api";

export interface ApiMeta {
  method: string;
  url: string;
  requestBody?: unknown;
  responseStatus: number;
  responseBody: unknown;
  durationMs: number;
}

export interface ApiResponse<T = unknown> {
  result: T;
  meta: ApiMeta;
}

// ---------------------------------------------------------------------------
// KYX (KYC/KYB) response shapes — mirror @privy-io/schemas fiat/kyx.
// ---------------------------------------------------------------------------

export type KyxEnvironment = "sandbox" | "production";

export interface KyxEndorsement {
  name: string;
  status: string;
  /** Missing requirements, or null if complete. */
  missing: string[] | null;
}

export interface KyxCapabilities {
  payin_crypto: string;
  payout_crypto: string;
  payin_fiat: string;
  payout_fiat: string;
}

/** Full KYC/KYB status snapshot (GET /v1/users/{id}/kyc, POST .../kyc/links). */
export interface KyxStatusResponse {
  provider: string;
  environment: KyxEnvironment;
  status: string;
  tos: { status: string; link?: string };
  kyc: { status: string; link?: string; rejection_reasons?: string[] };
  endorsements: KyxEndorsement[];
  capabilities: KyxCapabilities;
  requirements_due: string[];
  future_requirements_due: string[];
}

/** Terms of Service link response (POST /v1/users/{id}/kyc/tos). */
export interface KyxTosResponse {
  provider: string;
  environment: KyxEnvironment;
  status: string;
  link: string;
}

/** The `data` snapshot carried by a user.kyc.updated webhook (a subset of KyxStatusResponse). */
export interface UserKycUpdatedData {
  status: string;
  tos: { status: string };
  kyc: { status: string };
  endorsements: KyxEndorsement[];
  capabilities: KyxCapabilities;
}

/** A user.kyc.updated event as streamed from the demo backend over SSE. */
export interface KycWebhookEvent {
  type: "user.kyc.updated";
  receivedAt: string;
  user_id: string;
  provider: string;
  environment: string;
  data: UserKycUpdatedData | null;
  /** Flat dot-path diff of what changed: { "kyc.status": [old, new] }. */
  changes: Record<string, [unknown, unknown]>;
}

// ---------------------------------------------------------------------------
// Fiat deposit accounts + deposit lifecycle webhook.
// ---------------------------------------------------------------------------

/** Known currencies for a fiat deposit account (tolerate unknown strings). */
export type FiatCurrency = "usd" | "eur";
/** Known destination assets (tolerate unknown strings). */
export type FiatDestinationAsset = "usdc";
/** Known destination chains (tolerate unknown strings). */
export type FiatDestinationChain =
  | "ethereum"
  | "base"
  | "arbitrum"
  | "polygon"
  | "optimism";
/** Known payment rails (tolerate unknown strings). */
export type FiatPaymentRail = "sepa" | "ach_push" | "wire";

/**
 * The fiat side of a deposit, identical across all three lifecycle events.
 * `amount` and `currency` are nested here, not on `data` — reading them one
 * level up is what silently blanked the deposit feed.
 */
export interface DepositSource {
  sender_name?: string;
  payment_rail?: FiatPaymentRail | string;
  amount: string;
  currency: FiatCurrency | string;
}

/** The crypto asset + chain a deposit is, or would have been, delivered to. */
export interface DepositDestination {
  asset: FiatDestinationAsset | string;
  chain: FiatDestinationChain | string;
}

/** The `data` snapshot carried by a wallet.deposit_account.deposit_started webhook. */
export interface DepositStartedData {
  destination: DepositDestination;
  source: DepositSource;
  created_at: string;
}

/** The `data` snapshot carried by a wallet.deposit_account.deposit_completed webhook. */
export interface DepositCompletedData {
  // Wider than the started/failed destination: the crypto landed, so the
  // delivered amount and settlement transaction are known.
  destination: DepositDestination & {
    amount: string;
    transaction_hash: string;
  };
  source: DepositSource;
  created_at: string;
}

/** The `data` snapshot carried by a wallet.deposit_account.deposit_failed webhook. */
export interface DepositFailedData {
  // Narrow destination — nothing was delivered on-chain and the fiat was
  // refunded to the sender.
  destination: DepositDestination;
  source: DepositSource;
  reason: string;
  reason_code: string;
  refunded_at: string;
  created_at: string;
}

/** Envelope shared by all three deposit lifecycle events streamed over SSE. */
interface BaseDepositWebhookEvent {
  receivedAt: string;
  /** The deposit's ID in the provider's system (e.g. Bridge), not a Privy ID. */
  provider_deposit_id: string;
  deposit_account_id: string;
  wallet_id: string;
  deposit_type: string;
  provider: string;
  environment: string;
}

/** A wallet.deposit_account.deposit_started event as streamed over SSE. */
export interface DepositStartedWebhookEvent extends BaseDepositWebhookEvent {
  type: "wallet.deposit_account.deposit_started";
  data: DepositStartedData;
}

/** A wallet.deposit_account.deposit_completed event as streamed over SSE. */
export interface DepositCompletedWebhookEvent extends BaseDepositWebhookEvent {
  type: "wallet.deposit_account.deposit_completed";
  data: DepositCompletedData;
}

/** A wallet.deposit_account.deposit_failed event as streamed over SSE. */
export interface DepositFailedWebhookEvent extends BaseDepositWebhookEvent {
  type: "wallet.deposit_account.deposit_failed";
  data: DepositFailedData;
}

/** Any point in the deposit lifecycle, as streamed over SSE. */
export type DepositWebhookEvent =
  | DepositStartedWebhookEvent
  | DepositCompletedWebhookEvent
  | DepositFailedWebhookEvent;

/** The deposit lifecycle event names, in the order they occur. */
export const DEPOSIT_EVENT_TYPES = [
  "wallet.deposit_account.deposit_started",
  "wallet.deposit_account.deposit_completed",
  "wallet.deposit_account.deposit_failed",
] as const;

/** Narrows a streamed event to one of the deposit lifecycle events. */
export function isDepositWebhookEvent(
  event: WebhookEvent,
): event is DepositWebhookEvent {
  return (DEPOSIT_EVENT_TYPES as readonly string[]).includes(event.type);
}

/** The payout wallet-action lifecycle event names. */
export const PAYOUT_EVENT_TYPES = [
  "wallet_action.payout.created",
  "wallet_action.payout.succeeded",
  "wallet_action.payout.rejected",
  "wallet_action.payout.failed",
] as const;

/** One step of a payout wallet action, as carried on the terminal events. */
export interface PayoutWebhookStep {
  type: string;
  status: string;
  caip2?: string;
  transaction_hash?: string | null;
  failure_reason?: { message: string; details?: unknown };
}

/**
 * A wallet_action.payout.* event as streamed over SSE.
 *
 * The payload is flat rather than nested under `data`. `created` carries
 * `status: "pending"`; `steps` appear only on the terminal events and
 * `failure_reason` only on rejected/failed.
 */
export interface PayoutWebhookEvent {
  type: (typeof PAYOUT_EVENT_TYPES)[number];
  receivedAt: string;
  wallet_action_id: string;
  wallet_id: string;
  status: WalletActionStatus | string;
  created_at: string;
  completed_at?: string;
  provider: string;
  environment: string;
  source_asset: string;
  source_chain: string;
  source_amount: string;
  destination_fiat_account_id: string;
  destination_currency: string;
  destination_payment_rail: string;
  steps?: PayoutWebhookStep[];
  failure_reason?: { message: string; details?: unknown };
}

/** Narrows a streamed event to a payout lifecycle event. */
export function isPayoutWebhookEvent(
  event: WebhookEvent,
): event is PayoutWebhookEvent {
  return (PAYOUT_EVENT_TYPES as readonly string[]).includes(event.type);
}

/** Discriminated union of every webhook event the demo backend streams. */
export type WebhookEvent =
  | KycWebhookEvent
  | DepositWebhookEvent
  | PayoutWebhookEvent;

/** Bank/deposit instructions attached to a fiat deposit account. */
export interface FiatDepositInstructions {
  bank_name?: string;
  bank_address?: string;
  bank_account_number?: string;
  bank_routing_number?: string;
  bank_beneficiary_name?: string;
  iban?: string;
  bic?: string;
  clabe?: string;
  account_number?: string;
  sort_code?: string;
  deposit_message?: string;
  payment_rails?: string[];
}

/** A fiat deposit account (POST/GET /v1/wallets/{id}/deposit_accounts/fiat). */
export interface FiatDepositAccount {
  id: string;
  wallet_id: string;
  provider: string;
  environment: KyxEnvironment;
  status: "activated" | "deactivated";
  source: {
    currency: FiatCurrency | string;
    payment_rails: string[];
  };
  destination: {
    asset: FiatDestinationAsset | string;
    chain: FiatDestinationChain | string;
  };
  deposit_instructions: FiatDepositInstructions | null;
  created_at: string;
}

/** GET list response for fiat deposit accounts. */
export interface ListFiatDepositAccountsResponse {
  fiat_deposit_accounts: FiatDepositAccount[];
  next_cursor: string | null;
}

/** Create wraps the account under a different key than list does. */
export interface CreateFiatDepositAccountResponse {
  fiat_deposit_account: FiatDepositAccount;
}

/** Statuses that mean a customer/endorsement is fully cleared. */
export function isApprovedStatus(status: string | undefined): boolean {
  return status === "approved" || status === "active";
}

// ---------------------------------------------------------------------------
// Payouts (offramp) — mirror @privy-io/schemas fiat payout types.
// ---------------------------------------------------------------------------

export interface PayoutSource {
  asset: string;
  chain: string;
  amount: string;
}

export interface PayoutDestination {
  fiat_account_id: string;
}

/** Statuses a wallet action can be in. */
export type WalletActionStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "rejected";

/**
 * A payout wallet action. Crypto is sent on-chain to a liquidation address that
 * offramps to the destination bank account — both are internal to Privy.
 */
export interface PayoutResponse {
  id: string;
  status: WalletActionStatus;
  wallet_id: string;
  created_at: string;
  failure_reason?: { message: string; details?: unknown };
  /** Only returned when the request passes ?include=steps. */
  steps?: Array<{
    type: string;
    status: string;
    transaction_hash?: string | null;
    failure_reason?: { message: string; details?: unknown };
  }>;
  type: "payout";
  provider: string;
  environment: string;
  source: PayoutSource;
  destination: PayoutDestination;
}

/** A payout has settled (or failed) once it leaves `pending`. */
export function isTerminalActionStatus(status: string | undefined): boolean {
  return status === "succeeded" || status === "failed" || status === "rejected";
}

export async function apiCall<T = unknown>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token: string;
  },
): Promise<ApiResponse<T>> {
  const { method = "GET", body, token } = options;

  const startedAt = performance.now();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const durationMs = Math.round(performance.now() - startedAt);

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // 204s and non-JSON error pages have nothing to parse.
  }

  // Routes normally return { result, meta }, but a rejection short-circuits
  // that: withAuth returns a bare { error } on 401, and handlers do the same for
  // validation failures. Synthesizing a meta keeps every response inspectable
  // and stops callers from passing `undefined` to the inspector.
  const hasMeta =
    !!data && typeof data === "object" && "meta" in (data as object);
  if (hasMeta) return data as ApiResponse<T>;

  return {
    result: data as T,
    meta: {
      method,
      url: path,
      ...(body ? { requestBody: body } : {}),
      responseStatus: res.status,
      responseBody: data,
      durationMs,
    },
  };
}
