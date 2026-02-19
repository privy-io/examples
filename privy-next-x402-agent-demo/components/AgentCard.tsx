'use client';

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

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const truncatedAddress = `${agent.wallet.address.slice(0, 6)}...${agent.wallet.address.slice(-4)}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
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
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Wallet Address
          </div>
          <div className="mt-1 font-mono text-sm text-slate-900">
            {truncatedAddress}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Balance
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-900">
              {formatUsd(agent.balance)}
            </div>
            <div className="text-xs text-slate-500">USDC</div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Spending Limit
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-900">
              {formatUsd(agent.policy.maxPerTransaction)}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              per transaction
              {agent.policy.privyPolicyId && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Privy
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
