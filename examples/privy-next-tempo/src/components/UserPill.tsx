import { motion } from "motion/react";
import { usePrivy } from "@privy-io/react-auth";

export function UserPill() {
  const { user, logout } = usePrivy();

  const displayAddress = user?.wallet?.address || "";
  const shortAddress = displayAddress
    ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-4 right-4 z-20"
    >
      <div
        className="flex items-center gap-3 px-4 py-2 rounded-lg backdrop-blur-xl border border-white/50"
        style={{
          background: "rgba(255, 255, 255, 0.025)",
          color: "var(--text-primary)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: "var(--accent-primary)",
            border: "1px solid var(--accent-primary-solid)",
          }}
        >
          <span className="text-xs font-medium">
            {displayAddress ? displayAddress.slice(2, 4).toUpperCase() : ""}
          </span>
        </div>
        <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
          {shortAddress}
        </span>
        <button
          onClick={logout}
          className="p-1 rounded transition-colors hover:bg-white/20"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
