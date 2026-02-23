'use client';

import { useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
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
  const { wallets } = useWallets();
  const [position, setPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
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

  const calculateYield = () => {
    if (!position) return { amount: '0.00', percentage: '0.00' };

    // Yield = assets_in_vault - (total_deposited - total_withdrawn)
    const deposited = BigInt(position.total_deposited);
    const withdrawn = BigInt(position.total_withdrawn);
    const current = BigInt(position.assets_in_vault);
    const netDeposited = deposited - withdrawn;
    const yieldAmount = current - netDeposited;

    const percentage = netDeposited > BigInt(0)
      ? ((Number(yieldAmount) / Number(netDeposited)) * 100).toFixed(2)
      : '0.00';

    return {
      amount: formatUSDC(yieldAmount.toString()),
      percentage,
    };
  };

  if (isLoading) {
    return (
      <div className="card">
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
      <div className="card">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">Your Position</h3>
        <p className="text-sm text-[#991B1B]">{error}</p>
      </div>
    );
  }

  if (!position || !vaultId) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">Your Position</h3>
        <p className="text-sm text-[#64668B]">
          {!vaultId ? 'Vault not configured' : 'No active position'}
        </p>
      </div>
    );
  }

  const yieldData = calculateYield();

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#040217]">Your Position</h3>
      </div>

      <div className="space-y-4">
        {/* Current Value */}
        <div>
          <p className="text-sm text-[#64668B] mb-1">Current Value</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-[#040217]">
              ${formatUSDC(position.assets_in_vault)}
            </span>
            <span className="text-sm text-[#64668B]">{position.asset.symbol}</span>
          </div>
        </div>

        {/* Deposited Amount */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Total Deposited</span>
          <span className="text-sm font-medium text-[#040217]">
            ${formatUSDC(position.total_deposited)} {position.asset.symbol}
          </span>
        </div>

        {/* Yield Earned */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Yield Earned</span>
          <div className="text-right">
            <span className="text-sm font-medium text-[#135638]">
              +${yieldData.amount} {position.asset.symbol}
            </span>
            <span className="text-xs text-[#135638] ml-2">
              (+{yieldData.percentage}%)
            </span>
          </div>
        </div>

        {/* Shares */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Vault Shares</span>
          <span className="text-sm font-mono text-[#040217]">
            {Number(position.shares_in_vault).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
