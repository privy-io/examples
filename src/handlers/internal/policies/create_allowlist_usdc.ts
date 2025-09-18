import { RequestHandler } from "express";
import { privy } from "../../../lib/privy";
import { BASE_USDC_ADDRESS } from "../../../lib/constants";
import { TREASURY_OWNER_ID } from "../../../lib/config";

/**
 * Create a policy that allows only transactions to the USDC contract.
 * This means a wallet with this policy can only operate with USDC.
 * @see https://docs.privy.io/controls/policies/example-policies/ethereum#allow-list-a-specific-smart-contract
 *
 * @example
 * curl -X POST http://localhost:3300/internal/policies/create_allowlist_usdc
 */
export const createAllowlistUsdc: RequestHandler = async (req, res) => {
  const policy = await privy.policies().create({
    name: "Allow list certain smart contracts",
    version: "1.0",
    chain_type: "ethereum",
    rules: [
      {
        name: "Allow list USDC",
        method: "eth_sendTransaction",
        action: "ALLOW",
        conditions: [
          {
            field_source: "ethereum_transaction",
            field: "to",
            operator: "eq",
            value: BASE_USDC_ADDRESS,
          },
        ],
      },
    ],
    owner_id: TREASURY_OWNER_ID,
  });
  res.status(200).json({ policy_id: policy.id, policy_name: policy.name });
};
