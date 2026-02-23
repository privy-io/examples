'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { createPublicClient, http, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { USDC_ADDRESS, USDC_DECIMALS, truncateAddress } from '@/lib/constants';

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

export function WalletCard() {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [usdcBalance, setUsdcBalance] = useState<string>('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address;

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
    // Refresh balance every 30 seconds
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
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-[#64668B]">Your Wallet</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-mono text-[#040217]">
              {walletAddress ? truncateAddress(walletAddress) : 'No wallet'}
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
        <button
          onClick={logout}
          className="text-sm text-[#64668B] hover:text-[#040217] transition-colors"
        >
          Sign out
        </button>
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

      {walletAddress && (
        <div className="mt-4 p-3 bg-white rounded-xl border border-[#E2E3F0]">
          <p className="text-xs text-[#64668B] mb-2">Send USDC to this address to deposit:</p>
          <p className="text-xs font-mono text-[#040217] break-all">{walletAddress}</p>
          <p className="text-xs text-[#9498B8] mt-2">Network: Base</p>
        </div>
      )}

      {user?.email && (
        <p className="text-xs text-[#9498B8] mt-4">
          Signed in as {user.email.address}
        </p>
      )}
    </div>
  );
}
