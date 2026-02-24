'use client';

import { useEffect, useState } from 'react';
import { getVaultId, truncateAddress } from '@/lib/constants';

interface VaultInfo {
  id: string;
  provider: string;
  vault_address: string;
  asset_address: string;
  caip2: string;
  user_apy: number | null; // APY in basis points (e.g., 500 = 5%)
  tvl_usd: number | null;
  available_liquidity_usd: number | null;
}

export function FeeRecipientCard() {
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vaultId = getVaultId();

  useEffect(() => {
    async function fetchVaultInfo() {
      if (!vaultId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/vault?vault_id=${vaultId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch vault info');
        }

        const data = await response.json();
        setVaultInfo(data);
      } catch (err) {
        console.error('Error fetching vault info:', err);
        setError(err instanceof Error ? err.message : 'Failed to load vault info');
      } finally {
        setIsLoading(false);
      }
    }

    fetchVaultInfo();
  }, [vaultId]);

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 bg-[#F1F2F9]">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">Vault Info</h3>
        <div className="space-y-3">
          <div className="h-6 w-24 bg-white/50 rounded animate-pulse" />
          <div className="h-8 w-32 bg-white/50 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 bg-[#F1F2F9]">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">Vault Info</h3>
        <p className="text-sm text-[#991B1B]">{error}</p>
      </div>
    );
  }

  if (!vaultInfo || !vaultId) {
    return (
      <div className="rounded-2xl p-6 bg-[#F1F2F9]">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">Vault Info</h3>
        <p className="text-sm text-[#64668B]">Vault not configured</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-[#F1F2F9]">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#040217]">Vault Info</h3>
      </div>

      <div>
        {/* User APY — headline */}
        <div className="mb-4">
          <p className="text-sm text-[#64668B] mb-1">User APY</p>
          <span className="text-2xl font-semibold text-[#135638]">
            {vaultInfo.user_apy !== null ? `${(vaultInfo.user_apy / 100).toFixed(2)}%` : '--'}
          </span>
        </div>

        {/* Provider */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Provider</span>
          <span className="text-sm font-medium text-[#040217]">
            {vaultInfo.provider}
          </span>
        </div>

        {/* Vault Address */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Vault Address</span>
          <a
            href={`https://basescan.org/address/${vaultInfo.vault_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-[#5B4FFF] hover:underline"
          >
            {truncateAddress(vaultInfo.vault_address)}
          </a>
        </div>

        {/* Asset Address */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Asset Address</span>
          <a
            href={`https://basescan.org/address/${vaultInfo.asset_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-[#5B4FFF] hover:underline"
          >
            {truncateAddress(vaultInfo.asset_address)}
          </a>
        </div>

        {/* CAIP-2 */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Chain (CAIP-2)</span>
          <span className="text-sm font-medium text-[#040217]">
            {vaultInfo.caip2}
          </span>
        </div>

        {/* TVL */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">TVL (USD)</span>
          <span className="text-sm font-medium text-[#040217]">
            {vaultInfo.tvl_usd !== null ? `$${vaultInfo.tvl_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
          </span>
        </div>

        {/* Available Liquidity */}
        <div className="flex justify-between items-center py-3 border-t border-[#E2E3F0]">
          <span className="text-sm text-[#64668B]">Available Liquidity (USD)</span>
          <span className="text-sm font-medium text-[#040217]">
            {vaultInfo.available_liquidity_usd !== null ? `$${vaultInfo.available_liquidity_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
          </span>
        </div>
      </div>
    </div>
  );
}
