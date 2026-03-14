'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatUsd } from '@/lib/policies';

interface Agent {
  id: string;
  wallet: {
    id: string;
    address: string;
  };
  balance: number;
  createdAt: string;
}

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const [onChainBalance, setOnChainBalance] = useState<number | null>(null);
  const truncatedAddress = `${agent.wallet.address.slice(0, 6)}...${agent.wallet.address.slice(-4)}`;

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/agent/balance?address=${agent.wallet.address}`
      );
      const data = await res.json();
      if (data.success) {
        setOnChainBalance(data.balance);
      }
    } catch {
      // Silently fall back to client-side balance
    }
  }, [agent.wallet.address]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10_000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  const displayBalance = onChainBalance !== null ? onChainBalance : agent.balance;

  return (
    <div className="rounded-2xl border border-[#E2E3F0] bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5B4FFF]">
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
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">AI Agent</h3>
              <p className="text-xs text-slate-500">Created just now</p>
            </div>
          </div>
        </div>
        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          Active
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl bg-[#F1F2F9] p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Wallet Address
          </div>
          <div className="mt-1 font-mono text-sm text-slate-900">
            {truncatedAddress}
          </div>
        </div>

        <div className="rounded-xl bg-[#F1F2F9] p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Balance
          </div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {formatUsd(displayBalance)}
          </div>
          <div className="text-xs text-slate-500">PathUSD</div>
        </div>
      </div>
    </div>
  );
}
