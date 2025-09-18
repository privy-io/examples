import { PrivyClient } from "@privy-io/node";
import { PRIVY_APP_ID, PRIVY_APP_SECRET } from "./config";

export const privy = new PrivyClient({
  appId: PRIVY_APP_ID,
  appSecret: PRIVY_APP_SECRET,
});
