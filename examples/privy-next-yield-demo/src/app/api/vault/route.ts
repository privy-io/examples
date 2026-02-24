import { NextRequest, NextResponse } from 'next/server';
import { PRIVY_API_URL } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vault_id = searchParams.get('vault_id');

  if (!vault_id) {
    return NextResponse.json(
      { error: 'Missing required query param: vault_id' },
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
      `${PRIVY_API_URL}/ethereum_yield_vault/${vault_id}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${appId}:${appSecret}`).toString('base64')}`,
          'privy-app-id': appId,
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Privy API error (vault):', response.status, errorBody);
      return NextResponse.json(
        { error: 'Failed to fetch vault info from Privy' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching vault info:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
