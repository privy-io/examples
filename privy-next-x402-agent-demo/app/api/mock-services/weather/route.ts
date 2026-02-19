import { NextRequest, NextResponse } from 'next/server';
import { encodePaymentRequired } from '@/lib/x402-utils';
import { verifyAndSettlePayment, createStripeDepositAddress } from '@/lib/x402-server';
import { getNetworkConfig } from '@/lib/network';

/**
 * Weather API - x402 enabled with Stripe settlement
 * Cost: $0.10 (10 cents = 100000 base units for USDC with 6 decimals)
 */
export async function GET(request: NextRequest) {
  const paymentSignature = request.headers.get('payment-signature') || request.headers.get('x-payment');

  // Build resource URL
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const resourceUrl = `${protocol}://${host}/api/mock-services/weather`;

  const amountBaseUnits = '100000'; // $0.10 USDC (6 decimals)

  const config = getNetworkConfig();

  // If no payment header, return 402 with payment requirements
  if (!paymentSignature) {
    try {
      // Create a Stripe PaymentIntent to get a unique deposit address
      const { payTo } = await createStripeDepositAddress(
        10, // $0.10 in cents
        'Weather API - x402 payment'
      );

      const paymentRequirements = {
        scheme: 'exact' as const,
        network: config.chainId as 'eip155:84532' | 'eip155:8453',
        amount: amountBaseUnits,
        resource: resourceUrl,
        description: 'Get current weather data for your location',
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
    service: 'weather',
    data: {
      location: 'San Francisco, CA',
      temperature: 68,
      unit: 'fahrenheit',
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      windDirection: 'WSW',
      forecast: 'Clear skies expected this evening',
      lastUpdated: new Date().toISOString(),
    },
    payment: {
      amount: '$0.10',
      status: 'settled',
      txHash: settlement.txHash,
    },
  });
}
