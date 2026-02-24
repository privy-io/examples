import { NextRequest, NextResponse } from 'next/server';
import { PRIVY_API_URL } from '@/lib/constants';
import { upsertTransaction } from '@/lib/transaction-store';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { wallet_id, vault_id, asset_amount, authorization_signature } = await request.json();

    if (!wallet_id || !vault_id || !asset_amount) {
      return NextResponse.json(
        { error: 'Missing required fields: wallet_id, vault_id, asset_amount' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${PRIVY_API_URL}/wallets/${wallet_id}/ethereum_yield_deposit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'privy-app-id': PRIVY_APP_ID,
          'Authorization': `Basic ${Buffer.from(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`).toString('base64')}`,
          ...(authorization_signature ? { 'privy-authorization-signature': authorization_signature } : {}),
        },
        body: JSON.stringify({ vault_id, asset_amount }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Deposit failed' },
        { status: response.status }
      );
    }

    upsertTransaction(data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
