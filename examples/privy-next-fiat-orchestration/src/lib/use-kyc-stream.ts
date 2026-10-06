"use client";

import { useEffect, useState } from "react";
import { API_BASE, KycWebhookEvent, WebhookEvent } from "./api";

interface WebhookStream<T> {
  events: T[];
  connected: boolean;
}

/**
 * Subscribes to the backend SSE stream of webhook events, returning the raw
 * discriminated union. Always streams the user's `user.kyc.updated` events;
 * when a `walletId` is passed it also streams that wallet's three
 * `wallet.deposit_account.deposit_*` lifecycle events. The access token is
 * passed as a query param because EventSource cannot set an Authorization
 * header.
 */
export function useWebhookStream(
  getAccessToken: () => Promise<string | null>,
  walletId?: string,
): WebhookStream<WebhookEvent> {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let source: EventSource | null = null;
    let cancelled = false;

    (async () => {
      const token = await getAccessToken();
      if (!token || cancelled) return;

      const query = new URLSearchParams({ token });
      if (walletId) query.set("wallet_id", walletId);

      source = new EventSource(
        `${API_BASE}/webhooks/stream?${query.toString()}`,
      );
      source.onopen = () => setConnected(true);
      source.onerror = () => setConnected(false);
      source.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as WebhookEvent;
          setEvents((prev) => [...prev, event]);
        } catch {
          // Ignore heartbeats / malformed frames.
        }
      };
    })();

    return () => {
      cancelled = true;
      source?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId]);

  return { events, connected };
}

/**
 * Subscribes to the backend SSE stream, filtered to `user.kyc.updated` events.
 * Thin wrapper over {@link useWebhookStream} so existing KYC consumers are
 * unaffected by the introduction of other event types.
 */
export function useKycWebhookStream(
  getAccessToken: () => Promise<string | null>,
): WebhookStream<KycWebhookEvent> {
  const { events, connected } = useWebhookStream(getAccessToken);
  return {
    events: events.filter(
      (event): event is KycWebhookEvent => event.type === "user.kyc.updated",
    ),
    connected,
  };
}
