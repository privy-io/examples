import { NextRequest, NextResponse } from 'next/server';
import { executeMppRequest } from '@/lib/mpp-client';
import { getNetworkConfig } from '@/lib/network';

// Action costs in cents (for display - actual cost comes from MPP service)
const ACTION_COSTS: Record<string, number> = {
  weather: 10, // $0.10
};

// Build the base URL for MPP services
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletId, walletAddress, action } = body as {
      walletId: string;
      walletAddress: string;
      action: 'weather';
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

    // Execute MPP request - handles 402 payment flow automatically
    const response = await executeMppRequest(
      walletId,
      walletAddress as `0x${string}`,
      serviceUrl
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let errorMsg = `Service returned ${response.status}`;
      try {
        const errorData = JSON.parse(text);
        errorMsg = errorData.error || errorMsg;
      } catch {
        if (text) errorMsg += `: ${text.slice(0, 500)}`;
      }
      // Log full response details for debugging
      console.error(`MPP request failed:`, {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: text.slice(0, 1000),
      });
      throw new Error(errorMsg);
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
