import { PrivyClient } from "@privy-io/node";
import { NextResponse } from "next/server";

/**
 * Earn auto-deposit for a production card's funding wallet, built on a Privy wallet automation:
 * whenever OUSD lands in the wallet on Tempo, Privy deposits the wallet's OUSD balance into the app's
 * Earn vault, and the card then spends from Earn.
 *
 * This lives in a route handler because creating and attaching automations needs the Privy app
 * secret. The user owns their embedded wallet, so attaching also needs their authorization
 * signature, which only the browser can produce. The flow takes two requests:
 *
 * 1. `POST {walletId}` returns the attach request for the browser to sign with
 *    `useAuthorizationSignature`.
 * 2. `POST {walletId, automationId, requestExpiry, signature}` sends that request to Privy.
 *
 * @see https://docs.privy.io/wallets/automations/earn-deposits
 */
const PRIVY_API = "https://api.privy.io/v1";
const AUTOMATION_NAME = "Deposit Tempo OUSD into Earn";
const TEMPO_CAIP2 = "eip155:4217";
const TEMPO_OUSD = "0x20c0000000000000000000006a37DA5C996874BE";
/** How long the browser has to sign the attach request. */
const SIGNATURE_WINDOW_MS = 5 * 60 * 1000;

type Config = { appId: string; appSecret: string; vaultId: string };

type Automation = {
  id: string;
  status: "enabled" | "disabled";
  config: { action: { type: string; vault_id?: string } };
};

const config: Config | null = (() => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  const vaultId = process.env.PRIVY_EARN_VAULT_ID;
  if (!appId || !appSecret || !vaultId) return null;
  return { appId, appSecret, vaultId };
})();

/** One client per server, so token verification reuses its cached verification key. */
const privy = config
  ? new PrivyClient({ appId: config.appId, appSecret: config.appSecret })
  : null;

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status });

/**
 * Calls the Privy REST API with the app secret. `@privy-io/node` 0.38 does not expose wallet
 * automations on `PrivyClient`, so the automation endpoints are called directly.
 */
const privyFetch = async <T>(
  { appId, appSecret }: Config,
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(`${PRIVY_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${btoa(`${appId}:${appSecret}`)}`,
      "privy-app-id": appId,
      "Content-Type": "application/json",
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      body?.error ?? `Privy API request failed (${response.status})`,
    );
  }
  return body as T;
};

/** Every automation for the app, or only those attached to `walletId`. */
const listAutomations = async (config: Config, walletId?: string) => {
  const automations: Automation[] = [];
  let cursor: string | null = null;
  do {
    const query = new URLSearchParams();
    if (walletId) query.set("wallet_id", walletId);
    if (cursor) query.set("cursor", cursor);
    const page: { data: Automation[]; next_cursor: string | null } =
      await privyFetch(config, `/wallet_automations?${query}`);
    automations.push(...page.data);
    cursor = page.next_cursor;
  } while (cursor);
  return automations;
};

const isEarnAutomation = (automation: Automation, vaultId: string) =>
  automation.status === "enabled" &&
  automation.config.action.type === "earn_deposit" &&
  automation.config.action.vault_id === vaultId;

/**
 * One automation per vault is shared by every wallet, so reuse it once it exists. Two first-time
 * requests at once can each create one; either works, and later requests reuse the first found.
 */
const findOrCreateEarnAutomation = async (config: Config) => {
  const existing = (await listAutomations(config)).find((automation) =>
    isEarnAutomation(automation, config.vaultId),
  );
  if (existing) return existing.id;

  const created: Automation = await privyFetch(config, "/wallet_automations", {
    method: "POST",
    body: JSON.stringify({
      name: AUTOMATION_NAME,
      owner_id: null,
      config: {
        // The trigger must match the vault's underlying asset exactly: OUSD on Tempo mainnet.
        trigger: {
          type: "deposit",
          assets: {
            mode: "include",
            values: [{ asset: "ousd", chain: "tempo" }],
          },
        },
        action: { type: "earn_deposit", vault_id: config.vaultId },
      },
    }),
  });
  return created.id;
};

/**
 * Checks the caller's access token and that `walletId` is one of their own wallets. Without the
 * ownership check, a signed-in user could attach the automation to a wallet that has no owner, such
 * as an app-controlled server wallet, since Privy only requires the app secret for those.
 */
const authorize = async (request: Request, walletId: unknown) => {
  if (!config || !privy) {
    return {
      error: json(
        {
          error:
            "Earn auto-deposit is not configured. Set PRIVY_APP_SECRET and PRIVY_EARN_VAULT_ID. See the README.",
        },
        503,
      ),
    } as const;
  }

  const accessToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer /, "");
  if (!accessToken) {
    return { error: json({ error: "Missing access token" }, 401) } as const;
  }
  if (typeof walletId !== "string" || !walletId) {
    return { error: json({ error: "walletId is required" }, 400) } as const;
  }

  let userId: string;
  try {
    ({ user_id: userId } = await privy
      .utils()
      .auth()
      .verifyAccessToken(accessToken));
  } catch {
    return { error: json({ error: "Invalid access token" }, 401) } as const;
  }

  const user = await privy.users()._get(userId);
  const ownsWallet = user.linked_accounts.some(
    (account) =>
      account.type === "wallet" && "id" in account && account.id === walletId,
  );
  if (!ownsWallet) {
    return { error: json({ error: "Not your wallet" }, 403) } as const;
  }

  return { config, privy, walletId } as const;
};

/** Reports whether the wallet already has the Earn auto-deposit automation attached. */
export async function GET(request: Request) {
  try {
    const auth = await authorize(
      request,
      new URL(request.url).searchParams.get("walletId"),
    );
    if ("error" in auth) return auth.error;

    const attached = await listAutomations(auth.config, auth.walletId);
    return json({
      enabled: attached.some((automation) =>
        isEarnAutomation(automation, auth.config.vaultId),
      ),
    });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Lookup failed" },
      502,
    );
  }
}

/** Prepares the attach request for the browser to sign, or sends the signed request. */
export async function POST(request: Request) {
  let payload: {
    walletId?: unknown;
    automationId?: unknown;
    requestExpiry?: unknown;
    signature?: unknown;
  };
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  try {
    const auth = await authorize(request, payload.walletId);
    if ("error" in auth) return auth.error;
    const { config, privy, walletId } = auth;

    const { automationId, requestExpiry, signature } = payload;

    // Step 1: hand back the exact request Privy will verify, for the user to sign.
    if (signature === undefined) {
      const id = await findOrCreateEarnAutomation(config);
      const expiry = Date.now() + SIGNATURE_WINDOW_MS;
      return json({
        automationId: id,
        requestExpiry: expiry,
        input: {
          version: 1,
          method: "POST",
          url: `${PRIVY_API}/wallets/${walletId}/automations/attach`,
          body: { automation_ids: [id] },
          headers: {
            "privy-app-id": config.appId,
            "privy-request-expiry": String(expiry),
          },
        },
      });
    }

    if (
      typeof automationId !== "string" ||
      typeof requestExpiry !== "number" ||
      typeof signature !== "string"
    ) {
      return json(
        { error: "automationId, requestExpiry, and signature are required" },
        400,
      );
    }

    // Only ever attach this vault's automation, whatever the browser sends back.
    const automation: Automation = await privyFetch(
      config,
      `/wallet_automations/${encodeURIComponent(automationId)}`,
    );
    if (!isEarnAutomation(automation, config.vaultId)) {
      return json({ error: "Not the Earn auto-deposit automation" }, 400);
    }

    // Step 2: the SDK rebuilds the same request from these fields, so the signature verifies.
    await privy.wallets().attachAutomations(walletId, {
      automation_ids: [automationId],
      request_expiry: requestExpiry,
      authorization_context: { signatures: [signature] },
    });

    // The automation only reacts to new deposits, so check once for OUSD already in the wallet.
    // Best effort: attaching succeeded even if this fails, and the next deposit sweeps it anyway.
    await privyFetch(config, "/wallet_automations/reindex", {
      method: "POST",
      body: JSON.stringify({
        wallet_id: walletId,
        caip2: TEMPO_CAIP2,
        asset_address: TEMPO_OUSD,
      }),
    }).catch((error) =>
      console.error("Earn auto-deposit: reindex failed", error),
    );

    return json({ enabled: true });
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Attach failed" },
      502,
    );
  }
}
