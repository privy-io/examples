'use client';

import { useState } from 'react';
import { formatUsd } from '@/lib/policies';

type ActionType = 'weather' | 'sweater';

interface ActionCardProps {
  action: ActionType;
  cost: number;
  disabled?: boolean;
  policyLimit: number;
  onExecute: () => Promise<void>;
}

const ACTION_CONFIG: Record<
  ActionType,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
    bgClass: string;
  }
> = {
  weather: {
    title: 'Fetch weather',
    description: 'Get current weather data for your location',
    bgClass: 'bg-[#5B4FFF]',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    ),
  },
  sweater: {
    title: 'Buy a sweater',
    description: 'Purchase a cozy wool sweater',
    bgClass: 'bg-[#4A3EE6]',
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
  },
};

export function ActionCard({
  action,
  cost,
  disabled,
  policyLimit,
  onExecute,
}: ActionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = ACTION_CONFIG[action];
  const exceedsLimit = cost > policyLimit;

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onExecute();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-6 transition-all ${
        exceedsLimit
          ? 'border-red-200 bg-red-50'
          : 'border-[#E2E3F0] bg-white hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.bgClass} text-white`}
        >
          {config.icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">
            {formatUsd(cost)}
          </div>
          <div className="text-xs text-slate-500">cost</div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold text-slate-900">{config.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{config.description}</p>
      </div>

      {exceedsLimit && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-100 p-3 text-sm text-red-700">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            Exceeds {formatUsd(policyLimit)} limit
          </span>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-medium transition-all ${
          exceedsLimit
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-[#5B4FFF] text-white hover:bg-[#4A3EE6]'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
            Executing...
          </span>
        ) : exceedsLimit ? (
          'Try anyway (will fail)'
        ) : (
          'Execute action'
        )}
      </button>
    </div>
  );
}
