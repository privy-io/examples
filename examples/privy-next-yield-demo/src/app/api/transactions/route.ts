import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsByWallet } from '@/lib/transaction-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletId = searchParams.get('wallet_id');

  if (!walletId) {
    return NextResponse.json(
      { error: 'Missing required query param: wallet_id' },
      { status: 400 }
    );
  }

  const transactions = getTransactionsByWallet(walletId);
  return NextResponse.json({ transactions });
}
