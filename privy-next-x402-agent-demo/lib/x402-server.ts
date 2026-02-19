import Stripe from 'stripe';
import { x402ResourceServer, HTTPFacilitatorClient } from '@x402/core/server';
import { registerExactEvmScheme } from '@x402/evm/exact/server';
import { getNetworkConfig } from './network';
import { verifyAndSettleDirect, type PaymentRequirements } from './x402-settlement';

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover' as Stripe.LatestApiVersion,
  appInfo: {
    name: 'x402-agent-demo',
    version: '1.0.0',
  },
});

// Initialize x402 facilitator client
const facilitatorClient = new HTTPFacilitatorClient({
  url: process.env.FACILITATOR_URL || 'https://x402.org/facilitator',
});

// Create and configure resource server
const resourceServer = new x402ResourceServer(facilitatorClient);
registerExactEvmScheme(resourceServer);

// Initialize the resource server (fetch supported kinds from facilitator)
let initialized = false;
let initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  if (!initPromise) {
    initPromise = resourceServer.initialize().then(() => {
      initialized = true;
    });
  }
  return initPromise;
}

/**
 * Create a Stripe PaymentIntent and get a crypto deposit address
 * This address is where the x402 payment will be sent
 */
export async function createStripeDepositAddress(
  amountCents: number,
  description: string
): Promise<{ payTo: string; paymentIntentId: string }> {
  // Use type assertion for crypto payment options (newer Stripe API)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    payment_method_types: ['crypto'],
    payment_method_data: {
      type: 'crypto',
    },
    payment_method_options: {
      crypto: {
        mode: 'custom',
      },
    } as Stripe.PaymentIntentCreateParams['payment_method_options'],
    description,
    confirm: true,
  });

  // Extract the deposit address for Base network
  const depositAddresses = (paymentIntent.next_action as Stripe.PaymentIntent.NextAction & {
    crypto_collect_deposit_details?: {
      deposit_addresses?: Record<string, { address: string }>;
    };
  })?.crypto_collect_deposit_details?.deposit_addresses;

  const baseAddress = depositAddresses?.['base']?.address;

  if (!baseAddress) {
    throw new Error('Failed to get Stripe deposit address for Base network');
  }

  return {
    payTo: baseAddress,
    paymentIntentId: paymentIntent.id,
  };
}

export { resourceServer, stripe, ensureInitialized };

/**
 * Verify a payment signature and settle the transaction through the facilitator
 * Returns the settlement result including transaction hash
 */
async function verifyAndSettleViaFacilitator(
  paymentSignature: string
): Promise<{ valid: boolean; txHash?: string; error?: string }> {
  try {
    // Ensure resource server is initialized
    await ensureInitialized();

    // Parse the payment payload from the base64 signature header
    let paymentPayload;
    try {
      paymentPayload = JSON.parse(
        Buffer.from(paymentSignature, 'base64').toString('utf8')
      );
    } catch {
      // Maybe it's not base64 encoded
      paymentPayload = JSON.parse(paymentSignature);
    }

    // Use the accepted requirements from the payment payload - this is what the client signed
    // The payload.accepted contains the complete requirements including extra fields for EIP-712 domain
    const requirements = paymentPayload.accepted as {
      scheme: string;
      network: `${string}:${string}`;
      amount: string;
      payTo: string;
      asset: string;
      maxTimeoutSeconds: number;
      extra: Record<string, unknown>;
    };

    // Verify the payment through the facilitator
    const verifyResult = await resourceServer.verifyPayment(paymentPayload, requirements);

    if (!verifyResult.isValid) {
      return {
        valid: false,
        error: verifyResult.invalidReason || 'Payment verification failed',
      };
    }

    // Settle the payment to get the transaction hash
    const settleResult = await resourceServer.settlePayment(paymentPayload, requirements);

    return {
      valid: true,
      txHash: settleResult.transaction,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Payment verification failed',
    };
  }
}

/**
 * Verify and settle a payment using the appropriate method based on network mode.
 *
 * - Mainnet: Uses direct settlement (EIP-3009 on-chain, no facilitator)
 * - Testnet: Uses facilitator-based settlement
 *
 * @param paymentSignature - The X-PAYMENT header value
 * @param paymentRequirements - The payment requirements for validation
 * @returns Settlement result with transaction hash on success
 */
export async function verifyAndSettlePayment(
  paymentSignature: string,
  paymentRequirements: PaymentRequirements
): Promise<{ valid: boolean; txHash?: string; error?: string }> {
  const config = getNetworkConfig();

  if (config.useDirectSettlement) {
    return verifyAndSettleDirect(paymentSignature, paymentRequirements);
  } else {
    return verifyAndSettleViaFacilitator(paymentSignature);
  }
}
