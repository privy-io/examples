import { NextRequest, NextResponse } from 'next/server';
import { updateSpendingPolicy } from '@/lib/privy';

/**
 * Update an agent's spending policy with a new transaction limit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { policyId, maxPerTransaction } = body as {
      policyId: string;
      maxPerTransaction: number; // in cents
    };

    // Validate inputs
    if (!policyId) {
      return NextResponse.json(
        { success: false, error: 'Policy ID is required' },
        { status: 400 }
      );
    }

    if (typeof maxPerTransaction !== 'number' || maxPerTransaction <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid maxPerTransaction value' },
        { status: 400 }
      );
    }

    // Update the Privy policy with the new limit
    await updateSpendingPolicy(policyId, maxPerTransaction);

    return NextResponse.json({
      success: true,
      policyId,
      maxPerTransaction,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update policy',
      },
      { status: 500 }
    );
  }
}
