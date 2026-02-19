'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { StepIndicator, WIZARD_STEPS } from '@/components/StepIndicator';

interface Agent {
  id: string;
  wallet: {
    id: string;
    address: string;
  };
  balance: number;
  policy: {
    maxPerTransaction: number;
    accepted: boolean;
  };
  createdAt: string;
}

const FUNDING_OPTIONS = [
  { amount: 0.10, label: '$0.10', description: 'Light usage' },
  { amount: 0.50, label: '$0.50', description: 'Recommended' },
  { amount: 1, label: '$1', description: 'Heavy usage' },
];

export default function FundStep() {
  const router = useRouter();
  const params = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [router, params.id]);

  const handleFund = async () => {
    if (!selectedAmount || !agent) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agent/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: agent.wallet.address,
          amount: selectedAmount,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fund wallet');
      }

      // Update agent balance (convert USD to cents)
      const updatedAgent = {
        ...agent,
        balance: agent.balance + selectedAmount * 100,
      };
      sessionStorage.setItem('agent', JSON.stringify(updatedAgent));

      // Navigate to policy step
      router.push(`/agent/${agent.id}/policy`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fund wallet');
      setIsLoading(false);
    }
  };

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
        <StepIndicator currentStep={2} steps={WIZARD_STEPS} />

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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">Fund your agent</h1>
          <p className="mt-3 text-slate-600">
            Add USDC to your agent&apos;s wallet so it can make payments
          </p>
        </div>

        {/* Wallet info */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Agent Wallet</div>
              <div className="font-mono text-sm text-slate-500">
                {agent.wallet.address.slice(0, 6)}...{agent.wallet.address.slice(-4)}
              </div>
            </div>
          </div>
        </div>

        {/* Funding options */}
        <div className="mt-8">
          <label className="mb-4 block text-sm font-medium text-slate-700">
            Select funding amount
          </label>
          <div className="grid grid-cols-3 gap-4">
            {FUNDING_OPTIONS.map((option) => (
              <button
                key={option.amount}
                onClick={() => setSelectedAmount(option.amount)}
                className={`relative rounded-2xl border-2 p-6 text-center transition-all ${
                  selectedAmount === option.amount
                    ? 'border-violet-500 bg-violet-50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {option.description === 'Recommended' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-500 px-3 py-1 text-xs font-semibold text-white">
                    Popular
                  </div>
                )}
                <div className="text-3xl font-bold text-slate-900">{option.label}</div>
                <div className="mt-1 text-sm text-slate-500">USDC</div>
                <div className="mt-2 text-xs text-slate-400">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 rounded-xl border border-slate-200 px-6 py-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Back
          </button>
          <button
            onClick={handleFund}
            disabled={!selectedAmount || isLoading}
            className="flex-1 rounded-xl bg-offblack px-6 py-4 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Funding...
              </span>
            ) : (
              <>
                Continue
                <span className="ml-2">→</span>
              </>
            )}
          </button>
        </div>

        {/* Info note */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Funds are transferred from a demo treasury. No real USDC is involved.
        </p>
      </main>
    </div>
  );
}
