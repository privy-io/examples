import { RequestHandler } from "express";
import { privy } from "../../lib/privy";
import { TREASURY_QUORUM_PUBLIC_KEY } from "../../lib/config";

/**
 * Creates a wallet owned by a 2-of-2 key quorum,composed of the public key provided by the caller
 * and the treasury public key.
 * Because the quorum is 2-of-2, this means both the caller and the treasury must be in-the-loop to
 * authorize all actions on the wallet.
 *
 * @example
 * curl -X POST http://localhost:3300/key_quorums/create_wallet \
 * -H "Content-Type: application/json" \
 * -d '{"public_key": "0x036CbD53842c5426634e7929541eC2318f3dCF7e", "alias": "Alice"}'
 */
export const createWallet: RequestHandler = async (req, res) => {
  const { public_key, alias } = req.body;

  const keyQuorum = await privy.keyQuorums().create({
    public_keys: [public_key, TREASURY_QUORUM_PUBLIC_KEY],
    authorization_threshold: 2,
    display_name: `Treasury 2-of-2 Key Quorum with ${alias}`,
  });

  const wallet = await privy.wallets().create({
    chain_type: "ethereum",
    owner_id: keyQuorum.id,
  });

  res.status(200).json({
    wallet_id: wallet.id,
  });
};
