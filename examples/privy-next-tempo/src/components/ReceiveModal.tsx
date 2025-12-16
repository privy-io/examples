import { QRCodeSVG } from "qrcode.react";
import { Modal } from "./Modal";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onCopyAddress: () => void;
}

export function ReceiveModal({
  isOpen,
  onClose,
  walletAddress,
  onCopyAddress,
}: ReceiveModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive USDC">
      <div className="text-center space-y-6">
        <div
          className="p-6 rounded-lg inline-block backdrop-blur-xl"
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <div
            className="w-48 h-48 rounded-md flex items-center justify-center"
            style={{ background: "rgba(255, 255, 255, 0.95)" }}
          >
            <QRCodeSVG value={walletAddress} size={192} level="H" />
          </div>
        </div>
        <div>
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            Your Address
          </p>
          <div
            className="backdrop-blur-xl rounded-md px-4 py-3 flex items-center justify-between"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <span
              className="text-xs font-mono truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {walletAddress}
            </span>
            <button
              onClick={onCopyAddress}
              className="transition-colors ml-3"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-tertiary)")
              }
            >
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
