import { PrivyClient } from "@privy-io/node";
import { PRIVY_API_BASE } from "./privy-env";

export { PRIVY_API_BASE };

/**
 * Wallet and account IDs from the client are interpolated into Privy API paths
 * that are called with the app secret. A value like "../users?limit=100#"
 * would rewrite the path to any other Privy endpoint, so routes reject IDs
 * outside this pattern. It excludes "." as well as "/", "?", "#" and "%",
 * because URL parsing resolves a bare ".." segment even when encoded.
 */
export const PRIVY_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export const privyClient = new PrivyClient({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!,
  // Match the configured environment (staging/production).
  apiUrl: PRIVY_API_BASE,
  // Required to verify incoming webhook signatures (Privy delivers via Svix).
  webhookSigningSecret: process.env.PRIVY_WEBHOOK_SIGNING_SECRET,
});

interface ApiCallMeta {
  method: string;
  url: string;
  requestBody?: unknown;
  responseStatus: number;
  responseBody: unknown;
  durationMs: number;
}

interface ApiCallResult<T> {
  result: T;
  meta: ApiCallMeta;
}

export async function privyApiCall<T>(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<ApiCallResult<T>> {
  const url = `${PRIVY_API_BASE}${path}`;
  const credentials = Buffer.from(
    `${process.env.PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`,
  ).toString("base64");

  const headers: Record<string, string> = {
    Authorization: `Basic ${credentials}`,
    "privy-app-id": process.env.PRIVY_APP_ID!,
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  const start = performance.now();

  const response = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const durationMs = Math.round(performance.now() - start);
  const responseBody = await response.json();

  return {
    result: responseBody as T,
    meta: {
      method,
      url: path,
      ...(body ? { requestBody: body } : {}),
      responseStatus: response.status,
      responseBody,
      durationMs,
    },
  };
}
