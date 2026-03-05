import { NextRequest, NextResponse } from 'next/server';
import { PRIVY_API_URL } from '@/lib/constants';
import { upsertTransaction } from '@/lib/transaction-store';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!;

// The claim endpoint returns a broader set of transaction statuses than
// deposit/withdraw. Normalize them to the three values used by deposit and withdraw.
function normalizeClaimStatus(status: string): 'pending' | 'confirmed' | 'failed' {
  switch (status) {
    case 'pending':
    case 'broadcasted':
      return 'pending';
    case 'confirmed':
    case 'finalized':
      return 'confirmed';
    case 'execution_reverted':
    case 'failed':
    case 'replaced':
    case 'provider_error':
      return 'failed';
    default:
      return 'pending';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { wallet_id, caip2, authorization_signature } = await request.json();

    if (!wallet_id || !caip2) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet_id, caip2' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${PRIVY_API_URL}/wallets/${wallet_id}/ethereum_yield_claim`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'privy-app-id': PRIVY_APP_ID,
          'Authorization': `Basic ${Buffer.from(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`).toString('base64')}`,
          ...(authorization_signature ? { 'privy-authorization-signature': authorization_signature } : {}),
        },
        body: JSON.stringify({ caip2 }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || data.message || '';
      const isNoRewards =
        response.status === 400 &&
        errorMessage.includes('No claimable rewards found');

      if (isNoRewards) {
        return NextResponse.json(
          { error: errorMessage, code: 'no_rewards' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: errorMessage || 'Claim failed' },
        { status: response.status }
      );
    }

    // Create one transaction per reward token
    const now = Date.now();
    for (let i = 0; i < data.rewards.length; i++) {
      const reward = data.rewards[i];
      upsertTransaction({
        id: `${data.id}-${i}`,
        wallet_id,
        type: 'claim',
        status: normalizeClaimStatus(data.status),
        asset_amount: reward.amount,
        token_symbol: reward.token_symbol,
        token_decimals: 18,
        created_at: now,
        updated_at: now,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
