"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Building2, Landmark, ShieldCheck, Wallet } from "lucide-react";
import { API_BASE, ApiMeta, isApprovedStatus } from "@/lib/api";
import type { ShowcaseResponse } from "@/lib/showcase";
import { Badge } from "@/lib/ui/badge";
import { Card, CardDescription, CardTitle } from "@/lib/ui/card";

function Tile({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-background-elevated p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-text-muted">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function Skeleton() {
  return <div className="h-5 w-24 animate-pulse rounded-full bg-background-elevated-hover" />;
}

function last4(value: string | undefined) {
  return value ? `•••• ${value.slice(-4)}` : null;
}

/**
 * The first thing a logged-out visitor sees: a sandbox user that has already
 * been through every step, so the end state is visible before any setup. The
 * Privy calls that produced it go to the inspector.
 */
export function OverviewPanel({
  onApiCall,
}: {
  onApiCall: (meta: ApiMeta) => void;
}) {
  const [showcase, setShowcase] = useState<ShowcaseResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch(`${API_BASE}/showcase`);
      const body = (await res.json().catch(() => null)) as {
        result: ShowcaseResponse | null;
      } | null;
      if (cancelled) return;
      if (!res.ok || !body?.result) {
        setStatus("unavailable");
        return;
      }
      body.result.calls.forEach(onApiCall);
      setShowcase(body.result);
      setStatus("ready");
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No showcase user is configured (e.g. a fresh clone), so skip the panel.
  if (status === "unavailable") return null;

  const deposit = showcase?.depositAccounts[0];
  const instructions = deposit?.deposit_instructions;
  const bank = showcase?.bankAccounts[0];
  const kycApproved = isApprovedStatus(showcase?.kyc?.kyc.status);

  return (
    <Card>
      <CardTitle>See it in action</CardTitle>
      <CardDescription>
        This sandbox user has already finished every step. Fiat sent to their
        deposit account arrives in their wallet as stablecoins, and stablecoins
        can be paid out to their bank account.
      </CardDescription>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Tile icon={<ShieldCheck className="size-3.5" />} label="Identity">
          {status === "loading" ? (
            <Skeleton />
          ) : (
            <Badge variant={kycApproved ? "success" : "warning"}>
              {kycApproved ? "KYC approved" : "KYC in progress"}
            </Badge>
          )}
        </Tile>

        <Tile icon={<Wallet className="size-3.5" />} label="Wallet balance">
          {status === "loading" ? (
            <Skeleton />
          ) : (
            <div className="text-lg font-semibold text-text">
              {showcase?.balance ?? "—"}{" "}
              <span className="text-sm font-normal text-text-muted">
                USDC on Base
              </span>
            </div>
          )}
        </Tile>

        <Tile icon={<Building2 className="size-3.5" />} label="Money in: deposit account">
          {status === "loading" ? (
            <Skeleton />
          ) : deposit ? (
            <div className="text-sm text-text">
              <div className="font-medium">
                {instructions?.bank_name ?? "Virtual bank account"}{" "}
                {last4(instructions?.bank_account_number ?? instructions?.iban)}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                {deposit.source.currency.toUpperCase()}
                <ArrowRight className="size-3" />
                {deposit.destination.asset.toUpperCase()}
              </div>
            </div>
          ) : (
            <span className="text-sm text-text-muted">None yet</span>
          )}
        </Tile>

        <Tile icon={<Landmark className="size-3.5" />} label="Money out: bank account">
          {status === "loading" ? (
            <Skeleton />
          ) : bank ? (
            <div className="text-sm text-text">
              <div className="font-medium">
                {bank.bank_name ?? "Bank account"} {last4(bank.last_4)}
              </div>
              {bank.currency && (
                <div className="mt-0.5 text-xs text-text-muted">
                  Paid out in {bank.currency.toUpperCase()}
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-text-muted">None yet</span>
          )}
        </Tile>
      </div>
    </Card>
  );
}
