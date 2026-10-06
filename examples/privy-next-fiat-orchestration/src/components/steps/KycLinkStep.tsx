"use client";

import { ArrowRight, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  apiCall,
  ApiMeta,
  KyxStatusResponse,
  KyxTosResponse,
  KycWebhookEvent,
  isApprovedStatus,
} from "@/lib/api";
import { cn } from "@/lib/cn";
import { kycLabel, kycStatusVariant } from "@/lib/kyc-labels";
import { Badge } from "@/lib/ui/badge";
import { Button, buttonVariants } from "@/lib/ui/button";
import { Callout } from "@/lib/ui/callout";
import { Card, CardDescription, CardTitle } from "@/lib/ui/card";

interface Props {
  getAccessToken: () => Promise<string | null>;
  userId: string;
  userEmail: string;
  environment: "sandbox" | "production";
  /** Which half of the KYX onboarding this instance renders. */
  step: "tos" | "kyc";
  onApiCall: (meta: ApiMeta) => void;
  onNext: () => void;
  snapshot: KyxStatusResponse | null;
  onSnapshotChange: (snapshot: KyxStatusResponse) => void;
}

const KYC_POLL_INTERVAL = 5000;
const KYC_POLL_TIMEOUT = 180000;

export function KycLinkStep({
  getAccessToken,
  userEmail,
  environment,
  step,
  onApiCall,
  onNext,
  snapshot,
  onSnapshotChange,
}: Props) {
  const [tosLink, setTosLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Logs the call and records its error, if any. Returns whether it succeeded.
  function track(meta: ApiMeta): boolean {
    onApiCall(meta);
    const message = errorMessage(meta);
    setError(message);
    return message === null;
  }

  async function refreshStatus() {
    setLoading(true);
    const token = await getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const { result, meta } = await apiCall<KyxStatusResponse | null>(
      `/kyc/status?environment=${environment}`,
      { token },
    );
    if (track(meta) && result) onSnapshotChange(result);
    setLoading(false);
  }

  // POST /kyc/tos — generates a ToS acceptance link (and bootstraps the customer).
  async function generateTosLink() {
    setLoading(true);
    const token = await getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const { result, meta } = await apiCall<KyxTosResponse>("/kyc/tos", {
      method: "POST",
      body: { environment, email: userEmail || undefined },
      token,
    });
    if (!track(meta)) {
      setLoading(false);
      return;
    }
    if (result?.link) setTosLink(result.link);
    await refreshStatus();
    setLoading(false);
  }

  // POST /kyc/links — starts hosted KYC and returns the updated snapshot.
  async function generateKycLink() {
    setLoading(true);
    const token = await getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const { result, meta } = await apiCall<KyxStatusResponse>("/kyc/links", {
      method: "POST",
      body: {
        environment,
        email: userEmail || undefined,
        redirect_uri: window.location.origin,
      },
      token,
    });
    if (track(meta) && result) onSnapshotChange(result);
    setLoading(false);
  }

  function startPolling() {
    setPolling(true);
    setPollTimedOut(false);
    pollStartRef.current = Date.now();

    const poll = async () => {
      if (Date.now() - pollStartRef.current > KYC_POLL_TIMEOUT) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPolling(false);
        setPollTimedOut(true);
        return;
      }
      const token = await getAccessToken();
      if (!token) return;
      const { result, meta } = await apiCall<KyxStatusResponse | null>(
        `/kyc/status?environment=${environment}`,
        { token },
      );
      if (!track(meta)) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPolling(false);
        return;
      }
      if (result) {
        onSnapshotChange(result);
        if (
          isApprovedStatus(result.kyc.status) ||
          isApprovedStatus(result.status)
        ) {
          if (pollRef.current) clearInterval(pollRef.current);
          setPolling(false);
        }
      }
    };

    void poll();
    pollRef.current = setInterval(poll, KYC_POLL_INTERVAL);
  }

  const tosAccepted = isApprovedStatus(snapshot?.tos.status);
  const kycApproved =
    isApprovedStatus(snapshot?.kyc.status) ||
    isApprovedStatus(snapshot?.status);
  const kycLink = snapshot?.kyc.link;

  const isTos = step === "tos";
  // A step is "done" once its own status is approved — that reveals its Continue
  // button and hides the action card.
  const stepDone = isTos ? tosAccepted : kycApproved;

  return (
    <div className="space-y-6">
      <div>
        <CardTitle>
          {isTos ? "Accept the terms of service" : "Verify your identity"}
        </CardTitle>
        <CardDescription>
          {isTos
            ? "Before anyone can move money, they accept Bridge's terms of service. Open the terms, accept them, then come back here."
            : "Next, complete Bridge's hosted identity check. This is sandbox, so use test details — nothing real is submitted."}
        </CardDescription>
      </div>

      {error && (
        <Callout variant="error" title="Something went wrong">
          {error}
        </Callout>
      )}

      {/* ToS action */}
      {isTos && !tosAccepted && (
        <ActionRow
          number={1}
          title="Accept terms of service"
          description={
            tosLink
              ? "Accept the terms in the new tab, then confirm here."
              : "Get a link to Bridge's terms of service."
          }
        >
          {!tosLink ? (
            <Button size="sm" onClick={generateTosLink} loading={loading}>
              Get terms link
            </Button>
          ) : (
            <>
              <LinkButton href={tosLink}>Open terms</LinkButton>
              <Button
                size="sm"
                variant="outline"
                onClick={refreshStatus}
                loading={loading}
              >
                I&apos;ve accepted
              </Button>
            </>
          )}
        </ActionRow>
      )}

      {/* KYC action */}
      {!isTos && !kycApproved && (
        <div className="space-y-3">
          {!tosAccepted && (
            <Callout variant="warning" title="Accept the terms of service first">
              Go back to the previous step to accept them.
            </Callout>
          )}
          <ActionRow
            number={2}
            title="Complete identity verification"
            description="Fill in Bridge's hosted verification form."
            disabled={!tosAccepted}
          >
            {tosAccepted &&
              (!kycLink ? (
                <Button size="sm" onClick={generateKycLink} loading={loading}>
                  Start verification
                </Button>
              ) : (
                <LinkButton href={kycLink}>Open verification</LinkButton>
              ))}
          </ActionRow>

          {tosAccepted && (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={startPolling}
                loading={polling}
              >
                {polling ? "Waiting for approval" : "Check status"}
              </Button>
              {pollTimedOut && (
                <span className="text-xs text-text-muted">
                  Still processing after 3 minutes. Check again in a moment.
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step complete → continue */}
      {stepDone && (
        <Button onClick={onNext}>
          {isTos
            ? "Continue to identity verification"
            : "Continue to deposit account"}
          <ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
}

function ActionRow({
  number,
  title,
  description,
  disabled = false,
  children,
}: {
  number: number;
  title: string;
  description: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background-elevated p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
            disabled
              ? "bg-background text-text-subtle"
              : "bg-background-info text-text-interactive",
          )}
        >
          {number}
        </span>
        <div>
          <div
            className={cn(
              "text-sm font-medium",
              disabled ? "text-text-subtle" : "text-text",
            )}
          >
            {title}
          </div>
          <div className="mt-0.5 text-xs text-text-muted">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function LinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ size: "sm" })}
    >
      {children}
      <ExternalLink className="size-3.5" />
    </a>
  );
}

/** Pulls a readable message out of a failed API response, or null on success. */
function errorMessage(meta: ApiMeta): string | null {
  if (meta.responseStatus >= 200 && meta.responseStatus < 300) return null;
  const body = meta.responseBody as
    | { error?: unknown; message?: unknown }
    | null
    | undefined;
  const nested =
    body?.error && typeof body.error === "object"
      ? (body.error as { message?: unknown }).message
      : undefined;
  const message = [body?.message, body?.error, nested].find(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  return (
    message ?? `The request failed (HTTP ${meta.responseStatus}). Try again.`
  );
}

/** A readable summary of the user's KYC status; the inspector shows the raw snapshot. */
export function StatusSnapshot({ snapshot }: { snapshot: KyxStatusResponse }) {
  const capabilities = [
    ["Receive crypto", snapshot.capabilities.payin_crypto],
    ["Send crypto", snapshot.capabilities.payout_crypto],
    ["Receive bank transfers", snapshot.capabilities.payin_fiat],
    ["Send bank transfers", snapshot.capabilities.payout_fiat],
  ] as const;

  return (
    <Card className="space-y-5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-text">KYC status</div>
        <StatusBadge status={snapshot.status} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Row label="Terms of service">
          <StatusBadge status={snapshot.tos.status} />
        </Row>
        <Row label="Identity verification">
          <StatusBadge status={snapshot.kyc.status} />
        </Row>
      </div>

      {snapshot.kyc.rejection_reasons?.length ? (
        <Callout variant="error" title="Verification was rejected">
          <ul className="list-disc space-y-0.5 pl-4">
            {snapshot.kyc.rejection_reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </Callout>
      ) : null}

      {snapshot.endorsements.length > 0 && (
        <Section title="Payment rails">
          <div className="space-y-2">
            {snapshot.endorsements.map((e) => (
              <div
                key={e.name}
                className="rounded-xl bg-background-elevated px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-text">{kycLabel(e.name)}</span>
                  <StatusBadge status={e.status} />
                </div>
                {e.missing?.length ? (
                  <RequirementChips
                    label="Still needed"
                    requirements={e.missing}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="What this user can do">
        <div className="grid gap-2 sm:grid-cols-2">
          {capabilities.map(([label, value]) => (
            <Row key={label} label={label}>
              <StatusBadge status={value} />
            </Row>
          ))}
        </div>
      </Section>

      {snapshot.requirements_due.length > 0 && (
        <RequirementChips
          label="Needed to finish verification"
          requirements={snapshot.requirements_due}
        />
      )}
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium text-text-muted">{title}</div>
      {children}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-background-elevated px-3 py-2">
      <span className="text-sm text-text-muted">{label}</span>
      {children}
    </div>
  );
}

function RequirementChips({
  label,
  requirements,
}: {
  label: string;
  requirements: string[];
}) {
  // Several raw keys can map to the same label (e.g. ToS versions).
  const labels = [...new Set(requirements.map(kycLabel))];
  return (
    <div className="mt-2">
      <div className="mb-1.5 text-xs text-text-muted">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {labels.map((text) => (
          <Badge key={text} variant="warning">
            {text}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={kycStatusVariant(status)}>{kycLabel(status)}</Badge>;
}

/** Folds a webhook event's snapshot into the existing status (preserving links). */
export function mergeWebhookData(
  prev: KyxStatusResponse | null,
  event: KycWebhookEvent,
  environment: "sandbox" | "production",
): KyxStatusResponse | null {
  const data = event.data;
  if (!data) return prev;

  const base: KyxStatusResponse = prev ?? {
    provider: event.provider,
    environment,
    status: data.status,
    tos: { status: data.tos.status },
    kyc: { status: data.kyc.status },
    endorsements: [],
    capabilities: data.capabilities,
    requirements_due: [],
    future_requirements_due: [],
  };

  return {
    ...base,
    status: data.status,
    tos: { ...base.tos, status: data.tos.status },
    kyc: { ...base.kyc, status: data.kyc.status },
    endorsements: data.endorsements,
    capabilities: data.capabilities,
  };
}
