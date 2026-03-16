'use client';

import { formatUsd } from '@/lib/policies';

interface TransactionResultProps {
  result: {
    success: boolean;
    action: string;
    cost: number;
    error?: string;
    walletAddress?: string;
    explorerUrl?: string;
    result?: {
      service: string;
      data: Record<string, unknown>;
      payment?: {
        amount: string;
        status: string;
        txHash?: string;
      };
    };
  };
  onDismiss: () => void;
}

export function TransactionResult({ result, onDismiss }: TransactionResultProps) {
  const isSuccess = result.success;

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
            isSuccess ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          {isSuccess ? (
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
          ) : (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>

        <div className="flex-1">
          <h3
            className={`font-semibold ${
              isSuccess ? 'text-emerald-900' : 'text-red-900'
            }`}
          >
            {isSuccess ? 'Transaction successful!' : 'Transaction failed'}
          </h3>

          <p
            className={`mt-1 text-sm ${
              isSuccess ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            {isSuccess
              ? `Your agent successfully completed the ${result.action} action for ${formatUsd(result.cost)}`
              : result.error}
          </p>

          {/* View wallet transactions */}
          {isSuccess && result.walletAddress && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-emerald-800">
                    Payment signed via Privy
                  </span>
                </div>
                <a
                  href={`${result.explorerUrl || 'https://explorer.tempo.xyz'}/address/${result.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  View on Explorer
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Success details */}
          {isSuccess && result.result?.data && (
            <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Response Data
              </div>
              <pre className="mt-2 overflow-auto text-xs text-slate-700">
                {JSON.stringify(result.result.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <button
          onClick={onDismiss}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
