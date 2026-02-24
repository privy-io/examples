"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { formatUSDC, truncateAddress } from "@/lib/constants";

interface Transaction {
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

function formatTimestamp(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TypeBadge({ type }: { type: string }) {
  const isDeposit = type === "deposit";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isDeposit
          ? "bg-[#DCFCE7] text-[#135638]"
          : "bg-[#FEE2E2] text-[#991B1B]"
      }`}
    >
      {isDeposit ? "Deposit" : "Withdrawal"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-[#FEF3C7] text-[#906218]",
    confirmed: "bg-[#DCFCE7] text-[#135638]",
    failed: "bg-[#FEE2E2] text-[#991B1B]",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
        styles[status] ?? "bg-[#F1F2F9] text-[#64668B]"
      }`}
    >
      {status}
    </span>
  );
}

export function TransactionHistory({
  refreshKey,
  walletId,
}: {
  refreshKey: number;
  walletId?: string;
}) {
  const { user } = usePrivy();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const derivedWalletId = user?.linkedAccounts?.find(
    (a): a is Extract<typeof a, { type: "wallet" }> =>
      a.type === "wallet" &&
      "walletClientType" in a &&
      a.walletClientType === "privy",
  )?.id;
  const privyWalletId = walletId || derivedWalletId;

  const fetchTransactions = useCallback(async () => {
    if (!privyWalletId) return;

    try {
      const response = await fetch(
        `/api/transactions?wallet_id=${privyWalletId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load transactions",
      );
    } finally {
      setIsLoading(false);
    }
  }, [privyWalletId]);

  // Poll every 5 seconds + re-fetch on refreshKey change
  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [fetchTransactions, refreshKey]);

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">
          Transaction History
        </h3>
        <div className="space-y-3">
          <div className="h-12 w-full bg-white/50 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-white/50 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-white/50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">
          Transaction History
        </h3>
        <p className="text-sm text-[#991B1B]">{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-white">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">
          Transaction History
        </h3>
        <p className="text-sm text-[#64668B]">
          No transactions yet. Make a deposit or withdrawal to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-white">
      <h3 className="text-lg font-semibold text-[#040217] mb-4">
        Transaction History
      </h3>

      <div className="space-y-2">
        {transactions.map((tx) => {
          const isDeposit = tx.type === "deposit";
          const sign = isDeposit ? "+" : "-";

          return (
            <div
              key={tx.id}
              className="bg-white rounded-xl p-4 border border-[#E2E3F0] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={tx.type} />
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              </div>

              <span
                className={`text-sm font-medium whitespace-nowrap ${
                  isDeposit ? "text-[#135638]" : "text-[#991B1B]"
                }`}
              >
                {sign}${formatUSDC(tx.asset_amount)} USDC
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
