/**
 * x402 protocol utilities
 */

/**
 * Encode payment requirements as base64 for PAYMENT-REQUIRED header (x402 v2)
 */
export function encodePaymentRequired(paymentRequired: object): string {
  const json = JSON.stringify(paymentRequired);
  return Buffer.from(json, 'utf8').toString('base64');
}
