import { NextResponse } from "next/server";

/**
 * Simulates a card purchase with Stripe Issuing's test helpers.
 *
 * This lives in a route handler because it needs a Stripe **secret** key. Never move it to a client
 * component or a `NEXT_PUBLIC_` variable: anyone holding this key can create spend on the account's
 * cards.
 *
 * @see https://docs.stripe.com/api/issuing/authorizations/test-helpers-create
 */
const STRIPE_API = "https://api.stripe.com/v1";

/** Cap the simulated amount so a stray request can't invent a huge authorization. In cents. */
const MAX_AMOUNT = 100_00;

const form = (fields: Record<string, string>) =>
  new URLSearchParams(fields).toString();

const stripePost = async (
  path: string,
  secretKey: string,
  fields: Record<string, string> = {},
) => {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form(fields),
  });

  const body = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, body };
};

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not set. See the README." },
      { status: 500 },
    );
  }

  // Test helpers only exist in test mode, and this endpoint exists to create spend, so refuse
  // anything that could touch real money rather than relying on Stripe to reject it.
  if (!/^(sk|rk)_test_/.test(secretKey)) {
    return NextResponse.json(
      { error: "Refusing to run: STRIPE_SECRET_KEY is not a test-mode key." },
      { status: 400 },
    );
  }

  let payload: { cardId?: unknown; amount?: unknown; merchantName?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { cardId, amount, merchantName } = payload;

  // The Stripe Issuing card id, not the Privy card id.
  if (typeof cardId !== "string" || !cardId.startsWith("ic_")) {
    return NextResponse.json(
      { error: "cardId must be a Stripe Issuing card id (ic_…)" },
      { status: 400 },
    );
  }

  if (
    typeof amount !== "number" ||
    !Number.isInteger(amount) ||
    amount <= 0 ||
    amount > MAX_AMOUNT
  ) {
    return NextResponse.json(
      { error: `amount must be an integer in cents, 1–${MAX_AMOUNT}` },
      { status: 400 },
    );
  }

  const authorization = await stripePost(
    "/test_helpers/issuing/authorizations",
    secretKey,
    {
      card: cardId,
      amount: String(amount),
      currency: "usd",
      "merchant_data[name]":
        typeof merchantName === "string" && merchantName
          ? merchantName
          : "Privy Test Merchant",
    },
  );

  if (!authorization.ok) {
    return NextResponse.json(
      {
        error: "Stripe rejected the authorization",
        stripe: authorization.body?.error ?? authorization.body,
      },
      { status: authorization.status },
    );
  }

  const authorizationId: string = authorization.body.id;
  const approved: boolean = authorization.body.approved === true;

  // Capturing a declined authorization is an error, so report the decline instead. It still shows
  // up in the transaction list, which is often the more interesting row to look at.
  if (!approved) {
    return NextResponse.json({
      authorizationId,
      approved: false,
      captured: false,
      status: authorization.body.status,
      declineReason: authorization.body.request_history?.[0]?.reason ?? null,
    });
  }

  const capture = await stripePost(
    `/test_helpers/issuing/authorizations/${encodeURIComponent(authorizationId)}/capture`,
    secretKey,
  );

  if (!capture.ok) {
    return NextResponse.json(
      {
        authorizationId,
        approved: true,
        captured: false,
        error: "Authorization succeeded but capture failed",
        stripe: capture.body?.error ?? capture.body,
      },
      { status: capture.status },
    );
  }

  return NextResponse.json({
    authorizationId,
    approved: true,
    captured: true,
    status: capture.body.status,
  });
}
