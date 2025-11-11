import type { NextApiRequest, NextApiResponse } from "next";
import { exact } from "x402/schemes";
import { useFacilitator } from "x402/verify";

/**
 * x402-enabled weather API endpoint
 *
 * This endpoint demonstrates how to accept x402 payments for API access.
 * It requires payment of 0.001 USDC on Base Sepolia via Coinbase's facilitator.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const xPayment = req.headers["x-payment"] as string | undefined;

  const paymentRequirements = {
    scheme: "exact" as const,
    network: "base-sepolia" as const,
    maxAmountRequired: "1000", // 0.001 USDC (6 decimals)
    resource: `http://localhost:3200/api/weather`, // Full URL required by x402 spec
    description: "Weather API access",
    mimeType: "application/json",
    payTo:
      process.env.RECEIVING_WALLET_ADDRESS ||
      "0x7c19Ceb4c1f2adD71537366497EE32e166D6D3D7",
    maxTimeoutSeconds: 120,
    asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC on Base Sepolia
    extra: {
      name: "USDC",
      version: "2",
    },
  };

  // If no payment header, return 402 Payment Required
  if (!xPayment) {
    return res.status(402).json({
      x402Version: 1,
      accepts: [paymentRequirements],
    });
  }

  // Verify and settle payment with Coinbase facilitator
  try {
    const { verify, settle } = useFacilitator({
      url: "https://x402.org/facilitator",
    });
    const paymentPayload = exact.evm.decodePayment(xPayment);

    // Step 1: Verify payment
    const verifyResult = await verify(
      paymentPayload as any,
      paymentRequirements as any
    );

    if (!verifyResult.isValid) {
      return res.status(402).json({
        x402Version: 1,
        error: `Payment verification failed: ${verifyResult.invalidReason}`,
        accepts: [paymentRequirements],
      });
    }

    // Step 2: Settle payment onchain
    const settleResult = await settle(
      paymentPayload as any,
      paymentRequirements as any
    );

    if (!settleResult.success) {
      return res.status(500).json({
        error: `Settlement failed: ${
          settleResult.errorReason || "Unknown error"
        }`,
      });
    }

    // Step 3: Set payment receipt header
    res.setHeader(
      "X-PAYMENT-RESPONSE",
      Buffer.from(
        JSON.stringify({
          transaction: settleResult.transaction,
          network: settleResult.network,
          payer: settleResult.payer,
        })
      ).toString("base64")
    );

    // Step 4: Return weather data
    return res.status(200).json({
      report: {
        weather: "sunny",
        temperature: 72,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "Payment processing error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
