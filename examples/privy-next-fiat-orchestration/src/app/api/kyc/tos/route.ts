import { NextResponse } from "next/server";
import { withAuth } from "@/lib/server-auth";
import { privyApiCall } from "@/lib/privy-client";
import { ENVIRONMENT, PROVIDER } from "@/lib/kyx";

// Generate a Terms of Service acceptance link.
export const POST = withAuth(async (req, userId) => {
  const body = await req.json().catch(() => ({}));
  const { email } = body as { email?: string };

  const result = await privyApiCall(
    "POST",
    `/v1/users/${userId}/kyc/tos`,
    { provider: PROVIDER, environment: ENVIRONMENT, ...(email ? { email } : {}) },
  );

  return NextResponse.json(result);
});
