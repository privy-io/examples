import { motion } from "motion/react";
import { GlassCard } from "./GlassCard";
import { TransactionItem } from "./TransactionItem";

interface Transaction {
  type: "send" | "receive";
  amount: string;
  timestamp: string;
  hash?: string;
  memo?: string;
}

interface RecentActivityProps {
  transactions: Transaction[];
  loading?: boolean;
  error?: string | null;
}

export function RecentActivity({
  transactions,
  loading = false,
  error = null,
}: RecentActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <GlassCard>
        <h3
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "var(--text-tertiary)" }}
        >
          Recent Activity
        </h3>
        <div className="space-y-4">
          {loading ? (
            <div
              className="h-20 rounded animate-pulse"
              style={{ background: "rgba(255, 255, 255, 0.1)" }}
            />
          ) : error ? (
            <p
              className="text-xs text-center py-4"
              style={{ color: "var(--text-tertiary)" }}
            >
              Unable to load transactions
            </p>
          ) : transactions.length === 0 ? (
            <p
              className="text-xs text-center py-4"
              style={{ color: "var(--text-tertiary)" }}
            >
              No transactions yet
            </p>
          ) : (
            transactions.map((tx, index) => (
              <motion.div
                key={tx.hash || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <TransactionItem
                  type={tx.type}
                  amount={tx.amount}
                  timestamp={tx.timestamp}
                  memo={tx.memo}
                />
              </motion.div>
            ))
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
