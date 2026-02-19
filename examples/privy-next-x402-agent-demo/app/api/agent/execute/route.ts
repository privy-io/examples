import { NextRequest, NextResponse } from 'next/server';
import { executeX402Request } from '@/lib/x402-client';
import { getNetworkConfig } from '@/lib/network';

// Action costs in cents (for display - actual cost comes from x402 service)
const ACTION_COSTS: Record<string, number> = {
  weather: 10, // $0.10
  sweater: 500, // $5.00
};

// Build the base URL for x402 services
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

// Check if an error is a Privy policy rejection
function isPolicyRejectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('policy') ||
      message.includes('denied') ||
      message.includes('rejected') ||
      message.includes('not allowed') ||
      message.includes('exceeds')
    );
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletId, walletAddress, action } = body as {
      walletId: string;
      walletAddress: string;
      action: 'weather' | 'sweater';
    };

    // Validate inputs
    if (!walletId || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet ID and address are required' },
        { status: 400 }
      );
    }

    if (!action || !ACTION_COSTS[action]) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    const costCents = ACTION_COSTS[action];
    const baseUrl = getBaseUrl(request);
    const serviceUrl = `${baseUrl}/api/mock-services/${action}`;

    try {
      // Execute x402 request - Privy enforces spending policy
      const response = await executeX402Request(
        walletId,
        walletAddress as `0x${string}`,
        serviceUrl
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Service returned ${response.status}`);
      }

      const responseData = await response.json();
      const networkConfig = getNetworkConfig();
      return NextResponse.json({
        success: true,
        action,
        cost: costCents,
        walletAddress,
        explorerUrl: networkConfig.explorerUrl,
        result: {
          service: action,
          data: responseData.data || responseData,
          payment: responseData.payment || {
            amount: `$${(costCents / 100).toFixed(2)}`,
            status: 'completed',
          },
        },
      });
    } catch (x402Error) {
      // Privy policy rejection
      if (isPolicyRejectionError(x402Error)) {
        return NextResponse.json({
          success: false,
          error: `Privy rejected the signing request. Transaction exceeds your spending policy limit.`,
          policyRejection: true,
          action,
          cost: costCents,
        });
      }

      throw x402Error;
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        action: 'unknown',
        cost: 0,
      },
      { status: 500 }
    );
  }
}
