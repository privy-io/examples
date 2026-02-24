import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import { upsertTransaction } from '@/lib/transaction-store';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!;
const PRIVY_WEBHOOK_SECRET = process.env.PRIVY_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    if (!PRIVY_WEBHOOK_SECRET) {
      console.error('PRIVY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

    const verified = await privy.verifyWebhook(
      payload,
      {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      PRIVY_WEBHOOK_SECRET
    );

    // The webhook payload may nest transaction data under a `data` field
    const body = verified as Record<string, Record<string, unknown>>;
    const txData = body.data ?? body;

    if (txData.id && txData.wallet_id) {
      upsertTransaction({
        id: String(txData.id),
        wallet_id: String(txData.wallet_id),
        vault_id: String(txData.vault_id ?? ''),
        type: String(txData.type ?? ''),
        status: String(txData.status ?? ''),
        asset_amount: String(txData.asset_amount ?? '0'),
        share_amount: txData.share_amount ? String(txData.share_amount) : undefined,
        transaction_id: txData.transaction_id ? String(txData.transaction_id) : undefined,
        approval_transaction_id: txData.approval_transaction_id ? String(txData.approval_transaction_id) : undefined,
        created_at: Number(txData.created_at ?? Date.now()),
        updated_at: Number(txData.updated_at ?? Date.now()),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }
}
