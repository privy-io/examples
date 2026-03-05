'use client';

import { useState } from 'react';
import { usePrivy, useWallets, useAuthorizationSignature } from '@privy-io/react-auth';
import { PRIVY_API_URL, formatTokenAmount } from '@/lib/constants';

type ClaimStatus = 'idle' | 'loading' | 'success' | 'error' | 'no_rewards';

interface ClaimReward {
  token_address: string;
  token_symbol: string;
  amount: string;
}

interface ClaimResponse {
  id: string;
  caip2: string;
  status: string;
  rewards: ClaimReward[];
}

export function ClaimRewardsForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { generateAuthorizationSignature } = useAuthorizationSignature();
  const [status, setStatus] = useState<ClaimStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<ClaimResponse | null>(null);

  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
  const privyWalletId = user?.linkedAccounts?.find(
    (a): a is Extract<typeof a, { type: 'wallet' }> =>
      a.type === 'wallet' && 'walletClientType' in a && a.walletClientType === 'privy'
  )?.id;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;

  const handleClaim = async () => {
    if (!embeddedWallet || !privyWalletId) {
      setError('Wallet not available');
      return;
    }

    setStatus('loading');
    setError(null);
    setClaimResult(null);

    try {
      const caip2 = 'eip155:8453';
      const url = `${PRIVY_API_URL}/wallets/${privyWalletId}/ethereum_yield_claim`;
      const body = { caip2 };

      const { signature: authorizationSignature } = await generateAuthorizationSignature({
        version: 1,
        method: 'POST',
        url,
        body,
        headers: { 'privy-app-id': appId },
      });

      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_id: privyWalletId,
          caip2,
          authorization_signature: authorizationSignature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'no_rewards') {
          setStatus('no_rewards');
          return;
        }
        throw new Error(data.error || 'Claim failed');
      }

      setClaimResult(data);
      setStatus('success');
      onSuccess?.();
    } catch (err) {
      console.error('Claim error:', err);
      setError(err instanceof Error ? err.message : 'Claim failed');
      setStatus('error');
    }
  };

  const isDisabled = status === 'loading' || !embeddedWallet;

  return (
    <div className="rounded-2xl p-6 bg-white border border-[#E2E3F0]">
      <h3 className="text-lg font-semibold text-[#040217] mb-4">Claim Rewards</h3>

      {status === 'no_rewards' && (
        <p className="text-sm text-[#906218] bg-[#FEF3C7] p-3 rounded-lg mb-4">
          No rewards available to claim yet. Rewards accrue over time from vault participation.
        </p>
      )}

      {error && (
        <p className="text-sm text-[#991B1B] bg-[#FEE2E2] p-3 rounded-lg mb-4">
          {error}
        </p>
      )}

      {status === 'success' && claimResult && (
        <div className="bg-[#DCFCE7] p-3 rounded-lg mb-4">
          <p className="text-sm text-[#135638] font-medium">
            Claimed {claimResult.rewards.map((r, i) => (
              <span key={r.token_address}>
                {i > 0 && ', '}
                {formatTokenAmount(r.amount, 18, 4)} {r.token_symbol}
              </span>
            ))}
          </p>
          <p className="text-xs text-[#135638] mt-1">
            Status: {claimResult.status}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleClaim}
        disabled={isDisabled}
        className="button-primary w-full rounded-full"
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Claiming...
          </span>
        ) : (
          'Claim Rewards'
        )}
      </button>

      <p className="text-xs text-[#9498B8] mt-4 text-center">
        Claim incentive rewards earned from vault participation
      </p>
    </div>
  );
}
