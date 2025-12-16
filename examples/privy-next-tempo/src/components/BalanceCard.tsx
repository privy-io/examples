import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";

interface BalanceCardProps {
  balance: string;
  walletAddress: string;
  onCopyAddress: () => void;
  loading?: boolean;
}

export function BalanceCard({
  balance,
  walletAddress,
  onCopyAddress,
  loading = false,
}: BalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <GlassCard padding="lg" className="mb-6">
      <p
        className="text-xs tracking-widest uppercase mb-6"
        style={{ color: "var(--text-tertiary)" }}
      >
        Total Balance
      </p>
      <div className="flex items-baseline gap-3 mb-8 flex-wrap">
        {loading && balance === "0.00" ? (
          <div
            className="h-16 w-48 rounded animate-pulse"
            style={{ background: "rgba(255, 255, 255, 0.1)" }}
          />
        ) : (
          <>
            <h2
              className="text-5xl sm:text-6xl font-light tracking-tight tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {balance}
            </h2>
            <span
              className="text-xl font-light"
              style={{ color: "var(--text-secondary)" }}
            >
              USDC
            </span>
          </>
        )}
      </div>
      <div
        className="flex items-center gap-2 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        <span className="truncate font-mono text-xs">
          {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
        </span>
        <button
          onClick={onCopyAddress}
          className="transition-colors p-1"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-secondary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-tertiary)")
          }
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
    </GlassCard>
    </motion.div>
  );
}
