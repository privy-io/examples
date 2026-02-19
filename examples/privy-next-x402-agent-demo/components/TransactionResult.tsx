'use client';

import { formatUsd } from '@/lib/policies';

interface TransactionResultProps {
  result: {
    success: boolean;
    action: string;
    cost: number;
    error?: string;
    policyRejection?: boolean;
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
  const isPolicyRejection = result.policyRejection;

  return (
    <div
      className={`rounded-2xl border p-6 ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50'
          : isPolicyRejection
            ? 'border-amber-200 bg-amber-50'
            : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
            isSuccess
              ? 'bg-emerald-500'
              : isPolicyRejection
                ? 'bg-amber-500'
                : 'bg-red-500'
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
          ) : isPolicyRejection ? (
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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
              isSuccess
                ? 'text-emerald-900'
                : isPolicyRejection
                  ? 'text-amber-900'
                  : 'text-red-900'
            }`}
          >
            {isSuccess
              ? 'Transaction successful!'
              : isPolicyRejection
                ? 'Policy rejected'
                : 'Transaction failed'}
          </h3>

          <p
            className={`mt-1 text-sm ${
              isSuccess
                ? 'text-emerald-700'
                : isPolicyRejection
                  ? 'text-amber-700'
                  : 'text-red-700'
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
                  href={`${result.explorerUrl || 'https://basescan.org'}/address/${result.walletAddress}#tokentxns`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  View on BaseScan
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

          {/* Policy rejection explanation */}
          {isPolicyRejection && (
            <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <svg
                  className="h-4 w-4 text-amber-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  The spending policy prevented this transaction. The cost of{' '}
                  <strong>{formatUsd(result.cost)}</strong> exceeds your
                  configured limit.
                </span>
              </div>
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
