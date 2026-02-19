import { NextResponse } from 'next/server';
import { createAgentWallet, createSpendingPolicy, attachPolicyToWallet } from '@/lib/privy';

// Default spending limit: $1.00 per transaction (in cents)
const DEFAULT_MAX_PER_TRANSACTION = 100;

export async function POST() {
  try {
    // Generate a unique agent ID
    const agentId = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Create a new wallet for the agent
    const wallet = await createAgentWallet();

    // Create a Privy policy for spending limits (default $1 per transaction)
    const policy = await createSpendingPolicy(agentId, DEFAULT_MAX_PER_TRANSACTION);
    // Attach the policy to the wallet
    await attachPolicyToWallet(wallet.id, policy.id);

    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        wallet: {
          id: wallet.id,
          address: wallet.address,
        },
        balance: 0,
        policy: {
          maxPerTransaction: DEFAULT_MAX_PER_TRANSACTION,
          privyPolicyId: policy.id,
        },
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
