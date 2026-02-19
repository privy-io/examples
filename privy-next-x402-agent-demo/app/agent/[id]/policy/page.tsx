'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { StepIndicator, WIZARD_STEPS } from '@/components/StepIndicator';
import { type AgentPolicy, formatUsd } from '@/lib/policies';

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

const SPENDING_LIMITS = [
  { cents: 50, label: '$0.50', description: 'Very conservative' },
  { cents: 100, label: '$1.00', description: 'Recommended' },
  { cents: 250, label: '$2.50', description: 'Moderate' },
  { cents: 500, label: '$5.00', description: 'Flexible' },
];

export default function PolicyStep() {
  const router = useRouter();
  const params = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [selectedLimit, setSelectedLimit] = useState<number>(100); // Default to $1.00
  const [customLimit, setCustomLimit] = useState<string>('');
  const [useCustom, setUseCustom] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const storedAgent = sessionStorage.getItem('agent');
    if (!storedAgent) {
      router.push('/');
      return;
    }
    const parsedAgent = JSON.parse(storedAgent);
    if (parsedAgent.id !== params.id) {
      router.push('/');
      return;
    }
    setAgent(parsedAgent);
    setSelectedLimit(parsedAgent.policy.maxPerTransaction);
  }, [router, params.id]);

  const handleContinue = async () => {
    if (!agent) return;

    const finalLimit = useCustom
      ? Math.round(parseFloat(customLimit) * 100) || 100
      : selectedLimit;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      // Update the Privy policy if we have a policy ID
      if (agent.policy.privyPolicyId) {
        const response = await fetch('/api/agent/policy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            policyId: agent.policy.privyPolicyId,
            maxPerTransaction: finalLimit,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update policy');
        }

      }

      // Update agent with new policy
      const updatedAgent = {
        ...agent,
        policy: {
          ...agent.policy,
          maxPerTransaction: finalLimit,
        },
      };
      sessionStorage.setItem('agent', JSON.stringify(updatedAgent));

      // Navigate to actions step
      router.push(`/agent/${agent.id}`);
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update policy');
    } finally {
      setIsUpdating(false);
    }
  };

  const currentLimit = useCustom 
    ? Math.round(parseFloat(customLimit) * 100) || 0
    : selectedLimit;

  if (!agent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo className="text-slate-900" />
          <div className="flex items-center gap-4">
            <a
              href="https://docs.privy.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Docs
            </a>
            <a
              href="https://docs.privy.io/recipes/x402"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              x402 →
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-6 py-12">
        <StepIndicator currentStep={3} steps={WIZARD_STEPS} />

        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">Configure policy</h1>
          <p className="mt-3 text-slate-600">
            Set a spending limit to control how much your agent can spend per transaction
          </p>
        </div>

        {/* Current balance info */}
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-emerald-900">Wallet funded</div>
                <div className="text-sm text-emerald-700">Ready to configure policy</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-900">
                {formatUsd(agent.balance)}
              </div>
              <div className="text-xs text-emerald-600">Available USDC</div>
            </div>
          </div>
        </div>

        {/* Spending limits */}
        <div className="mt-8">
          <label className="mb-4 block text-sm font-medium text-slate-700">
            Maximum spending per transaction
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            {SPENDING_LIMITS.map((limit) => (
              <button
                key={limit.cents}
                onClick={() => {
                  setSelectedLimit(limit.cents);
                  setUseCustom(false);
                }}
                className={`relative rounded-2xl border-2 p-5 text-left transition-all ${
                  !useCustom && selectedLimit === limit.cents
                    ? 'border-violet-500 bg-violet-50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {limit.description === 'Recommended' && (
                  <div className="absolute -top-3 right-4 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">
                    Default
                  </div>
                )}
                <div className="text-2xl font-bold text-slate-900">{limit.label}</div>
                <div className="mt-1 text-sm text-slate-500">{limit.description}</div>
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="mt-4">
            <button
              onClick={() => setUseCustom(!useCustom)}
              className={`w-full rounded-2xl border-2 p-5 text-left transition-all ${
                useCustom
                  ? 'border-violet-500 bg-violet-50 shadow-lg'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Custom amount</div>
                  <div className="text-sm text-slate-500">Set your own spending limit</div>
                </div>
                <svg
                  className={`h-5 w-5 transition-transform ${useCustom ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {useCustom && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <label className="block text-sm font-medium text-slate-700">
                  Enter amount in USD
                </label>
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    value={customLimit}
                    onChange={(e) => setCustomLimit(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-8 pr-4 text-lg focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Policy preview */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-900">Policy summary</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <svg
                className="h-5 w-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-slate-700">
                Maximum <strong>{currentLimit > 0 ? formatUsd(currentLimit) : '$0.00'}</strong> per transaction
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <svg
                className="h-5 w-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-slate-700">
                Transactions exceeding the limit will be <strong>blocked</strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <svg
                className="h-5 w-5 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-slate-700">
                You can modify the policy at any time
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {updateError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{updateError}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push(`/agent/${agent.id}/fund`)}
            disabled={isUpdating}
            className="flex-1 rounded-xl border border-slate-200 px-6 py-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={currentLimit <= 0 || isUpdating}
            className="flex-1 rounded-xl bg-offblack px-6 py-4 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating policy...
              </span>
            ) : (
              <>
                Accept &amp; Continue
                <span className="ml-2">→</span>
              </>
            )}
          </button>
        </div>

        {/* Info note */}
        <p className="mt-6 text-center text-xs text-slate-500">
          By continuing, you accept the spending policy for your agent.
          {agent.policy.privyPolicyId && (
            <span className="block mt-1 text-violet-500">
              Policy enforced by Privy secure enclave
            </span>
          )}
        </p>
      </main>
    </div>
  );
}
