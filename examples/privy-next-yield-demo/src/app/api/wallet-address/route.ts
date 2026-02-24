import { NextRequest, NextResponse } from 'next/server';
import { PRIVY_API_URL } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet_id = searchParams.get('wallet_id');

  if (!wallet_id) {
    return NextResponse.json(
      { error: 'Missing required query param: wallet_id' },
      { status: 400 }
    );
  }

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: 'Server misconfiguration: missing Privy credentials' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${PRIVY_API_URL}/wallets/${wallet_id}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
          'privy-app-id': appId,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Privy API error (wallet-address):', response.status, errorBody);
      return NextResponse.json(
        { error: 'Failed to fetch wallet from Privy' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ address: data.address });
  } catch (err) {
    console.error('Error fetching wallet address:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
