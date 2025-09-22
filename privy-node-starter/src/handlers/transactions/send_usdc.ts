import { RequestHandler } from "express";
import { baseSepolia } from "viem/chains";
import { encodeFunctionData, erc20Abi, Hex } from "viem";
import { privy } from "../../lib/privy";
import { BASE_USDC_ADDRESS } from "../../lib/constants";
import {
  TREASURY_AUTHORIZATION_KEY,
  TREASURY_WALLET_ID,
} from "../../lib/config";

/**
 * You can use Privy to send transactions from your server, for any wallet regardless of if its
 * owned by an authorization key you have, or a User (in which case you need to provide a user JWT).
 * @see https://docs.privy.io/controls/authorization-keys/owners/configuration/user/server-transactions
 *
 * @example
 * curl -X POST http://localhost:3300/transactions/send_usdc \
 * -H "Content-Type: application/json" \
 * -d '{"recipient": "0xFE7EB87dddD8300F0bc52f23bEf41684123E313F"}'
 */
export const sendUSDC: RequestHandler = async (req, res) => {
  const { recipient } = req.body;

  // See https://docs.privy.io/recipes/send-usdc for more details
  const encodedData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [recipient as Hex, 1_000_000n], // 1 USDC
  });
  const sentTransaction = await privy
    .wallets()
    .ethereum()
    .sendTransaction(TREASURY_WALLET_ID, {
      caip2: `eip155:${baseSepolia.id}`,
      params: {
        transaction: {
          chain_id: baseSepolia.id,
          to: BASE_USDC_ADDRESS,
          data: encodedData,
        },
      },
      authorization_context: {
        authorization_private_keys: [TREASURY_AUTHORIZATION_KEY],
      },
    });
  res.status(200).json({ hash: sentTransaction.hash });
};
