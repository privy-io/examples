import { RequestHandler } from "express";
import { baseSepolia } from "viem/chains";
import { encodeFunctionData, erc20Abi, Hex } from "viem";
import { privy } from "../../lib/privy";
import { BASE_USDC_ADDRESS } from "../../lib/constants";
import { TREASURY_WALLET_ADDRESS } from "../../lib/config";

/**
 * You can use Privy to send transactions from your server, in this case for
 * a wallet that is owned by a user.
 * The user's JWT is provided in the authorization header, and used in the authorization_context
 * to authorize the transaction.
 * @see https://docs.privy.io/controls/authorization-keys/owners/configuration/user/server-transactions
 *
 * @example
 * curl -X POST http://localhost:3300/transactions/pay_with_usdc \
 * -H "Content-Type: application/json" \
 * -H "Authorization: Bearer <token>" \
 * -d '{"wallet_id": "wmseriq8kzkxf6sdwj35uxip"}'
 */
export const payWithUSDC: RequestHandler = async (req, res) => {
  const { wallet_id } = req.body;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userJwt = authHeader.replace("Bearer ", "");

  // See https://docs.privy.io/recipes/send-usdc for more details
  const encodedData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [TREASURY_WALLET_ADDRESS as Hex, 50_000n], // 0.05 USDC
  });
  const sentTransaction = await privy
    .wallets()
    .ethereum()
    .sendTransaction(wallet_id, {
      caip2: `eip155:${baseSepolia.id}`,
      params: {
        transaction: {
          chain_id: baseSepolia.id,
          to: BASE_USDC_ADDRESS,
          data: encodedData,
        },
      },
      authorization_context: {
        user_jwts: [userJwt],
      },
    });
  res.status(200).json({ hash: sentTransaction.hash });
};
