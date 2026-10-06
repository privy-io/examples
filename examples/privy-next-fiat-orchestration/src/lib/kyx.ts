/**
 * The KYX API models the provider and its environment as separate fields.
 * Today the only KYC/KYB provider is Bridge; sandbox vs. production is the
 * `environment`.
 */
export const PROVIDER = "bridge" as const;

export type Environment = "sandbox" | "production";

/** Full KYC/KYB status snapshot returned by the KYX endpoints. */
export interface KyxStatusResponse {
  provider: string;
  environment: Environment;
  status: string;
  tos: { status: string; link?: string };
  kyc: { status: string; link?: string; rejection_reasons?: string[] };
  endorsements: Array<{
    name: string;
    status: string;
    missing: string[] | null;
  }>;
  capabilities: {
    payin_crypto: string;
    payout_crypto: string;
    payin_fiat: string;
    payout_fiat: string;
  };
  requirements_due: string[];
  future_requirements_due: string[];
}

/**
 * The demo is public, so every route pins the environment to sandbox and
 * ignores whatever the client sends. Sandbox never moves real money or
 * collects real PII.
 */
export const ENVIRONMENT: Environment = "sandbox";
