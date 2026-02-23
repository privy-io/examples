import { NextResponse } from 'next/server';
import { createAgentWallet } from '@/lib/privy';

export async function POST() {
  try {
    // Generate a unique agent ID
    const agentId = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Create a new wallet for the agent
    const wallet = await createAgentWallet();

    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        wallet: {
          id: wallet.id,
          address: wallet.address,
        },
        balance: 0,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create agent',
      },
      { status: 500 }
    );
  }
}
