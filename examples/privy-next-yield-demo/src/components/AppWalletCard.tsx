'use client';

import { useEffect, useState } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { USDC_ADDRESS, USDC_DECIMALS, truncateAddress, getFeeRecipientWalletId } from '@/lib/constants';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function AppWalletCard() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const feeRecipientWalletId = getFeeRecipientWalletId();

  // Resolve the on-chain address from the Privy wallet ID
  useEffect(() => {
    async function resolveAddress() {
      if (!feeRecipientWalletId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/wallet-address?wallet_id=${feeRecipientWalletId}`);
        if (!res.ok) throw new Error('Failed to resolve wallet address');
        const data = await res.json();
        setWalletAddress(data.address);
      } catch (error) {
        console.error('Error resolving wallet address:', error);
        setIsLoading(false);
      }
    }

    resolveAddress();
  }, [feeRecipientWalletId]);

  // Fetch USDC balance once address is resolved
  useEffect(() => {
    async function fetchBalance() {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const balance = await publicClient.readContract({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [walletAddress as `0x${string}`],
        });

        setUsdcBalance(formatUnits(balance, USDC_DECIMALS));
      } catch (error) {
        console.error('Error fetching USDC balance:', error);
        setUsdcBalance('0.00');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="rounded-2xl p-6 bg-white">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-[#64668B]">App Wallet (Fee Recipient)</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-mono text-[#040217]">
            {isLoading && !walletAddress ? (
              <span className="inline-block h-4 w-28 bg-white/50 rounded animate-pulse" />
            ) : walletAddress ? (
              truncateAddress(walletAddress)
            ) : (
              'Not configured'
            )}
          </span>
          {walletAddress && (
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-white/50 rounded transition-colors"
              title="Copy address"
            >
              {copied ? (
                <svg className="w-4 h-4 text-[#135638]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#64668B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[#E2E3F0] pt-4">
        <p className="text-sm text-[#64668B] mb-1">USDC Balance</p>
        {isLoading ? (
          <div className="h-8 w-24 bg-white/50 rounded animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#040217]">
              ${formatBalance(usdcBalance)}
            </span>
            <span className="text-sm text-[#64668B]">USDC</span>
          </div>
        )}
      </div>
    </div>
  );
}
