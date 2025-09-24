import type { NextApiRequest, NextApiResponse } from "next";

import { PrivyClient } from "@privy-io/server-auth";

export type APIError = {
  error: string;
  cause?: string;
};

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
const PRIVY_AUTH_URL_OVERRIDE = process.env.NEXT_PUBLIC_PRIVY_AUTH_URL;
const client = new PrivyClient(
  PRIVY_APP_ID as string,
  PRIVY_APP_SECRET as string,
  {
    apiURL: PRIVY_AUTH_URL_OVERRIDE,
  }
);

// DELETE /api/me will delete the user from this app
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<null | APIError>
) {
  if (req.method !== "DELETE") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const header = req.headers.authorization;
  if (typeof header !== "string") {
    return res.status(401).json({ error: "Missing auth token." });
  }
  const authToken = header.replace(/^Bearer /, "");

  let verifiedClaims;
  try {
    verifiedClaims = await client.verifyAuthToken(authToken);
  } catch {
    return res.status(401).json({ error: "Invalid auth token." });
  }

  try {
    await client.deleteUser(verifiedClaims.userId);
  } catch (error) {
    console.error(error);
    // TODO: Improve server-auth errors to return a nicer 404 if the user does not exist.
    return res.status(500).json({ error: "Unable to delete user." });
  }
  return res.status(204).end();
}
