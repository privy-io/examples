import { RequestHandler } from "express";
import { privy } from "../../lib/privy";
import { ALLOWLIST_USDC_POLICY_ID, TREASURY_OWNER_ID } from "../../lib/config";

/**
 * Adds the treasury (server-side authorization key) as an additional signer to
 * the users wallet.
 * This will authorize the server to sign transactions on the users behalf (without them in the loop)
 * but only if the transaction matches the policy (in this case, the USDC policy).
 * @see https://docs.privy.io/wallets/using-wallets/session-signers/overview
 *
 * @example
 * curl -X POST http://localhost:3300/additional_signers/add_treasury \
 * -H "Content-Type: application/json" \
 * -H "Authorization: Bearer <token>" \
 * -d '{"wallet_id": "wmseriq8kzkxf6sdwj35uxip"}'
 */
export const addTreasury: RequestHandler = async (req, res) => {
  const { wallet_id } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userJwt = authHeader.replace("Bearer ", "");

  await privy.wallets().update(wallet_id, {
    additional_signers: [
      {
        signer_id: TREASURY_OWNER_ID,
        override_policy_ids: [ALLOWLIST_USDC_POLICY_ID],
      },
    ],
    authorization_context: { user_jwts: [userJwt] },
  });

  res.status(200).json({ success: true });
};
