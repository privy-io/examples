/**
 * Resolves which Privy environment the demo talks to.
 *
 * Set `PRIVY_ENV=staging` (with a staging app ID/secret) to point the demo at
 * Privy staging; it defaults to production. For non-standard setups (e.g. a
 * local API), `PRIVY_API_BASE` / `PRIVY_AUTH_BASE` override the derived hosts.
 */
export type PrivyEnv = "production" | "staging";

export const PRIVY_ENV: PrivyEnv =
  process.env.PRIVY_ENV === "staging" ? "staging" : "production";

const HOSTS: Record<PrivyEnv, { api: string; auth: string }> = {
  production: { api: "https://api.privy.io", auth: "https://auth.privy.io" },
  staging: {
    api: "https://api.staging.privy.io",
    auth: "https://auth.staging.privy.io",
  },
};

/** Base URL for Privy's server-to-server API (Basic auth with app secret). */
export const PRIVY_API_BASE =
  process.env.PRIVY_API_BASE || HOSTS[PRIVY_ENV].api;

/** Base URL for Privy's auth service — hosts the app's JWKS for token verification. */
export const PRIVY_AUTH_BASE =
  process.env.PRIVY_AUTH_BASE || HOSTS[PRIVY_ENV].auth;
