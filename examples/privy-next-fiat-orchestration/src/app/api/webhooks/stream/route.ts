import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/server-auth";
import {
  replayEvents,
  subscribe,
  normalizeUserId,
  type WebhookEvent,
} from "@/lib/kyc-events";

// Long-lived SSE connection — must not be statically optimized or cached.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEARTBEAT_INTERVAL_MILLISECONDS = 25_000;

/**
 * SSE stream of this user's webhook events. Always streams the user's
 * `user.kyc.updated` events (keyed by user id); when a `wallet_id` query param
 * is supplied it also streams that wallet's three
 * `wallet.deposit_account.deposit_*` lifecycle events. The token arrives as a
 * query param because EventSource cannot set an Authorization header.
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const token = params.get("token") ?? "";
  const walletId = params.get("wallet_id");
  const userId = token ? await verifyAccessToken(token) : null;
  if (!userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          // The client disconnected between the event firing and this write.
        }
      };

      const emit = (event: WebhookEvent) => {
        send(`data: ${JSON.stringify(event)}\n\n`);
      };

      send("retry: 5000\n\n");

      // Subscription keys to replay + subscribe: the user (KYC, normalized to
      // match the receiver's key), and — when provided — the wallet (deposits).
      const keys = [normalizeUserId(userId), ...(walletId ? [walletId] : [])];

      // Replay anything already received for these keys this session.
      for (const key of keys) {
        for (const event of replayEvents(key)) emit(event);
      }

      const unsubscribes = keys.map((key) => subscribe(key, emit));

      const heartbeat = setInterval(
        () => send(": ping\n\n"),
        HEARTBEAT_INTERVAL_MILLISECONDS,
      );

      // Next signals client disconnect by aborting the request.
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        for (const unsubscribe of unsubscribes) unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
