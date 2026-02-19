'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAgent = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/agent/create', {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create agent');
      }

      // Store agent data in sessionStorage for the wizard
      sessionStorage.setItem('agent', JSON.stringify(data.agent));

      // Navigate to the fund step (step 2 of wizard)
      router.push(`/agent/${data.agent.id}/fund`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
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

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl text-center">
          {/* Floating Privy icon */}
          <div className="mb-8 flex justify-center">
            <div className="animate-float rounded-3xl bg-violet-100 p-8">
              <svg
                width="80"
                height="100"
                viewBox="126 148 136 175"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M194.443 283.398C231.716 283.398 261.943 253.172 261.943 215.898C261.943 178.625 231.716 148.398 194.443 148.398C157.169 148.398 126.943 178.625 126.943 215.898C126.943 253.172 157.169 283.398 194.443 283.398Z"
                  fill="#010110"
                />
                <path
                  d="M194.442 322.642C219.916 322.642 240.571 318.295 240.571 312.963C240.571 307.63 219.93 303.283 194.442 303.283C168.954 303.283 148.312 307.63 148.312 312.963C148.312 318.295 168.954 322.642 194.442 322.642Z"
                  fill="#010110"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Agentic wallets
            <span className="block text-violet-600">protected by Privy</span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
            Use Privy to give your AI agent wallets. Fund them, set spending
            policies, and watch them make autonomous payments using the x402
            protocol.
          </p>

          {/* Features */}
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                <svg
                  className="h-5 w-5 text-violet-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium text-slate-900">
                Secure wallets
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                <svg
                  className="h-5 w-5 text-violet-600"
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
              <div className="text-sm font-medium text-slate-900">
                Policy controls
              </div>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                <svg
                  className="h-5 w-5 text-violet-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="text-sm font-medium text-slate-900">
                x402 payments
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10">
            <button
              onClick={handleCreateAgent}
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-xl bg-offblack px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? (
                <>
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
                  Creating agent...
                </>
              ) : (
                <>
                  Create your AI agent
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Demo note */}
          <p className="mt-8 text-xs text-slate-500">
            This is a demo using testnet USDC. No real funds are involved.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          Built with{' '}
          <a
            href="https://privy.io"
            className="font-medium text-violet-600 hover:underline"
          >
            Privy
          </a>{' '}
          and{' '}
          <a
            href="https://x402.org"
            className="font-medium text-violet-600 hover:underline"
          >
            x402
          </a>
        </div>
      </footer>
    </div>
  );
}
