'use client';

import { useState } from 'react';
import { parseUSDC, getVaultId, getFeeRecipientWalletId } from '@/lib/constants';

type WithdrawStatus = 'idle' | 'loading' | 'success' | 'error';

interface WithdrawResponse {
  id: string;
  wallet_id: string;
  vault_id: string;
  type: string;
  status: string;
  asset_amount: string;
  share_amount?: string;
  transaction_id?: string;
  created_at: number;
  updated_at: number;
}

export function AppWithdrawForm({ onSuccess }: { onSuccess?: () => void }) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<WithdrawStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<WithdrawResponse | null>(null);

  const walletId = getFeeRecipientWalletId();
  const vaultId = getVaultId();

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletId || !amount || !vaultId) {
      setError('Please enter an amount and ensure wallet and vault are configured');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const assetAmount = parseUSDC(amount);

      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_id: walletId,
          vault_id: vaultId,
          asset_amount: assetAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      setTxResult(data);
      setStatus('success');
      setAmount('');
      onSuccess?.();
    } catch (err) {
      console.error('Withdraw error:', err);
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
      setStatus('error');
    }
  };

  const isDisabled = status === 'loading' || !walletId || !vaultId;

  return (
    <div className="rounded-2xl p-6 bg-white border border-[#E2E3F0]">
      <h3 className="text-lg font-semibold text-[#040217] mb-4">Withdraw USDC</h3>

      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <label htmlFor="app-withdraw-amount" className="block text-sm text-[#64668B] mb-2">
            Amount to withdraw
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64668B]">$</span>
            <input
              id="app-withdraw-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field pl-8"
              disabled={isDisabled}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#9498B8]">
              USDC
            </span>
          </div>
        </div>

        {!walletId && (
          <p className="text-sm text-[#906218] bg-[#FEF3C7] p-3 rounded-lg">
            Fee recipient wallet ID not configured. Set NEXT_PUBLIC_FEE_RECIPIENT_WALLET_ID in your environment.
          </p>
        )}

        {!vaultId && (
          <p className="text-sm text-[#906218] bg-[#FEF3C7] p-3 rounded-lg">
            Vault ID not configured. Set NEXT_PUBLIC_VAULT_ID in your environment.
          </p>
        )}

        {error && (
          <p className="text-sm text-[#991B1B] bg-[#FEE2E2] p-3 rounded-lg">
            {error}
          </p>
        )}

        {status === 'success' && txResult && (
          <div className="bg-[#DCFCE7] p-3 rounded-lg">
            <p className="text-sm text-[#135638] font-medium">Withdrawal initiated!</p>
            <p className="text-xs text-[#135638] mt-1">
              Transaction ID: {txResult.transaction_id || txResult.id}
            </p>
            <p className="text-xs text-[#135638]">
              Status: {txResult.status}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isDisabled || !amount}
          className="button-primary w-full rounded-full"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            'Withdraw'
          )}
        </button>
      </form>

      <p className="text-xs text-[#9498B8] mt-4 text-center">
        Withdraw earned fees from the vault
      </p>
    </div>
  );
}
