'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { formatUSDC, getVaultId } from '@/lib/constants';

interface Position {
  asset: {
    address: string;
    symbol: string;
  };
  total_deposited: string;
  total_withdrawn: string;
  assets_in_vault: string;
  shares_in_vault: string;
}

export function PositionDisplay() {
  const { user } = usePrivy();
  const [position, setPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const privyWalletId = user?.linkedAccounts?.find(
    (a): a is Extract<typeof a, { type: 'wallet' }> =>
      a.type === 'wallet' && 'walletClientType' in a && a.walletClientType === 'privy'
  )?.id;
  const vaultId = getVaultId();

  useEffect(() => {
    async function fetchPosition() {
      if (!privyWalletId || !vaultId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/position?wallet_id=${privyWalletId}&vault_id=${vaultId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch position');
        }

        const data = await response.json();
        setPosition(data);
      } catch (err) {
        console.error('Error fetching position:', err);
        setError(err instanceof Error ? err.message : 'Failed to load position');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosition();
    // Refresh position every 60 seconds
    const interval = setInterval(fetchPosition, 60000);
    return () => clearInterval(interval);
  }, [privyWalletId, vaultId]);

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 bg-[#F1F2F9]">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">Your Position</h3>
        <div className="space-y-3">
          <div className="h-6 w-32 bg-white/50 rounded animate-pulse" />
          <div className="h-10 w-40 bg-white/50 rounded animate-pulse" />
          <div className="h-4 w-24 bg-white/50 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 bg-[#F1F2F9]">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">Your Position</h3>
        <p className="text-sm text-[#991B1B]">{error}</p>
      </div>
    );
  }

  if (!position || !vaultId) {
    return (
      <div className="rounded-2xl p-6 bg-[#F1F2F9]">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">Your Position</h3>
        <p className="text-sm text-[#64668B]">
          {!vaultId ? 'Vault not configured' : 'No active position'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-[#F1F2F9]">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#040217]">Your Position</h3>
      </div>

      <div className="space-y-4">
        {/* Assets in Vault */}
        <div>
          <p className="text-sm text-[#64668B] mb-1">Assets in Vault</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#040217]">
              ${formatUSDC(position.assets_in_vault)}
            </span>
            <span className="text-sm text-[#64668B]">{position.asset.symbol}</span>
          </div>
        </div>

        {/* Total Deposited */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Total Deposited</span>
          <span className="text-sm font-medium text-[#040217]">
            ${formatUSDC(position.total_deposited)} {position.asset.symbol}
          </span>
        </div>

        {/* Total Withdrawn */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Total Withdrawn</span>
          <span className="text-sm font-medium text-[#040217]">
            ${formatUSDC(position.total_withdrawn)} {position.asset.symbol}
          </span>
        </div>

        {/* Shares in Vault */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Shares in Vault</span>
          <span className="text-sm font-medium text-[#040217]">
            {position.shares_in_vault}
          </span>
        </div>

        {/* Asset */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Asset</span>
          <span className="text-sm font-medium text-[#040217]">
            {position.asset.symbol}
          </span>
        </div>
      </div>
    </div>
  );
}
