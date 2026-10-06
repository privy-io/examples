"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Landmark, Plus } from "lucide-react";
import {
  apiCall,
  ApiMeta,
  FiatDepositAccount,
  CreateFiatDepositAccountResponse,
  DepositWebhookEvent,
  isDepositWebhookEvent,
  ListFiatDepositAccountsResponse,
} from "@/lib/api";
import { useWebhookStream } from "@/lib/use-kyc-stream";
import { Badge, type BadgeVariant } from "@/lib/ui/badge";
import { Button } from "@/lib/ui/button";
import { Callout } from "@/lib/ui/callout";
import { Label, Select } from "@/lib/ui/input";

interface Props {
  getAccessToken: () => Promise<string | null>;
  userId: string;
  walletId: string;
  environment: "sandbox" | "production";
  onApiCall: (meta: ApiMeta) => void;
  onNext: () => void;
}

// The full sets the API accepts. Destination asset and chain are free-form
// strings in the request schema, validated at Privy's boundary against Bridge's
// virtual-account currencies and payment rails.
const CURRENCY_OPTIONS = ["usd", "eur", "gbp", "brl", "mxn", "cop"] as const;
const ASSET_OPTIONS = ["usdc", "usdt", "eurc", "pyusd", "usdb"] as const;
const CHAIN_OPTIONS = [
  "base",
  "ethereum",
  "arbitrum",
  "polygon",
  "optimism",
  "tempo",
  "celo",
  "avalanche_c_chain",
  "xdc",
  "solana",
  "stellar",
  "tron",
] as const;

// The wallet's own address is the delivery address for converted deposits, so a
// non-EVM chain needs a wallet of that type — asking for Solana delivery on an
// EVM wallet is rejected because the address is not a valid Solana address.
const EVM_CHAINS: readonly string[] = [
  "base",
  "ethereum",
  "arbitrum",
  "polygon",
  "optimism",
  "tempo",
  "celo",
  "avalanche_c_chain",
  "xdc",
];

const CHAIN_LABELS: Record<string, string> = {
  base: "Base",
  ethereum: "Ethereum",
  arbitrum: "Arbitrum",
  polygon: "Polygon",
  optimism: "Optimism",
  tempo: "Tempo",
  celo: "Celo",
  avalanche_c_chain: "Avalanche C-Chain",
  xdc: "XDC",
  solana: "Solana",
  stellar: "Stellar",
  tron: "Tron",
};

const RAIL_LABELS: Record<string, string> = {
  ach_push: "ACH",
  ach: "ACH",
  wire: "Wire",
  sepa: "SEPA",
  faster_payments: "Faster Payments",
  pix: "Pix",
  spei: "SPEI",
};

const ACCOUNT_STATUS: Record<string, { label: string; variant: BadgeVariant }> =
  {
    activated: { label: "Active", variant: "success" },
    active: { label: "Active", variant: "success" },
    pending: { label: "Pending", variant: "warning" },
    deactivated: { label: "Deactivated", variant: "neutral" },
  };

const INSTRUCTION_LABELS: Record<string, string> = {
  bank_name: "Bank name",
  bank_address: "Bank address",
  bank_routing_number: "Routing number",
  bank_account_number: "Account number",
  bank_beneficiary_name: "Beneficiary name",
  bank_beneficiary_address: "Beneficiary address",
  account_holder_name: "Account holder",
  iban: "IBAN",
  bic: "BIC",
  sort_code: "Sort code",
  account_number: "Account number",
  routing_number: "Routing number",
  payment_rails: "Payment methods",
  currency: "Currency",
  deposit_message: "Reference",
};

/** "avalanche_c_chain" → "Avalanche c chain", for values without a label. */
function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function chainLabel(chain: string): string {
  return CHAIN_LABELS[chain] ?? humanize(chain);
}

function railLabel(rail: string): string {
  return RAIL_LABELS[rail] ?? humanize(rail);
}

/** Pulls a readable message out of a failed response, whatever its shape. */
function errorMessage(meta: ApiMeta): string {
  const body = meta.responseBody as
    | { error?: unknown; message?: unknown }
    | null
    | undefined;
  const candidate = body?.error ?? body?.message;
  if (typeof candidate === "string" && candidate) return candidate;
  if (
    candidate &&
    typeof candidate === "object" &&
    "message" in candidate &&
    typeof candidate.message === "string"
  ) {
    return candidate.message;
  }
  return `Request failed with status ${meta.responseStatus}.`;
}

/** The list endpoint wraps results as `fiat_deposit_accounts` (privy #19309). */
function isOk(meta: ApiMeta): boolean {
  return meta.responseStatus >= 200 && meta.responseStatus < 300;
}

export function DepositAccountStep({
  getAccessToken,
  walletId,
  environment,
  onApiCall,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<FiatDepositAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    currency: "usd",
    asset: "usdc",
    chain: "base",
  });

  // Live wallet.deposit_account.deposit_* events (via backend SSE).
  const { events, connected } = useWebhookStream(getAccessToken, walletId);
  const deposits = events.filter(isDepositWebhookEvent);

  const fetchAccounts = async () => {
    const token = await getAccessToken();
    if (!token) return;

    const { result, meta } = await apiCall<ListFiatDepositAccountsResponse>(
      `/deposit-accounts?wallet_id=${walletId}&provider=bridge&environment=${environment}`,
      { token },
    );

    onApiCall(meta);
    if (!isOk(meta)) {
      setError(errorMessage(meta));
      return;
    }
    if (Array.isArray(result?.fiat_deposit_accounts)) {
      setAccounts(result.fiat_deposit_accounts);
    }
  };

  useEffect(() => {
    void fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, walletId]);

  const createAccount = async () => {
    setLoading(true);
    setError(null);
    const token = await getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Create returns the account wrapped as `fiat_deposit_account`, while list
    // returns a `fiat_deposit_accounts` array — the keys differ per endpoint.
    const { result, meta } = await apiCall<CreateFiatDepositAccountResponse>(
      `/deposit-accounts?wallet_id=${walletId}`,
      {
        method: "POST",
        body: {
          provider: "bridge",
          environment,
          source: { currency: form.currency },
          destination: { asset: form.asset, chain: form.chain },
        },
        token,
      },
    );

    onApiCall(meta);
    const created = result?.fiat_deposit_account;
    if (isOk(meta) && created?.id) {
      setAccounts((prev) => [...prev, created]);
      setShowForm(false);
    } else {
      setError(errorMessage(meta));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text">Deposit account</h3>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">
          Give this wallet its own bank account details. Any money sent to them
          is converted to stablecoins and delivered to the wallet
          automatically.
        </p>
      </div>

      {error && (
        <Callout variant="error" title="Something went wrong">
          {error}
        </Callout>
      )}

      {accounts.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-medium text-text-muted">
            Your deposit accounts
          </div>
          {accounts.map((account) => (
            <DepositAccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      {!showForm && (
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="size-4" />
            Add new account
          </Button>
          <Button onClick={onNext}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {showForm && (
        <div className="space-y-4 rounded-card border border-border bg-background-hover p-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="deposit-currency">Deposit currency</Label>
              <Select
                id="deposit-currency"
                value={form.currency}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, currency: e.target.value }))
                }
              >
                {CURRENCY_OPTIONS.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency.toUpperCase()}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="deposit-asset">Receive as</Label>
              <Select
                id="deposit-asset"
                value={form.asset}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, asset: e.target.value }))
                }
              >
                {ASSET_OPTIONS.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset.toUpperCase()}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="deposit-chain">On network</Label>
              <Select
                id="deposit-chain"
                value={form.chain}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, chain: e.target.value }))
                }
              >
                {CHAIN_OPTIONS.map((chain) => (
                  <option key={chain} value={chain}>
                    {chainLabel(chain)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {!EVM_CHAINS.includes(form.chain) && (
            <Callout variant="warning" title="This network needs a matching wallet">
              Deposits are delivered to this wallet&apos;s own address, so{" "}
              {chainLabel(form.chain)} only works with a{" "}
              {chainLabel(form.chain)} wallet.
            </Callout>
          )}

          <div className="text-sm text-text-muted">
            Deposits in{" "}
            <span className="font-medium text-text">
              {form.currency.toUpperCase()}
            </span>{" "}
            arrive as{" "}
            <span className="font-medium text-text">
              {form.asset.toUpperCase()}
            </span>{" "}
            on{" "}
            <span className="font-medium text-text">
              {chainLabel(form.chain)}
            </span>
            .
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={createAccount} loading={loading}>
              {loading ? "Creating…" : "Create deposit account"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <DepositUpdates deposits={deposits} connected={connected} />
    </div>
  );
}

/** Renders a single deposit account with its bank/deposit instructions. */
function DepositAccountCard({ account }: { account: FiatDepositAccount }) {
  const instructionEntries = account.deposit_instructions
    ? (Object.entries(account.deposit_instructions).filter(
        ([, value]) => value !== undefined && value !== null,
      ) as [string, unknown][])
    : [];
  const status = ACCOUNT_STATUS[account.status] ?? {
    label: humanize(account.status),
    variant: "neutral" as const,
  };

  return (
    <div className="space-y-4 rounded-card border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-background-elevated">
            <Landmark className="size-4 text-text-muted" />
          </div>
          <div>
            <div className="text-sm font-medium text-text">
              {account.source.currency.toUpperCase()} to{" "}
              {account.destination.asset.toUpperCase()} on{" "}
              {chainLabel(account.destination.chain)}
            </div>
            {account.source.payment_rails.length > 0 && (
              <div className="text-xs text-text-muted">
                Accepts{" "}
                {account.source.payment_rails.map(railLabel).join(", ")}
              </div>
            )}
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {instructionEntries.length > 0 && (
        <div className="rounded-xl bg-background-elevated p-3">
          <div className="mb-2 text-xs font-medium text-text-muted">
            Send money to
          </div>
          <dl className="space-y-1.5 text-sm">
            {instructionEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-3">
                <dt className="text-text-muted">
                  {INSTRUCTION_LABELS[key] ?? humanize(key)}
                </dt>
                <dd className="text-right font-medium text-text">
                  {Array.isArray(value)
                    ? key === "payment_rails"
                      ? value.map((rail) => railLabel(String(rail))).join(", ")
                      : value.join(", ")
                    : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

/** Friendly label and badge colour per lifecycle event. */
const DEPOSIT_EVENT_DISPLAY: Record<
  DepositWebhookEvent["type"],
  { label: string; variant: BadgeVariant }
> = {
  "wallet.deposit_account.deposit_started": {
    label: "Deposit received",
    variant: "info",
  },
  "wallet.deposit_account.deposit_completed": {
    label: "Deposit completed",
    variant: "success",
  },
  "wallet.deposit_account.deposit_failed": {
    label: "Deposit failed",
    variant: "error",
  },
};

/** Renders the live feed of the wallet's deposit lifecycle events. */
function DepositUpdates({
  deposits,
  connected,
}: {
  deposits: DepositWebhookEvent[];
  connected: boolean;
}) {
  return (
    <div className="space-y-3 rounded-card border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-text">Incoming deposits</div>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <span
            className={`size-2 rounded-full ${
              connected ? "bg-text-success" : "bg-text-subtle"
            }`}
          />
          {connected ? "Listening" : "Disconnected"}
        </span>
      </div>

      {deposits.length === 0 ? (
        <p className="text-sm text-text-muted">
          No deposits yet. Send a test deposit to one of your deposit accounts
          and it will show up here as it moves through each stage.
        </p>
      ) : (
        <div className="space-y-2">
          {deposits
            .slice()
            .reverse()
            .map((event, i) => (
              <DepositEventRow
                key={`${event.provider_deposit_id}-${event.type}-${i}`}
                event={event}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function DepositEventRow({ event }: { event: DepositWebhookEvent }) {
  const [showDetails, setShowDetails] = useState(false);
  const display = DEPOSIT_EVENT_DISPLAY[event.type];
  const { source, destination } = event.data;

  return (
    <div className="rounded-xl bg-background-elevated p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <Badge variant={display.variant}>{display.label}</Badge>
        <span className="text-xs text-text-subtle">
          {new Date(event.receivedAt).toLocaleTimeString()}
        </span>
      </div>

      <div className="mt-2 space-y-1">
        <div className="text-text">
          <span className="font-medium">
            {source.amount} {source.currency.toUpperCase()}
          </span>{" "}
          <span className="text-text-muted">
            to {destination.asset.toUpperCase()} on{" "}
            {chainLabel(destination.chain)}
          </span>
        </div>
        {source.payment_rail && (
          <div className="text-xs text-text-muted">
            Via {railLabel(source.payment_rail)}
            {source.sender_name ? ` from ${source.sender_name}` : ""}
          </div>
        )}
        {event.type === "wallet.deposit_account.deposit_completed" && (
          <div className="text-xs text-text-success">
            Delivered {event.data.destination.amount}{" "}
            {event.data.destination.asset.toUpperCase()} to the wallet
          </div>
        )}
        {event.type === "wallet.deposit_account.deposit_failed" && (
          <div className="text-xs text-text-error">
            {event.data.reason}. Refunded to the sender on{" "}
            {new Date(event.data.refunded_at).toLocaleString()}.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="mt-2 cursor-pointer text-xs text-text-interactive hover:text-text-interactive-hover"
      >
        {showDetails ? "Hide details" : "Show details"}
      </button>
      {showDetails && (
        <pre className="mt-2 overflow-x-auto rounded-lg bg-background p-2 font-mono text-[11px] text-text-muted">
          {JSON.stringify(event.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
