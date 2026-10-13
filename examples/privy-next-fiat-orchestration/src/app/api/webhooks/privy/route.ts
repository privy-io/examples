import { NextResponse } from "next/server";
import { privyClient } from "@/lib/privy-client";
import {
  recordEvent,
  normalizeUserId,
  isDepositEventType,
  isPayoutEventType,
  type DepositEvent,
  type PayoutEventStep,
} from "@/lib/kyc-events";

// Svix signs the exact request bytes, so the body must be read as raw text and
// never pre-parsed as JSON.
export async function POST(req: Request) {
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix signature headers" },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let payload;
  try {
    payload = privyClient.webhooks().verify({
      payload: rawBody,
      headers: {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  // On the wire, Privy flattens the event: { type, ...payload fields }.
  const event = payload as unknown as {
    type?: string;
    user_id?: string;
    wallet_id?: string;
    provider_deposit_id?: string;
    deposit_account_id?: string;
    deposit_type?: string;
    provider?: string;
    environment?: string;
    data?: unknown;
    changes?: Record<string, [unknown, unknown]>;
    // wallet_action.payout.* carries its fields flat, not under `data`.
    wallet_action_id?: string;
    status?: string;
    created_at?: string;
    completed_at?: string;
    source_asset?: string;
    source_chain?: string;
    source_amount?: string;
    destination_fiat_account_id?: string;
    destination_currency?: string;
    destination_payment_rail?: string;
    steps?: PayoutEventStep[];
    failure_reason?: { message: string; details?: unknown };
  };

  if (event.type === "user.kyc.updated" && event.user_id) {
    // Keyed by normalized user_id (the SSE stream resolves the same key from the
    // caller's did:privy: access-token subject).
    recordEvent(normalizeUserId(event.user_id), {
      type: "user.kyc.updated",
      receivedAt: new Date().toISOString(),
      user_id: event.user_id,
      provider: event.provider ?? "bridge",
      environment: event.environment ?? "sandbox",
      data: event.data ?? null,
      changes: event.changes ?? {},
    });
  } else if (isDepositEventType(event.type) && event.wallet_id) {
    // All three lifecycle events share one envelope and differ only in `data`,
    // so they are recorded uniformly. Keyed by wallet_id — the deposit payloads
    // carry no user_id.
    //
    // `data` arrives as unknown from the wire; the cast pairs the verified
    // event name with its payload shape, which Svix verification above is what
    // makes safe to trust.
    recordEvent(event.wallet_id, {
      type: event.type,
      receivedAt: new Date().toISOString(),
      provider_deposit_id: event.provider_deposit_id ?? "",
      deposit_account_id: event.deposit_account_id ?? "",
      wallet_id: event.wallet_id,
      deposit_type: event.deposit_type ?? "fiat",
      provider: event.provider ?? "bridge",
      environment: event.environment ?? "sandbox",
      data: event.data,
    } as DepositEvent);
  } else if (isPayoutEventType(event.type) && event.wallet_id) {
    // Keyed by wallet_id, same as deposits. The payout payload is flat, so the
    // wallet-action fields are read from the top level rather than `data`.
    recordEvent(event.wallet_id, {
      type: event.type,
      receivedAt: new Date().toISOString(),
      wallet_action_id: event.wallet_action_id ?? "",
      wallet_id: event.wallet_id,
      status: event.status ?? "",
      created_at: event.created_at ?? "",
      ...(event.completed_at ? { completed_at: event.completed_at } : {}),
      provider: event.provider ?? "bridge",
      environment: event.environment ?? "sandbox",
      source_asset: event.source_asset ?? "",
      source_chain: event.source_chain ?? "",
      source_amount: event.source_amount ?? "",
      destination_fiat_account_id: event.destination_fiat_account_id ?? "",
      destination_currency: event.destination_currency ?? "",
      destination_payment_rail: event.destination_payment_rail ?? "",
      ...(event.steps ? { steps: event.steps } : {}),
      ...(event.failure_reason ? { failure_reason: event.failure_reason } : {}),
    });
  }

  return NextResponse.json({ received: true });
}
