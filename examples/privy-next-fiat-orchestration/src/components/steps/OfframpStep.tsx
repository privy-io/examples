"use client";

import { useEffect, useState } from "react";
import { useAuthorizationSignature } from "@privy-io/react-auth";
import {
  apiCall,
  ApiMeta,
  isPayoutWebhookEvent,
  isTerminalActionStatus,
  PayoutResponse,
  PayoutWebhookEvent,
} from "@/lib/api";
import { useWebhookStream } from "@/lib/use-kyc-stream";
import { cn } from "@/lib/cn";
import { Badge, type BadgeVariant } from "@/lib/ui/badge";
import { Button } from "@/lib/ui/button";
import { Callout } from "@/lib/ui/callout";
import { Input, Label, Select } from "@/lib/ui/input";

interface Props {
  getAccessToken: () => Promise<string | null>;
  userId: string;
  walletAddress: string;
  walletId: string;
  environment: "sandbox" | "production";
  onApiCall: (meta: ApiMeta) => void;
}

interface BankAccount {
  id: string;
  bank_name?: string;
  last_4?: string;
  currency?: string;
}

// Which chains each asset can be paid out from: Bridge must support the chain
// for liquidation addresses, and Privy must have the token's contract address on
// it. USDC.e and USDT0 are the Tempo-native names for USDC and USDT — the caller
// passes the Privy asset id and Privy translates it to Bridge's currency.
const CHAINS_BY_ASSET = {
  usdc: ["base", "ethereum", "arbitrum", "polygon", "optimism"],
  usdt: ["base", "ethereum", "arbitrum", "polygon", "optimism"],
  eurc: ["ethereum", "base"],
  usdc_e: ["tempo"],
  usdt0: ["tempo"],
} as const;

type SourceAsset = keyof typeof CHAINS_BY_ASSET;

const ASSET_LABELS: Record<SourceAsset, string> = {
  usdc: "USDC",
  usdt: "USDT",
  eurc: "EURC",
  usdc_e: "USDC.e",
  usdt0: "USDT0",
};

// Chain is the primary choice and the asset list follows it, so both are derived
// from the map above rather than being listed twice and drifting apart.
const SOURCE_CHAINS = [...new Set(Object.values(CHAINS_BY_ASSET).flat())];

const CHAIN_LABELS: Record<string, string> = {
  base: "Base",
  ethereum: "Ethereum",
  arbitrum: "Arbitrum",
  polygon: "Polygon",
  optimism: "Optimism",
  tempo: "Tempo",
};

const PAYOUT_STATUS: Record<string, { label: string; variant: BadgeVariant }> =
  {
    pending: { label: "Processing", variant: "info" },
    succeeded: { label: "Completed", variant: "success" },
    failed: { label: "Failed", variant: "error" },
    rejected: { label: "Rejected", variant: "error" },
  };

const STEP_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Pending", variant: "neutral" },
  confirmed: { label: "Confirmed", variant: "success" },
  rejected: { label: "Rejected", variant: "error" },
  failed: { label: "Failed", variant: "error" },
  reverted: { label: "Reverted", variant: "error" },
};

/** `fiat_settlement` → "Fiat settlement", for API values without a label. */
function humanize(value: string | undefined): string {
  if (!value) return "Unknown";
  const text = value.replace(/[_.]/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function chainLabel(chain: string | undefined): string {
  return (chain && CHAIN_LABELS[chain]) || humanize(chain);
}

function assetLabel(asset: string | undefined): string {
  return (asset && ASSET_LABELS[asset as SourceAsset]) || (asset ?? "").toUpperCase();
}

/**
 * Privy errors come back as `{ error: string }`, and the demo routes reply the
 * same way when they reject a request, so that is the message worth showing.
 */
function errorMessage(meta: ApiMeta, fallback: string): string {
  const body = meta.responseBody as { error?: unknown; message?: unknown } | null;
  if (typeof body?.error === "string" && body.error) return body.error;
  if (typeof body?.message === "string" && body.message) return body.message;
  return `${fallback} (HTTP ${meta.responseStatus})`;
}

function isOk(meta: ApiMeta): boolean {
  return meta.responseStatus >= 200 && meta.responseStatus < 300;
}

function assetsForChain(chain: string): SourceAsset[] {
  return (Object.keys(CHAINS_BY_ASSET) as SourceAsset[]).filter((asset) =>
    (CHAINS_BY_ASSET[asset] as readonly string[]).includes(chain),
  );
}

export function OfframpStep({
  getAccessToken,
  walletId,
  environment,
  onApiCall,
}: Props) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [payout, setPayout] = useState<PayoutResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live wallet_action.payout.* events (via backend SSE), the same mechanism the
  // KYC and deposit account steps use.
  const { events, connected } = useWebhookStream(getAccessToken, walletId);

  const [form, setForm] = useState({
    amount: "50.00",
    asset: "usdc" as SourceAsset,
    chain: "base",
    fiat_account_id: "",
  });

  useEffect(() => {
    void loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment]);

  async function loadAccounts() {
    const token = await getAccessToken();
    if (!token) return;

    const { result, meta } = await apiCall<{
      external_fiat_accounts?: BankAccount[];
    }>(`/accounts?provider=bridge&environment=${environment}`, { token });
    onApiCall(meta);
    if (!isOk(meta)) {
      setError(errorMessage(meta, "Couldn't load your bank accounts."));
      return;
    }

    const list = result?.external_fiat_accounts ?? [];
    setAccounts(list);
    // Reconcile the selection against the new list rather than keeping whatever
    // was selected before: payout derives its environment from the destination
    // account, so a stale id would send it somewhere unexpected. Clearing to ""
    // also keeps the send button disabled when there are no accounts.
    setForm((prev) => ({
      ...prev,
      fiat_account_id: list.some((account) => account.id === prev.fiat_account_id)
        ? prev.fiat_account_id
        : (list[0]?.id ?? ""),
    }));
  }

  const { generateAuthorizationSignature } = useAuthorizationSignature();

  /**
   * One user action, three calls: payout spends from the wallet, so a user-owned
   * wallet needs the user's authorization signature. The server builds the exact
   * request, the browser signs it, and the signature goes back to execute.
   */
  async function sendPayout() {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) return;

      const payoutBody = {
        source: { asset: form.asset, chain: form.chain, amount: form.amount },
        destination: { fiat_account_id: form.fiat_account_id },
      };

      const prepared = await apiCall<{
        signaturePayload: Record<string, unknown>;
        requestBody: Record<string, unknown>;
        wallet_id: string;
      }>("/payout/prepare", {
        method: "POST",
        body: { wallet_id: walletId, ...payoutBody },
        token,
      });
      onApiCall(prepared.meta);

      if (!isOk(prepared.meta) || !prepared.result) {
        setError(errorMessage(prepared.meta, "Couldn't prepare the payout."));
        return;
      }

      let signature: string;
      try {
        ({ signature } = await generateAuthorizationSignature(
          prepared.result.signaturePayload as unknown as Parameters<
            typeof generateAuthorizationSignature
          >[0],
        ));
      } catch (e) {
        setError(
          `Couldn't sign the payout with your wallet${
            e instanceof Error && e.message ? `: ${e.message}` : "."
          }`,
        );
        return;
      }

      const { result, meta } = await apiCall<PayoutResponse>("/payout", {
        method: "POST",
        body: {
          wallet_id: prepared.result.wallet_id,
          requestBody: prepared.result.requestBody,
          authorization_signature: signature,
          // Not part of the payout body — only labels the Bridge host shown in
          // the inspector, which otherwise always claimed sandbox.
          environment,
        },
        token,
      });
      onApiCall(meta);

      if (!isOk(meta)) {
        setError(errorMessage(meta, "The payout didn't go through."));
        return;
      }

      setPayout(result);
    } finally {
      setLoading(false);
    }
  }

  // The POST only ever returns `pending`, so the webhook is the source of truth
  // for everything after it. Take the newest event for this action — `created`
  // arrives first, then one terminal event carrying steps and any failure.
  const latestEvent: PayoutWebhookEvent | undefined = payout
    ? events
        .filter(isPayoutWebhookEvent)
        .filter((event) => event.wallet_action_id === payout.id)
        .at(-1)
    : undefined;

  const live: PayoutResponse | null =
    payout && latestEvent
      ? {
          ...payout,
          status: latestEvent.status as PayoutResponse["status"],
          ...(latestEvent.steps ? { steps: latestEvent.steps } : {}),
          ...(latestEvent.failure_reason
            ? { failure_reason: latestEvent.failure_reason }
            : {}),
        }
      : payout;

  const selectedAccount = accounts.find((a) => a.id === form.fiat_account_id);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text">Step 5: Offramp</h3>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">
          Cash out stablecoins from your wallet to your linked bank account.
          You&apos;ll approve the payout with your wallet before it&apos;s sent.
        </p>
      </div>

      {!payout && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="offramp-amount">Amount</Label>
              <Input
                id="offramp-amount"
                type="text"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="offramp-chain">Network</Label>
              <Select
                id="offramp-chain"
                value={form.chain}
                onChange={(e) => {
                  // The asset list depends on the chain, so drop to an asset the
                  // new chain actually offers — e.g. base's USDC has no Tempo
                  // equivalent, where it is USDC.e instead.
                  const chain = e.target.value;
                  const assets = assetsForChain(chain);
                  setForm((prev) => ({
                    ...prev,
                    chain,
                    asset: assets.includes(prev.asset) ? prev.asset : assets[0],
                  }));
                }}
              >
                {SOURCE_CHAINS.map((c) => (
                  <option key={c} value={c}>
                    {chainLabel(c)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="offramp-asset">Asset</Label>
              <Select
                id="offramp-asset"
                value={form.asset}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    asset: e.target.value as SourceAsset,
                  }))
                }
              >
                {assetsForChain(form.chain).map((a) => (
                  <option key={a} value={a}>
                    {ASSET_LABELS[a]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="offramp-destination">Destination account</Label>
              <Select
                id="offramp-destination"
                value={form.fiat_account_id}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    fiat_account_id: e.target.value,
                  }))
                }
              >
                {accounts.length === 0 && (
                  <option value="">No bank accounts linked</option>
                )}
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {accountLabel(a)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Currency and payment rail come from the linked account, not the
              request — the payout body only takes source and destination. */}
          {selectedAccount && (
            <p className="text-xs text-text-subtle">
              Arrives in{" "}
              {selectedAccount.currency?.toUpperCase() ||
                "the account's currency"}{" "}
              at {selectedAccount.bank_name || "your linked bank"}.
            </p>
          )}

          {accounts.length === 0 && !error && (
            <Callout variant="warning" title="Link a bank account first">
              Add a bank account in the previous step, then come back to send a
              payout.
            </Callout>
          )}

          {error && (
            <Callout variant="error" title="Payout not sent">
              {error}
            </Callout>
          )}

          <Button
            onClick={sendPayout}
            loading={loading}
            disabled={!walletId || !form.fiat_account_id}
          >
            {loading ? "Sending payout" : "Send payout"}
          </Button>
        </div>
      )}

      {payout && (
        <PayoutStatus
          payout={live ?? payout}
          account={accounts.find(
            (a) => a.id === (live ?? payout).destination?.fiat_account_id,
          )}
          connected={connected}
        />
      )}
    </div>
  );
}

function accountLabel(account: BankAccount): string {
  const name = account.bank_name || "Bank account";
  const last4 = account.last_4 ? ` ••••${account.last_4}` : "";
  const currency = account.currency
    ? ` (${account.currency.toUpperCase()})`
    : "";
  return `${name}${last4}${currency}`;
}

function PayoutStatus({
  payout,
  account,
  connected,
}: {
  payout: PayoutResponse;
  account: BankAccount | undefined;
  connected: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const terminal = isTerminalActionStatus(payout.status);
  const status = PAYOUT_STATUS[payout.status] ?? {
    label: humanize(payout.status),
    variant: "neutral" as const,
  };
  const failure =
    payout.failure_reason?.message ??
    payout.steps?.find((step) => step.failure_reason?.message)?.failure_reason
      ?.message;

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-border bg-background-elevated p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-text">Payout</div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <dl className="space-y-1.5 text-sm">
          <SummaryRow
            label="Amount"
            value={`${payout.source?.amount} ${assetLabel(payout.source?.asset)} on ${chainLabel(payout.source?.chain)}`}
          />
          <SummaryRow
            label="To"
            value={account ? accountLabel(account) : "Your linked bank account"}
          />
        </dl>
      </div>

      {payout.status === "succeeded" && (
        <Callout variant="success" title="Payout complete">
          The funds have been sent to your bank account.
        </Callout>
      )}

      {terminal && payout.status !== "succeeded" && (
        <Callout variant="error" title={`Payout ${status.label.toLowerCase()}`}>
          {failure ||
            "The payout didn't complete. Check the API inspector for details."}
        </Callout>
      )}

      {!terminal && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              connected
                ? "animate-pulse bg-background-interactive"
                : "bg-border-hover",
            )}
          />
          {connected
            ? "Sending your funds. This updates automatically once the payout settles."
            : "Waiting to reconnect for live updates…"}
        </div>
      )}

      {/* Steps attribute a failure to the crypto leg or the fiat leg. */}
      {payout.steps && payout.steps.length > 0 && (
        <ol className="space-y-2">
          {payout.steps.map((step, i) => {
            const stepStatus = STEP_STATUS[step.status] ?? {
              label: humanize(step.status),
              variant: "neutral" as const,
            };
            return (
              <li
                key={`${step.type}-${i}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm"
              >
                <span className="text-text">
                  {i + 1}. {humanize(step.type)}
                </span>
                <Badge variant={stepStatus.variant}>{stepStatus.label}</Badge>
              </li>
            );
          })}
        </ol>
      )}

      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3"
          onClick={() => setShowDetails((open) => !open)}
        >
          {showDetails ? "Hide details" : "Show details"}
        </Button>
        {showDetails && (
          <div className="mt-2 space-y-3 rounded-xl border border-border bg-background-elevated p-3 text-xs text-text-muted">
            <dl className="space-y-1.5">
              <SummaryRow label="Action ID" value={payout.id} mono />
              <SummaryRow label="Status" value={payout.status} mono />
              <SummaryRow
                label="Provider"
                value={`${payout.provider} (${payout.environment})`}
                mono
              />
              {payout.steps
                ?.filter((step) => step.transaction_hash)
                .map((step, i) => (
                  <SummaryRow
                    key={`${step.type}-tx-${i}`}
                    label={`${humanize(step.type)} transaction`}
                    value={step.transaction_hash ?? ""}
                    mono
                  />
                ))}
            </dl>
            {!terminal && (
              <p className="leading-relaxed">
                Status comes from <code>wallet_action.payout</code> webhooks.
                Subscribe to them in the Privy dashboard, or this stays
                processing even after the payout settles.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-text-muted">{label}</dt>
      <dd
        className={cn(
          "min-w-0 break-all text-right text-text",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </dd>
    </div>
  );
}