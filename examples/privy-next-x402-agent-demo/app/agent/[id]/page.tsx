'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { StepIndicator, WIZARD_STEPS } from '@/components/StepIndicator';
import { AgentCard } from '@/components/AgentCard';
import { ActionCard } from '@/components/ActionCard';
import { TransactionResult } from '@/components/TransactionResult';
import { type AgentPolicy } from '@/lib/policies';

interface Agent {
  id: string;
  wallet: {
    id: string;
    address: string;
  };
  balance: number;
  policy: AgentPolicy;
  createdAt: string;
}

interface TransactionResultData {
  success: boolean;
  action: string;
  cost: number;
  error?: string;
  policyRejection?: boolean;
  walletAddress?: string;
  result?: {
    service: string;
    data: Record<string, unknown>;
    payment?: {
      amount: string;
      status: string;
    };
  };
}

// Action costs in cents
const ACTION_COSTS = {
  weather: 10, // $0.10
  sweater: 500, // $5.00
};

export default function ActionsStep() {
  const router = useRouter();
  const params = useParams();
  const [agent, setAgent] = useState<Agent | null>(() => {
    if (typeof window === 'undefined') return null;
    const storedAgent = sessionStorage.getItem('agent');
    if (!storedAgent) return null;
    try {
      return JSON.parse(storedAgent) as Agent;
    } catch {
      return null;
    }
  });
  const [transactionResult, setTransactionResult] =
    useState<TransactionResultData | null>(null);

  useEffect(() => {
    if (!agent) {
      router.push('/');
      return;
    }
    if (agent.id !== params.id) {
      router.push('/');
      return;
    }
    // Ensure policy is configured at the Privy level before reaching this step
    if (!agent.policy?.privyPolicyId) {
      router.push(`/agent/${agent.id}/policy`);
    }
  }, [router, params.id, agent]);

  const handleExecuteAction = async (action: 'weather' | 'sweater') => {
    if (!agent) return;

    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: agent.wallet.id,
          walletAddress: agent.wallet.address,
          action,
        }),
      });

      const data = await response.json();
      setTransactionResult(data);

      // If successful, deduct from balance
      if (data.success) {
        const updatedAgent = {
          ...agent,
          balance: agent.balance - ACTION_COSTS[action],
        };
        setAgent(updatedAgent);
        sessionStorage.setItem('agent', JSON.stringify(updatedAgent));
      }
    } catch (error) {
      setTransactionResult({
        success: false,
        action,
        cost: ACTION_COSTS[action],
        error: error instanceof Error ? error.message : 'Request failed',
      });
    }
  };

  if (!agent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E2E3F0] border-t-[#5B4FFF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[#E2E3F0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <Logo className="text-slate-900" width={100} height={30} />
          </button>
          <div className="flex items-center gap-4">
            <a
              href="https://docs.privy.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#5B4FFF]"
            >
              Docs
            </a>
            <a
              href="https://docs.privy.io/recipes/x402"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#5B4FFF]"
            >
              x402 →
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <StepIndicator currentStep={4} steps={WIZARD_STEPS} />

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Agent actions</h1>
          <p className="mt-2 text-slate-600">
            Execute actions and watch your agent make autonomous payments
          </p>
        </div>

        <div className="space-y-6">
          {/* Agent card */}
          <AgentCard agent={agent} />

          {/* Actions */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              x402 API actions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <ActionCard
                action="weather"
                cost={ACTION_COSTS.weather}
                policyLimit={agent.policy.maxPerTransaction}
                disabled={false}
                onExecute={() => handleExecuteAction('weather')}
              />
              <ActionCard
                action="sweater"
                cost={ACTION_COSTS.sweater}
                policyLimit={agent.policy.maxPerTransaction}
                disabled={false}
                onExecute={() => handleExecuteAction('sweater')}
              />
            </div>
          </div>

          {/* Transaction result */}
          {transactionResult && (
            <TransactionResult
              result={transactionResult}
              onDismiss={() => setTransactionResult(null)}
            />
          )}

          {/* How it works */}
          <div className="rounded-2xl border border-[#E2E3F0] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              How it works
            </h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#5B4FFF] text-xs font-bold text-white">
                  1
                </div>
                <p>
                  <strong>Fetch weather</strong> costs $0.10 and will{' '}
                  {ACTION_COSTS.weather <= agent.policy.maxPerTransaction ? (
                    <span className="text-emerald-600">succeed</span>
                  ) : (
                    <span className="text-red-600">be blocked</span>
                  )}{' '}
                  because it&apos;s{' '}
                  {ACTION_COSTS.weather <= agent.policy.maxPerTransaction
                    ? 'under'
                    : 'over'}{' '}
                  your ${(agent.policy.maxPerTransaction / 100).toFixed(2)} policy limit.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#5B4FFF] text-xs font-bold text-white">
                  2
                </div>
                <p>
                  <strong>Buy a sweater</strong> costs $5.00 and will{' '}
                  {ACTION_COSTS.sweater <= agent.policy.maxPerTransaction ? (
                    <span className="text-emerald-600">succeed</span>
                  ) : (
                    <span className="text-red-600">be blocked</span>
                  )}{' '}
                  by your spending policy{' '}
                  {ACTION_COSTS.sweater > agent.policy.maxPerTransaction &&
                    `(exceeds $${(agent.policy.maxPerTransaction / 100).toFixed(2)} limit)`}
                  .
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#5B4FFF] text-xs font-bold text-white">
                  3
                </div>
                <p>
                  Payments use the{' '}
                  <a
                    href="https://x402.org"
                    className="font-medium text-[#5B4FFF] hover:underline"
                  >
                    x402 protocol
                  </a>{' '}
                  - your agent signs payment authorizations that are settled
                  on-chain.
                </p>
              </div>
            </div>
          </div>

          {/* Start over button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                sessionStorage.removeItem('agent');
                router.push('/');
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2E3F0] bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:border-gray-300 hover:shadow-md"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Create new agent
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E3F0] bg-white/50 py-6 mt-12">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          Built with{' '}
          <a
            href="https://privy.io"
            className="font-medium text-[#5B4FFF] hover:underline"
          >
            Privy
          </a>{' '}
          and{' '}
          <a
            href="https://x402.org"
            className="font-medium text-[#5B4FFF] hover:underline"
          >
            x402
          </a>
        </div>
      </footer>
    </div>
  );
}
