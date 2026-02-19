import { NextRequest, NextResponse } from 'next/server';
import { encodePaymentRequired } from '@/lib/x402-utils';
import { verifyAndSettlePayment, createStripeDepositAddress } from '@/lib/x402-server';
import { getNetworkConfig } from '@/lib/network';

/**
 * Sweater Purchase API - x402 enabled with Stripe settlement
 * Cost: $5.00 (500 cents = 5000000 base units for USDC with 6 decimals)
 */
export async function GET(request: NextRequest) {
  const paymentSignature = request.headers.get('payment-signature') || request.headers.get('x-payment');

  // Build resource URL
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const resourceUrl = `${protocol}://${host}/api/mock-services/sweater`;

  const amountCents = 500; // $5.00
  const amountBaseUnits = '5000000'; // USDC has 6 decimals
  const config = getNetworkConfig();

  // If no payment header, return 402 with payment requirements
  if (!paymentSignature) {
    try {
      // Create a Stripe PaymentIntent to get a unique deposit address
      const { payTo } = await createStripeDepositAddress(
        amountCents,
        'Sweater Purchase - x402 payment'
      );

      const paymentRequirements = {
        scheme: 'exact' as const,
        network: config.chainId as 'eip155:84532' | 'eip155:8453',
        amount: amountBaseUnits,
        resource: resourceUrl,
        description: 'Purchase a cozy wool sweater',
        mimeType: 'application/json',
        payTo,
        maxTimeoutSeconds: 120,
        asset: config.usdcContract,
        extra: {
          name: config.usdcDomainName,
          version: config.usdcDomainVersion,
        },
      };

      const paymentRequired = {
        x402Version: 2,
        accepts: [paymentRequirements],
      };

      return new NextResponse(null, {
        status: 402,
        headers: {
          'PAYMENT-REQUIRED': encodePaymentRequired(paymentRequired),
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create payment address' },
        { status: 500 }
      );
    }
  }

  // Verify and settle the payment
  const settlement = await verifyAndSettlePayment(paymentSignature, {
    scheme: 'exact',
    network: config.chainId,
    amount: amountBaseUnits,
    resource: resourceUrl,
    payTo: '', // Will be extracted from payment payload
  });

  if (!settlement.valid) {
    return NextResponse.json(
      { error: settlement.error || 'Payment verification failed' },
      { status: 402 }
    );
  }

  // Return the paid content with transaction hash
  return NextResponse.json({
    success: true,
    service: 'sweater',
    data: {
      orderId: `ORD-${Date.now()}`,
      product: 'Cozy Wool Sweater',
      size: 'Medium',
      color: 'Forest Green',
      price: '$5.00',
      estimatedDelivery: '3-5 business days',
      shippingMethod: 'Standard',
    },
    payment: {
      amount: '$5.00',
      status: 'settled',
      txHash: settlement.txHash,
    },
  });
}
