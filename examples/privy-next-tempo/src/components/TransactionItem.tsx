interface TransactionItemProps {
  type: "send" | "receive";
  amount: string;
  timestamp: string;
  memo?: string;
}

export function TransactionItem({
  type,
  amount,
  timestamp,
  memo,
}: TransactionItemProps) {
  const isSend = type === "send";
  const iconColor = isSend
    ? "var(--accent-primary-solid)"
    : "var(--accent-success-solid)";
  const amountColor = isSend
    ? "var(--text-secondary)"
    : "var(--accent-success-solid)";

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-4 flex-1">
        <div
          className="w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke={iconColor}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d={
                isSend
                  ? "M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  : "M12 4v16m0 0l-4-4m4 4l4-4"
              }
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p
              className="text-sm font-light"
              style={{ color: "var(--text-primary)" }}
            >
              {isSend ? "Sent" : "Received"}
            </p>
            {memo && (
              <p
                className="text-xs truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                • {memo}
              </p>
            )}
          </div>
          <p
            className="text-xs font-mono"
            style={{ color: "var(--text-tertiary)" }}
          >
            {timestamp}
          </p>
        </div>
      </div>
      <span
        className="text-sm font-light flex-shrink-0 ml-2"
        style={{ color: amountColor }}
      >
        {isSend ? "-" : "+"}
        {amount}
      </span>
    </div>
  );
}
