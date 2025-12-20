import { useFaucet } from "@/hooks/useFaucet";
import { motion } from "motion/react";

export function FaucetButton() {
  const { fund, isFunding, error, hashes, reset } = useFaucet();

  return (
    <div className="w-full space-y-2">
      <motion.button
        onClick={() => {
          reset();
          void fund();
        }}
        disabled={isFunding}
        whileHover={{ scale: isFunding ? 1 : 1.02 }}
        whileTap={{ scale: isFunding ? 1 : 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="relative w-full py-4 rounded-xl backdrop-blur-sm font-light tracking-wide transition-all duration-300 border border-sky-400/50 hover:bg-sky-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "rgba(56, 189, 248, 0.10)",
          color: "#38bdf8",
        }}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sky-400/20 via-transparent to-transparent opacity-70 pointer-events-none" />
        <div className="relative flex items-center justify-center gap-2">
          {isFunding ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="uppercase tracking-wider text-sm">
                Funding...
              </span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8 10L4 7"
                />
              </svg>
              <span className="uppercase tracking-wider text-sm">
                Faucet (fund my wallet)
              </span>
            </>
          )}
        </div>
      </motion.button>

      {error && (
        <p
          className="text-xs text-center"
          style={{ color: "var(--accent-error-solid)" }}
        >
          {error}
        </p>
      )}

      {hashes?.length ? (
        <p
          className="text-xs text-center font-mono"
          style={{ color: "var(--text-secondary)" }}
        >
          {hashes[0].slice(0, 10)}...{hashes[0].slice(-8)}
          {hashes.length > 1 ? ` (+${hashes.length - 1} more)` : ""}
        </p>
      ) : null}
    </div>
  );
}


