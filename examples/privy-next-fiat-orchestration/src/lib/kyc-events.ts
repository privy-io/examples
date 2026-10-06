/**
 * In-memory store of received Privy webhooks, plus the set of connected SSE
 * subscribers. Extracted into its own module so the webhook receiver and the
 * SSE endpoint — separate route handlers in the App Router — share one instance
 * of the state.
 *
 * Holds two event families under one subscription-key namespace, keyed
 * differently:
 *   - `user.kyc.updated` is keyed by `user_id` (normalized — see normalizeUserId).
 *   - the three `wallet.deposit_account.deposit_*` events are keyed by
 *     `wallet_id`, since their payloads carry no user_id.
 *   - the four `wallet_action.payout.*` events are also keyed by `wallet_id`.
 * Callers pick the key, so a client can subscribe to its user key and its wallet
 * key independently.
 *
 * Demo-only. Process-local: on a serverless deployment the receiver and the
 * stream can land on different instances, so events recorded by one will not
 * reach a client subscribed to another. A real integration would persist events
 * and use a shared pub/sub.
 */

/** A received user.kyc.updated webhook, normalized for the demo UI. */
export interface KycEvent {
  type: "user.kyc.updated";
  receivedAt: string;
  user_id: string;
  provider: string;
  environment: string;
  data: unknown;
  changes: Record<string, [unknown, unknown]>;
}

/** The three deposit lifecycle event names, in the order they occur. */
export const DEPOSIT_EVENT_TYPES = [
  "wallet.deposit_account.deposit_started",
  "wallet.deposit_account.deposit_completed",
  "wallet.deposit_account.deposit_failed",
] as const;

/** Envelope shared by all three deposit lifecycle webhooks. */
interface BaseDepositEvent {
  receivedAt: string;
  /** The deposit's ID in the provider's system (e.g. Bridge), not a Privy ID. */
  provider_deposit_id: string;
  deposit_account_id: string;
  wallet_id: string;
  deposit_type: string;
  provider: string;
  environment: string;
}

/**
 * The fiat side of a deposit, identical across all three events. `amount` and
 * `currency` live here rather than on `data` — a past version of the schema had
 * them one level up, and reading the old paths is what silently blanked this
 * feed.
 */
export interface DepositSource {
  sender_name?: string;
  payment_rail?: string;
  amount: string;
  currency: string;
}

/** The crypto asset + chain a deposit is, or would have been, delivered to. */
export interface DepositDestination {
  asset: string;
  chain: string;
}

/** A received wallet.deposit_account.deposit_started webhook. */
export interface DepositStartedEvent extends BaseDepositEvent {
  type: "wallet.deposit_account.deposit_started";
  data: {
    destination: DepositDestination;
    source: DepositSource;
    created_at: string;
  };
}

/** A received wallet.deposit_account.deposit_completed webhook. */
export interface DepositCompletedEvent extends BaseDepositEvent {
  type: "wallet.deposit_account.deposit_completed";
  data: {
    // Wider than the started/failed destination: the crypto actually landed, so
    // the delivered amount and settlement transaction are known.
    destination: DepositDestination & {
      amount: string;
      transaction_hash: string;
    };
    source: DepositSource;
    created_at: string;
  };
}

/** A received wallet.deposit_account.deposit_failed webhook. */
export interface DepositFailedEvent extends BaseDepositEvent {
  type: "wallet.deposit_account.deposit_failed";
  data: {
    // Narrow destination — the conversion never happened, so nothing was
    // delivered on-chain and the fiat was refunded to the sender.
    destination: DepositDestination;
    source: DepositSource;
    reason: string;
    reason_code: string;
    refunded_at: string;
    created_at: string;
  };
}

/** Any point in the deposit lifecycle. */
export type DepositEvent =
  | DepositStartedEvent
  | DepositCompletedEvent
  | DepositFailedEvent;

/** Narrows a wire event name to one of the deposit lifecycle events. */
export function isDepositEventType(
  type: string | undefined,
): type is DepositEvent["type"] {
  return (DEPOSIT_EVENT_TYPES as readonly string[]).includes(type ?? "");
}

/** The payout wallet-action lifecycle event names. */
export const PAYOUT_EVENT_TYPES = [
  "wallet_action.payout.created",
  "wallet_action.payout.succeeded",
  "wallet_action.payout.rejected",
  "wallet_action.payout.failed",
] as const;

/** One step of a payout wallet action, as carried on the terminal events. */
export interface PayoutEventStep {
  type: string;
  status: string;
  caip2?: string;
  transaction_hash?: string | null;
  failure_reason?: { message: string; details?: unknown };
}

/**
 * A received wallet_action.payout.* webhook.
 *
 * Unlike the deposit and KYC events, the payload is flat — the wallet action
 * fields sit alongside the payout fields rather than under `data`. `created`
 * carries `status: "pending"`; `steps` appear only on the terminal events, and
 * `failure_reason` only on rejected/failed.
 */
export interface PayoutEvent {
  type: (typeof PAYOUT_EVENT_TYPES)[number];
  receivedAt: string;
  wallet_action_id: string;
  wallet_id: string;
  status: string;
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
  steps?: PayoutEventStep[];
  failure_reason?: { message: string; details?: unknown };
}

/** Narrows a wire event name to one of the payout lifecycle events. */
export function isPayoutEventType(
  type: string | undefined,
): type is PayoutEvent["type"] {
  return (PAYOUT_EVENT_TYPES as readonly string[]).includes(type ?? "");
}

/** Discriminated union of everything the store can hold. */
export type WebhookEvent = KycEvent | DepositEvent | PayoutEvent;

const MAX_EVENTS_PER_KEY = 50;

type Subscriber = (event: WebhookEvent) => void;

interface WebhookEventStore {
  eventsByKey: Map<string, WebhookEvent[]>;
  subscribersByKey: Map<string, Set<Subscriber>>;
}

// Next.js bundles route handlers separately. Store the registry on globalThis so
// the webhook receiver and SSE route share it within the same server process.
const storeKey = Symbol.for("fiat-orchestration-demo.webhook-event-store");
const globalWithStore = globalThis as typeof globalThis & {
  [storeKey]?: WebhookEventStore;
};
const store = (globalWithStore[storeKey] ??= {
  eventsByKey: new Map<string, WebhookEvent[]>(),
  subscribersByKey: new Map<string, Set<Subscriber>>(),
});
const { eventsByKey, subscribersByKey } = store;

/** Normalizes external DID-form and internal bare Privy user IDs to one map key. */
export function normalizeUserId(userId: string): string {
  return userId.replace(/^did:privy:/, "");
}

/** Records an event under a subscription key and fans it out to that key's subscribers. */
export function recordEvent(key: string, event: WebhookEvent): void {
  const list = eventsByKey.get(key) ?? [];
  list.push(event);
  while (list.length > MAX_EVENTS_PER_KEY) list.shift();
  eventsByKey.set(key, list);

  for (const notify of subscribersByKey.get(key) ?? []) {
    notify(event);
  }
}

/** Events already received for this key, for replay on connect. */
export function replayEvents(key: string): WebhookEvent[] {
  return eventsByKey.get(key) ?? [];
}

/** Registers a subscriber for a key; returns an unsubscribe function. */
export function subscribe(key: string, notify: Subscriber): () => void {
  const subscribers = subscribersByKey.get(key) ?? new Set<Subscriber>();
  subscribers.add(notify);
  subscribersByKey.set(key, subscribers);

  return () => {
    subscribers.delete(notify);
    if (subscribers.size === 0) subscribersByKey.delete(key);
  };
}
