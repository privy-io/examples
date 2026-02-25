"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { formatUSDC } from "@/lib/constants";

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
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = String(hours % 12 || 12).padStart(2, "0");
  return `${month}/${day}/${year} ${displayHours}:${minutes} ${ampm}`;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { style: string; label: string }> = {
    pending: { style: "bg-[#FEF3C7] text-[#906218]", label: "Pending" },
    confirmed: { style: "bg-[#DCFCE7] text-[#135638]", label: "Successful" },
    failed: { style: "bg-[#FEE2E2] text-[#991B1B]", label: "Failed" },
  };

  const { style, label } = config[status] ?? {
    style: "bg-[#F1F2F9] text-[#64668B]",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style}`}
    >
      {label}
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
      <div className="rounded-2xl p-6 bg-white border border-[#E2E3F0]">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">
          Transaction history
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
      <div className="rounded-2xl p-6 bg-white border border-[#E2E3F0]">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">
          Transaction history
        </h3>
        <p className="text-sm text-[#991B1B]">{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-white border border-[#E2E3F0]">
        <h3 className="text-lg font-semibold text-[#040217] mb-4">
          Transaction history
        </h3>
        <p className="text-sm text-[#64668B]">
          No transactions yet. Make a deposit or withdrawal to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-white border border-[#E2E3F0]">
      <h3 className="text-lg font-semibold text-[#040217] mb-4">
        Transaction history
      </h3>

      <div>
        {transactions.map((tx, index) => {
          const isDeposit = tx.type === "deposit";

          return (
            <div
              key={tx.id}
              className={`flex items-center justify-between py-3 ${
                index < transactions.length - 1
                  ? "border-b border-[#E2E3F0]"
                  : ""
              }`}
            >
              <span className="text-sm font-semibold text-[#040217]">
                {isDeposit ? "Deposited" : "Withdrew"} $
                {formatUSDC(tx.asset_amount)} USDC
              </span>
              <span className="text-sm text-[#64668B]">
                {formatTimestamp(tx.created_at)}
              </span>
              <StatusBadge status={tx.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
