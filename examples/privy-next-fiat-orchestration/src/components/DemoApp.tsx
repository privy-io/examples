"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { ApiInspector } from "@/components/ApiInspector";
import { OverviewPanel } from "@/components/OverviewPanel";
import { StepWizard } from "@/components/StepWizard";
import { apiCall, ApiMeta, KycWebhookEvent } from "@/lib/api";
import { ENVIRONMENT, PROVIDER } from "@/lib/config";
import { useWebhookStream } from "@/lib/use-kyc-stream";
import { Badge } from "@/lib/ui/badge";
import { Button } from "@/lib/ui/button";
import { Card, CardDescription, CardTitle } from "@/lib/ui/card";

export function DemoApp() {
  const { ready, authenticated, login, logout, user, getAccessToken } =
    usePrivy();
  const [apiLog, setApiLog] = useState<ApiMeta[]>([]);
  const [inspectorOpen, setInspectorOpen] = useState(true);

  const addToLog = (meta: ApiMeta) => {
    setApiLog((prev) => [...prev, meta]);
  };

  const userEmail = user?.email?.address || user?.google?.email || "";

  const embeddedWallet = user?.linkedAccounts?.find(
    (a) =>
      a.type === "wallet" &&
      "walletClientType" in a &&
      a.walletClientType === "privy",
  ) as { address?: string; id?: string } | undefined;
  const walletId = embeddedWallet?.id || "";

  // One stream for the whole app: the inspector shows every event raw, and the
  // wizard folds the KYC ones into its status snapshot.
  const webhooks = useWebhookStream(getAccessToken, walletId || undefined);
  const kycEvents = webhooks.events.filter(
    (event): event is KycWebhookEvent => event.type === "user.kyc.updated",
  );

  // Wallets created at login have an owner but no entity, and the V2 fiat
  // endpoints resolve KYC by entity. Assign it once so the fiat flows work.
  // This becomes unnecessary once wallet creation assigns the entity itself.
  useEffect(() => {
    if (!authenticated || !walletId) return;

    let cancelled = false;
    (async () => {
      const token = await getAccessToken();
      if (!token || cancelled) return;

      const { result, meta } = await apiCall<{ entity?: unknown }>(
        `/wallet/${walletId}`,
        { token },
      );
      if (cancelled) return;
      addToLog(meta);
      if (result?.entity) return;

      const assigned = await apiCall(`/wallet/${walletId}/entity`, {
        method: "POST",
        token,
      });
      if (cancelled) return;
      addToLog(assigned.meta);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, walletId]);

  const clearLog = () => setApiLog([]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-text-muted">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/privy-logo.png" alt="Privy" className="size-6 rounded-md" />
          <span className="text-sm font-semibold text-text">
            Fiat orchestration demo
          </span>
          <Badge variant="warning">Sandbox</Badge>
        </div>
        <div className="flex items-center gap-3">
          {authenticated ? (
            <>
              <span className="text-xs text-text-muted">
                {userEmail || user?.id}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={login}>
              Log in
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-[220px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-background-hover p-5">
          <div className="text-xs font-semibold text-text-muted">
            Configuration
          </div>
          <div>
            <div className="mb-1.5 text-xs text-text-muted">Provider</div>
            <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize text-text">
              {PROVIDER}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs text-text-muted">Environment</div>
            <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize text-text">
              {ENVIRONMENT}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-text-subtle">
              No real money or personal data. Use test details throughout.
            </p>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-2xl space-y-6">
            <section>
              <h1 className="text-2xl font-semibold text-text">
                Move money between bank accounts and wallets
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                This demo shows how Privy&apos;s fiat orchestration APIs take a
                user from sign-up to moving money between bank accounts and
                wallets: accept the provider&apos;s terms, verify their
                identity, get a deposit account that converts incoming fiat
                into stablecoins like USDC, USDT or EURC on the network of
                their choice, link a bank account, and pay stablecoins back out
                as fiat. Follow along in the API inspector to see every call
                behind each step.
              </p>
            </section>

            {authenticated ? (
              <StepWizard
                getAccessToken={getAccessToken}
                userId={user?.id || ""}
                userEmail={userEmail}
                walletAddress={embeddedWallet?.address || ""}
                walletId={walletId}
                environment={ENVIRONMENT}
                kycEvents={kycEvents}
                onApiCall={addToLog}
              />
            ) : (
              <>
                <OverviewPanel onApiCall={addToLog} />
                <Card className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Try it yourself</CardTitle>
                    <CardDescription>
                      Log in to walk through each step with your own sandbox
                      user.
                    </CardDescription>
                  </div>
                  <Button onClick={login}>Get started</Button>
                </Card>
              </>
            )}
          </div>
        </main>

        <div
          className={`shrink-0 overflow-hidden border-l border-border bg-background transition-all duration-200 ${
            inspectorOpen ? "w-[480px]" : "w-0 border-l-0"
          }`}
        >
          {inspectorOpen && (
            <ApiInspector
              log={apiLog}
              webhooks={webhooks.events}
              webhooksConnected={webhooks.connected}
              onClear={clearLog}
            />
          )}
        </div>
        <button
          onClick={() => setInspectorOpen(!inspectorOpen)}
          className="flex w-8 shrink-0 cursor-pointer items-start justify-center border-l border-border bg-background-hover pt-4 text-text-subtle hover:text-text"
          title={inspectorOpen ? "Hide API inspector" : "Show API inspector"}
        >
          {inspectorOpen ? (
            <PanelRightClose className="size-4" />
          ) : (
            <PanelRightOpen className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
