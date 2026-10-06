import { NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { PRIVY_AUTH_BASE } from "./privy-env";

const JWKS_URL = `${PRIVY_AUTH_BASE}/api/v1/apps/${process.env.PRIVY_APP_ID}/jwks.json`;
const jwks = createRemoteJWKSet(new URL(JWKS_URL));

/**
 * Verifies a Privy access token and returns its user ID, or null if invalid.
 * Usable outside the route wrappers (e.g. the SSE endpoint, where the token
 * arrives as a query param because EventSource cannot set headers).
 */
export async function verifyAccessToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: "privy.io",
      audience: process.env.PRIVY_APP_ID!,
    });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

function unauthorized(message: string) {
  return NextResponse.json({ error: message }, { status: 401 });
}

type AuthResult = { ok: true; userId: string } | { ok: false; error: string };

async function userIdFromRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, error: "Missing authorization header" };
  }
  const userId = await verifyAccessToken(authHeader.slice(7));
  if (!userId) return { ok: false, error: "Invalid token" };
  return { ok: true, userId };
}

/** Wraps a static route handler, returning 401 when the token is missing/invalid. */
export function withAuth(
  handler: (req: Request, userId: string) => Promise<NextResponse>,
) {
  return async (req: Request) => {
    const result = await userIdFromRequest(req);
    if (!result.ok) return unauthorized(result.error);
    return handler(req, result.userId);
  };
}

/** Same as {@link withAuth}, for routes with dynamic segments. */
export function withAuthParams<P>(
  handler: (
    req: Request,
    userId: string,
    ctx: { params: Promise<P> },
  ) => Promise<NextResponse>,
) {
  return async (req: Request, ctx: { params: Promise<P> }) => {
    const result = await userIdFromRequest(req);
    if (!result.ok) return unauthorized(result.error);
    return handler(req, result.userId, ctx);
  };
}
