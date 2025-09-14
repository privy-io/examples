import { PrivyClient } from "@privy-io/server-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET as string;
const PRIVY_AUTH_URL = process.env.NEXT_PUBLIC_PRIVY_AUTH_URL as string;


export const privyServerClient = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET, {
    apiURL: PRIVY_AUTH_URL,
  });