import type { NextApiRequest, NextApiResponse } from "next";

import { PrivyClient } from "@privy-io/server-auth";
import crypto from "crypto";

export type APIError = {
  error: string;
  cause?: string;
};

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const PRIVY_AUTH_URL_OVERRIDE = process.env.NEXT_PUBLIC_PRIVY_AUTH_URL;
const MOONPAY_BASE_URL = process.env.MOONPAY_BASE_URL;
const MOONPAY_SECRET_KEY = crypto.createSecretKey(
  process.env.MOONPAY_SECRET_KEY as string,
  "utf-8"
);

const client = new PrivyClient(
  PRIVY_APP_ID as string,
  PRIVY_APP_SECRET as string,
  {
    apiURL: PRIVY_AUTH_URL_OVERRIDE,
  }
);

// POST /api/onramp will return an onramp URL for the current user
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url: string } | APIError>
) {
  if (req.method !== "POST") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  // Authenticate user
  const header = req.headers.authorization;
  if (typeof header !== "string") {
    return res.status(401).json({ error: "Missing auth token." });
  }
  const authToken = header.replace(/^Bearer /, "");
  try {
    await client.verifyAuthToken(authToken);
  } catch {
    return res.status(401).json({ error: "Invalid auth token." });
  }

  // Get request parameters
  const { address, email, redirectUrl } = req.body;
  if (typeof address !== "string")
    return res.status(412).json({ error: "Invalid wallet address." });
  if (typeof redirectUrl !== "string")
    return res
      .status(412)
      .json({ error: "Client must provide a redirect URL" });

  // Construct the onramp URL, prefilling in details about the flow
  // https://docs.moonpay.com/moonpay/implementation-guide/on-ramp/browser-integration/customize-the-widget
  let onrampUrl = new URL(MOONPAY_BASE_URL as string);
  // Specify the user's wallet address
  onrampUrl.searchParams.set("walletAddress", address);
  // Specify the redirect URL once the user has completed the Moonpay flow.
  // You only need to do this if you redirect the user away from your app to Moonpay.
  onrampUrl.searchParams.set("redirectURL", redirectUrl);
  // (Optional) If user has an email linked, specify the user's email to pre-fill for KYC
  if (typeof email === "string") onrampUrl.searchParams.set("email", email);
  // (Optional) Specify the token to purchase
  onrampUrl.searchParams.set("currencyCode", "eth");
  // (Optional) Specify a light/dark theme
  onrampUrl.searchParams.set("theme", "light");

  // (Required) Sign the onramp URL with your Moonpay secret key
  // https://docs.moonpay.com/moonpay/implementation-guide/on-ramp/web-sdk-integration/sign-the-url-server-side
  const urlSignature = crypto
    .createHmac("sha256", MOONPAY_SECRET_KEY)
    .update(onrampUrl.search)
    .digest("base64");
  onrampUrl.searchParams.set("signature", urlSignature);

  // Return the onramp URL to the client
  return res.status(200).json({ url: onrampUrl.toString() });
}
