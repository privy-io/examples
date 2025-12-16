import { Input } from "./Input";
import { LiquidGlassButton } from "./LiquidGlassButton";
import { Modal } from "./Modal";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientAddress: string;
  onRecipientChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  memo: string;
  onMemoChange: (value: string) => void;
  onConfirm: () => void;
  isSending?: boolean;
  error?: string | null;
  txHash?: string | null;
}

export function SendModal({
  isOpen,
  onClose,
  recipientAddress,
  onRecipientChange,
  amount,
  onAmountChange,
  memo,
  onMemoChange,
  onConfirm,
  isSending = false,
  error = null,
  txHash = null,
}: SendModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send USDC">
      <div className="space-y-6">
        {txHash ? (
          <div className="text-center space-y-4">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: "var(--accent-success)",
                border: "1px solid var(--accent-success-solid)",
              }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="var(--accent-success-solid)"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              Transaction sent successfully!
            </p>
            <p
              className="text-xs font-mono break-all"
              style={{ color: "var(--text-secondary)" }}
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </p>
            <LiquidGlassButton
              onClick={onClose}
              fullWidth
              className="py-3 text-sm mt-4"
            >
              <span className="uppercase tracking-wider">Done</span>
            </LiquidGlassButton>
          </div>
        ) : error ? (
          <div className="text-center space-y-4">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
              }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="#ef4444"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              Transaction failed
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {error}
            </p>
            <LiquidGlassButton
              onClick={onClose}
              fullWidth
              className="py-3 text-sm mt-4"
            >
              <span className="uppercase tracking-wider">Close</span>
            </LiquidGlassButton>
          </div>
        ) : (
          <>
            <Input
              label="Recipient"
              value={recipientAddress}
              onChange={onRecipientChange}
              placeholder="Email, phone, or 0x..."
              onEnter={onConfirm}
            />
            <Input
              label="Amount"
              type="number"
              value={amount}
              onChange={onAmountChange}
              placeholder="0.00"
              onEnter={onConfirm}
            />
            <Input
              label="Memo (Optional)"
              value={memo}
              onChange={onMemoChange}
              placeholder="Add a note for this transaction"
              onEnter={onConfirm}
            />
            <LiquidGlassButton
              onClick={onConfirm}
              fullWidth
              className="py-3 text-sm"
            >
              {isSending ? (
                <span className="uppercase tracking-wider">Sending...</span>
              ) : (
                <span className="uppercase tracking-wider">Confirm Send</span>
              )}
            </LiquidGlassButton>
          </>
        )}
      </div>
    </Modal>
  );
}
