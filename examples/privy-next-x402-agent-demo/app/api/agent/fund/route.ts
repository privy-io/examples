import { NextRequest, NextResponse } from 'next/server';
import { fundAgentWallet } from '@/lib/treasury';

const ALLOWED_AMOUNTS = [0.10, 0.50, 1]; // Allowed funding amounts in USD

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, amount } = body;

    // Validate inputs
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_AMOUNTS.includes(amount)) {
      return NextResponse.json(
        {
          success: false,
          error: `Amount must be one of: $${ALLOWED_AMOUNTS.join(', $')}`,
        },
        { status: 400 }
      );
    }

    // Fund the wallet from treasury
    const { hash } = await fundAgentWallet(
      walletAddress as `0x${string}`,
      amount
    );

    return NextResponse.json({
      success: true,
      transaction: {
        hash,
        amount,
        currency: 'USDC',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fund wallet',
      },
      { status: 500 }
    );
  }
}
