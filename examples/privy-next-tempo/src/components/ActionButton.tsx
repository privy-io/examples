import { LiquidGlassButton } from "./LiquidGlassButton";

interface ActionButtonProps {
  type: "send" | "receive" | "quicksend";
  onClick: () => void;
}

export function ActionButton({ type, onClick }: ActionButtonProps) {
  const isSend = type === "send";
  const isQuickSend = type === "quicksend";
  const isReceive = type === "receive";

  return (
    <LiquidGlassButton onClick={onClick} fullWidth>
      <div className="flex flex-col items-center gap-3">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d={
              isSend
                ? "M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                : isQuickSend
                  ? "M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  : "M12 4v16m0 0l-4-4m4 4l4-4"
            }
          />
        </svg>
        <span className="text-sm uppercase tracking-wider">
          {isSend ? "Send" : isQuickSend ? "Quick" : "Receive"}
        </span>
      </div>
    </LiquidGlassButton>
  );
}
