/**
 * The demo only runs against Bridge sandbox, so nobody moves real money or
 * enters real PII. The API routes enforce this server-side; the UI just shows
 * it.
 */
export const PROVIDER = "bridge" as const;

export type Environment = "sandbox" | "production";

export const ENVIRONMENT: Environment = "sandbox";
