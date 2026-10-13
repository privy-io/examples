"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { ApiMeta, WebhookEvent } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Badge } from "@/lib/ui/badge";
import { Button } from "@/lib/ui/button";

interface Props {
  log: ApiMeta[];
  webhooks: WebhookEvent[];
  webhooksConnected: boolean;
  onClear: () => void;
}

type Tab = "requests" | "webhooks";

const METHOD_VARIANT = {
  GET: "success",
  POST: "info",
  PUT: "warning",
  PATCH: "warning",
  DELETE: "error",
} as const;

function Json({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-text-muted">{label}</div>
      <pre className="overflow-x-auto rounded-xl bg-background-elevated p-3 font-mono text-xs text-text">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function Row({
  summary,
  children,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-border px-4 py-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full cursor-pointer items-center gap-2 text-left"
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 text-text-subtle transition-transform",
            expanded && "rotate-90",
          )}
        />
        {summary}
      </button>
      {expanded && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}

function RequestRow({ meta }: { meta: ApiMeta }) {
  const ok = meta.responseStatus >= 200 && meta.responseStatus < 300;
  const method = meta.method.toUpperCase() as keyof typeof METHOD_VARIANT;

  return (
    <Row
      summary={
        <>
          <Badge variant={METHOD_VARIANT[method] ?? "neutral"} className="font-mono">
            {meta.method}
          </Badge>
          <span className="flex-1 break-all font-mono text-xs text-text">
            {meta.url}
          </span>
          <Badge variant={ok ? "success" : "error"} className="font-mono">
            {meta.responseStatus}
          </Badge>
          <span className="text-xs text-text-subtle">{meta.durationMs}ms</span>
        </>
      }
    >
      {meta.requestBody !== undefined && (
        <Json label="Request body" value={meta.requestBody} />
      )}
      <Json label="Response" value={meta.responseBody} />
    </Row>
  );
}

function WebhookRow({ event }: { event: WebhookEvent }) {
  return (
    <Row
      summary={
        <>
          <span className="flex-1 break-all font-mono text-xs text-text">
            {event.type}
          </span>
          <span className="text-xs text-text-subtle">
            {new Date(event.receivedAt).toLocaleTimeString()}
          </span>
        </>
      }
    >
      <Json label="Payload" value={event} />
    </Row>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center">
      <p className="text-sm text-text-subtle">{children}</p>
    </div>
  );
}

export function ApiInspector({
  log,
  webhooks,
  webhooksConnected,
  onClear,
}: Props) {
  const [tab, setTab] = useState<Tab>("requests");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log, webhooks, tab]);

  // Never let a malformed entry crash the inspector — it is the tool used to
  // debug the very call that produced it.
  const requests = log.filter((meta) => meta && typeof meta.method === "string");

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">API inspector</h2>
            <p className="text-xs text-text-muted">
              What the demo sends to the Privy API, and what comes back.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        </div>
        <div className="mt-3 flex gap-4">
          {(
            [
              ["requests", `Requests (${requests.length})`],
              ["webhooks", `Webhooks (${webhooks.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "-mb-px cursor-pointer border-b-2 pb-2 text-xs font-medium transition-colors",
                tab === id
                  ? "border-border-focus text-text"
                  : "border-transparent text-text-muted hover:text-text",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {tab === "requests" &&
          (requests.length === 0 ? (
            <Empty>API calls will appear here as you use the demo.</Empty>
          ) : (
            requests.map((meta, i) => <RequestRow key={i} meta={meta} />)
          ))}
        {tab === "webhooks" &&
          (webhooks.length === 0 ? (
            <Empty>
              {webhooksConnected
                ? "Listening. Webhooks Privy sends about your KYC and deposits will appear here."
                : "Log in to receive webhooks."}
            </Empty>
          ) : (
            webhooks.map((event, i) => <WebhookRow key={i} event={event} />)
          ))}
      </div>
    </div>
  );
}
