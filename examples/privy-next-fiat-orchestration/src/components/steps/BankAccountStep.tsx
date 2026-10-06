"use client";

import { Check, Landmark, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { apiCall, ApiMeta } from "@/lib/api";
import { Badge } from "@/lib/ui/badge";
import { Button } from "@/lib/ui/button";
import { Callout } from "@/lib/ui/callout";
import { Input, Label, Select } from "@/lib/ui/input";
import {
  randomAccountNumber,
  randomRoutingNumber,
  randomGbAccountNumber,
  randomSortCode,
  randomIban,
  randomPixKey,
} from "@/lib/test-bank-account";

interface Props {
  getAccessToken: () => Promise<string | null>;
  userId: string;
  environment: "sandbox" | "production";
  onApiCall: (meta: ApiMeta) => void;
  onNext: () => void;
}

interface BankAccount {
  id: string;
  bank_name?: string;
  last_4?: string;
  currency?: string;
  account_type?: string;
}

const ACCOUNT_TYPES = ["us", "gb", "pix", "iban", "swift"] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

// `account.type` discriminates which detail fields apply. The payment rail is
// derived from the type, so it is never part of the request.
const ACCOUNT_TYPE_FIELDS: Record<AccountType, readonly string[]> = {
  us: ["account_number", "routing_number", "checking_or_savings"],
  gb: ["account_number", "sort_code"],
  pix: ["pix_key", "br_code", "document_number"],
  iban: ["account_number", "bic", "country"],
  swift: [
    "account_number",
    "bic",
    "country",
    "category",
    "purpose_of_funds",
    "short_business_description",
  ],
};

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  us: "US (ACH/wire)",
  gb: "UK (Faster Payments)",
  pix: "Brazil (Pix)",
  iban: "IBAN (SEPA)",
  swift: "International (SWIFT)",
};

const FIELD_LABELS: Record<string, string> = {
  account_owner_name: "Account owner name",
  bank_name: "Bank name",
  currency: "Currency",
  account_number: "Account number",
  routing_number: "Routing number",
  checking_or_savings: "Account type",
  sort_code: "Sort code",
  pix_key: "Pix key",
  br_code: "BR code",
  document_number: "Document number",
  bic: "BIC",
  country: "Country",
  category: "Beneficiary relationship",
  purpose_of_funds: "Purpose of funds",
  short_business_description: "Business description",
  street_line_1: "Street address",
  city: "City",
  state: "State",
  postal_code: "Postal code",
};

const OPTION_LABELS: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  client: "Client",
  parent_company: "Parent company",
  subsidiary: "Subsidiary",
  supplier: "Supplier",
  intra_group_transfer: "Intra-group transfer",
  invoice_for_goods_and_services: "Invoice for goods and services",
};

function labelFor(key: string, labels: Record<string, string>): string {
  if (labels[key]) return labels[key];
  const spaced = key.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function isOk(meta: ApiMeta): boolean {
  return meta.responseStatus >= 200 && meta.responseStatus < 300;
}

/**
 * A readable message for a failed call. Privy errors carry `error` (and
 * sometimes `message`); a KYC gate is called out plainly, since skipping KYC
 * is the most common reason account creation fails in the demo.
 */
function errorMessage(meta: ApiMeta, fallback: string): string {
  const body = meta.responseBody as
    | { error?: unknown; message?: unknown }
    | null
    | undefined;
  const raw =
    typeof body?.error === "string"
      ? body.error
      : typeof body?.message === "string"
        ? body.message
        : "";
  if (/kyc|customer|endorsement|verif|approved/i.test(raw)) {
    return `Complete KYC before adding a bank account. (${raw})`;
  }
  return raw || `${fallback} (HTTP ${meta.responseStatus})`;
}

/**
 * Bridge pins most account types to one settlement currency, and Privy rejects a
 * mismatched pair with `currency must be "x" when account.type is "y"`. SWIFT is
 * the exception: it settles cross-border in whichever currency the beneficiary
 * bank accepts, so it is the only type with a real choice.
 */
const CURRENCY_BY_TYPE: Record<AccountType, string | null> = {
  us: "usd",
  gb: "gbp",
  pix: "brl",
  iban: "eur",
  swift: null,
};

const SWIFT_DEFAULT_CURRENCY = "usd";

// The API validates these against fixed sets, so offer them as selects rather
// than free text — a typo in a text box is a 400 the developer has to debug.
const FIELD_OPTIONS: Record<string, readonly string[]> = {
  currency: ["usd", "eur", "gbp", "brl", "mxn"],
  checking_or_savings: ["checking", "savings"],
  category: ["client", "parent_company", "subsidiary", "supplier"],
  purpose_of_funds: ["intra_group_transfer", "invoice_for_goods_and_services"],
};

/**
 * Fresh details for a type. Bridge rejects an external account whose details
 * match one the customer already has, so these are randomized where the format
 * allows it and each type gets values in its own required shape.
 */
function seedFor(type: AccountType): Record<string, string> {
  switch (type) {
    case "us":
      return {
        account_number: randomAccountNumber(),
        routing_number: randomRoutingNumber(),
        checking_or_savings: "checking",
      };
    case "gb":
      return {
        account_number: randomGbAccountNumber(),
        sort_code: randomSortCode(),
      };
    case "pix":
      return { pix_key: randomPixKey(), br_code: "", document_number: "" };
    case "iban":
      return { account_number: randomIban(), bic: "DEUTDEFF", country: "DEU" };
    case "swift":
      return {
        account_number: randomIban(),
        bic: "DEUTDEFF",
        country: "DEU",
        category: "client",
        purpose_of_funds: "invoice_for_goods_and_services",
        short_business_description: "Software development services",
      };
  }
}

/** Builds the `account` object for the selected type, dropping empty optionals. */
function buildAccount(type: AccountType, f: Record<string, string>) {
  switch (type) {
    case "us":
      return {
        type,
        account_number: f.account_number,
        routing_number: f.routing_number,
        ...(f.checking_or_savings && {
          checking_or_savings: f.checking_or_savings,
        }),
      };
    case "gb":
      return {
        type,
        account_number: f.account_number,
        sort_code: f.sort_code,
      };
    case "pix":
      // Exactly one of pix_key or br_code is accepted, not both.
      return {
        type,
        ...(f.pix_key ? { pix_key: f.pix_key } : { br_code: f.br_code }),
        ...(f.document_number && { document_number: f.document_number }),
      };
    case "iban":
      return {
        type,
        account_number: f.account_number,
        bic: f.bic,
        country: f.country,
      };
    case "swift":
      return {
        type,
        account_number: f.account_number,
        bic: f.bic,
        ...(f.country && { country: f.country }),
        category: f.category,
        // The schema takes an array with at least one entry.
        purpose_of_funds: [f.purpose_of_funds],
        short_business_description: f.short_business_description,
      };
  }
}

export function BankAccountStep({
  getAccessToken,
  environment,
  onApiCall,
  onNext,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [existingAccounts, setExistingAccounts] = useState<BankAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType>("us");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    account_owner_name: "John Doe",
    bank_name: "Chase",
    currency: "usd",
  });

  const [accountFields, setAccountFields] = useState<Record<string, string>>(
    {},
  );

  const [address, setAddress] = useState({
    street_line_1: "123 Main St",
    city: "San Francisco",
    state: "CA",
    postal_code: "94105",
    country: "USA",
  });

  // Seeded after mount, not in the useState initializer: Math.random() and
  // crypto.randomUUID() there would produce different values on the server
  // prerender and the client, causing a hydration mismatch.
  useEffect(() => {
    setAccountFields(seedFor("us"));
  }, []);

  const changeAccountType = (type: AccountType) => {
    setAccountType(type);
    setAccountFields(seedFor(type));
    setForm((prev) => ({
      ...prev,
      currency: CURRENCY_BY_TYPE[type] ?? SWIFT_DEFAULT_CURRENCY,
    }));
  };

  const fetchAccounts = async () => {
    const token = await getAccessToken();
    if (!token) return;

    const { result, meta } = await apiCall<{
      external_fiat_accounts?: BankAccount[];
    } | null>(`/accounts?provider=bridge&environment=${environment}`, {
      token,
    });

    onApiCall(meta);

    if (!isOk(meta)) {
      setError(errorMessage(meta, "Couldn't load your bank accounts."));
      return;
    }
    // Read the one documented key rather than guessing across several. This list
    // has been renamed twice (accounts -> data -> external_fiat_accounts), and
    // the old fallback chain turned each rename into an empty list instead of a
    // visible error.
    if (Array.isArray(result?.external_fiat_accounts)) {
      setExistingAccounts(result.external_fiat_accounts);
    } else {
      console.error(
        "Unexpected external_fiat_accounts list shape:",
        Object.keys(result ?? {}),
      );
    }
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment]);

  const deleteAccount = async (accountId: string) => {
    setDeletingId(accountId);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) return;

      const { meta } = await apiCall(
        `/accounts/${accountId}?provider=bridge&environment=${environment}`,
        { method: "DELETE", token },
      );

      onApiCall(meta);
      if (isOk(meta)) {
        setExistingAccounts((prev) => prev.filter((a) => a.id !== accountId));
      } else {
        setError(errorMessage(meta, "Couldn't remove this bank account."));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const createAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) return;

      // Create wraps the account under `external_fiat_account`, while list
      // returns an `external_fiat_accounts` array.
      const { result, meta } = await apiCall<{
        external_fiat_account?: BankAccount;
      } | null>("/accounts", {
        method: "POST",
        body: {
          provider: "bridge",
          environment,
          account_owner_name: form.account_owner_name,
          bank_name: form.bank_name,
          currency: form.currency,
          account: buildAccount(accountType, accountFields),
          address,
        },
        token,
      });

      onApiCall(meta);
      const created = result?.external_fiat_account;
      if (isOk(meta) && created?.id) {
        setExistingAccounts((prev) => [...prev, created]);
        setShowForm(false);
        // Re-seed so opening the form again creates another new account rather
        // than replaying details Bridge would reject as a duplicate.
        setAccountFields(seedFor(accountType));
      } else {
        setError(errorMessage(meta, "Couldn't add this bank account."));
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (
    key: string,
    value: string,
    onChange: (next: string) => void,
  ) => {
    const id = `bank-${key}`;
    return (
      <div key={key}>
        <Label htmlFor={id}>{labelFor(key, FIELD_LABELS)}</Label>
        {FIELD_OPTIONS[key] ? (
          <Select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {FIELD_OPTIONS[key].map((option) => (
              <option key={option} value={option}>
                {key === "currency"
                  ? option.toUpperCase()
                  : labelFor(option, OPTION_LABELS)}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text">
          Step 4: Add a bank account
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">
          Link the bank account that receives fiat when you offramp. We&apos;ve
          filled in test details, so you can add one straight away.
        </p>
      </div>

      {error && (
        <Callout variant="error" title="Something went wrong">
          {error}
        </Callout>
      )}

      {existingAccounts.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-text">Linked accounts</div>
          {existingAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-xl border border-border bg-background p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-background-success">
                  <Check className="size-4 text-text-success" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text">
                    {account.bank_name || "Bank account"}
                    {account.last_4 && ` ••••${account.last_4}`}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {account.currency && (
                      <Badge>{account.currency.toUpperCase()}</Badge>
                    )}
                    {account.account_type && (
                      <Badge>
                        {labelFor(account.account_type, ACCOUNT_TYPE_LABELS)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteAccount(account.id)}
                loading={deletingId === account.id}
                aria-label="Remove bank account"
              >
                {deletingId !== account.id && <Trash2 className="size-3.5" />}
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {!showForm && (
        <div className="flex items-center gap-3">
          <Button
            variant={existingAccounts.length > 0 ? "outline" : "primary"}
            onClick={() => {
              setError(null);
              setShowForm(true);
            }}
          >
            <Plus className="size-4" />
            Add new account
          </Button>
          {existingAccounts.length > 0 && (
            <Button onClick={onNext}>Continue to offramp</Button>
          )}
        </div>
      )}

      {showForm && (
        <div className="space-y-5 rounded-xl border border-border bg-background-hover p-4">
          <div>
            <Label htmlFor="bank-account-type">Account type</Label>
            <Select
              id="bank-account-type"
              value={accountType}
              onChange={(e) => changeAccountType(e.target.value as AccountType)}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ACCOUNT_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(form).map(([key, value]) => {
              // Currency is pinned by account type for every type but SWIFT, so
              // show it as a readout rather than a choice that would 400.
              if (key === "currency" && CURRENCY_BY_TYPE[accountType]) {
                return (
                  <div key={key}>
                    <Label>Currency</Label>
                    <div className="rounded-xl border border-border bg-background-elevated px-3 py-2 text-sm text-text-muted">
                      {value.toUpperCase()}
                    </div>
                  </div>
                );
              }
              return field(key, value, (next) =>
                setForm((prev) => ({ ...prev, [key]: next })),
              );
            })}
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text">
              <Landmark className="size-4 text-text-muted" />
              Account details
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ACCOUNT_TYPE_FIELDS[accountType].map((key) =>
                field(key, accountFields[key] ?? "", (next) =>
                  setAccountFields((prev) => ({ ...prev, [key]: next })),
                ),
              )}
            </div>
            {accountType === "pix" && (
              <p className="mt-2 text-xs text-text-muted">
                Enter either a Pix key or a BR code, not both.
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-text">
              Account holder address
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(address).map(([key, value]) =>
                field(key, value, (next) =>
                  setAddress((prev) => ({ ...prev, [key]: next })),
                ),
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={createAccount} loading={loading}>
              {loading ? "Adding account…" : "Add bank account"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

