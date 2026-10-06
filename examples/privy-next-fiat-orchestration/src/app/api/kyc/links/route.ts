import { NextResponse } from "next/server";
import { withAuth } from "@/lib/server-auth";
import { privyApiCall } from "@/lib/privy-client";
import { ENVIRONMENT, PROVIDER } from "@/lib/kyx";

// Start hosted KYC and return the current status snapshot.
export const POST = withAuth(async (req, userId) => {
  const body = await req.json().catch(() => ({}));
  const { email, endorsements, redirect_uri, client_agreement_id } = body as {
    email?: string;
    endorsements?: string[];
    redirect_uri?: string;
    client_agreement_id?: string;
  };

  const result = await privyApiCall(
    "POST",
    `/v1/users/${userId}/kyc/links`,
    {
      provider: PROVIDER,
      environment: ENVIRONMENT,
      ...(email ? { email } : {}),
      ...(endorsements ? { endorsements } : {}),
      ...(redirect_uri ? { redirect_uri } : {}),
      ...(client_agreement_id ? { client_agreement_id } : {}),
    },
  );

  return NextResponse.json(result);
});
