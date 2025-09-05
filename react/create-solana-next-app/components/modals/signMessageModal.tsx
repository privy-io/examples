"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Textarea } from "../ui/textarea";
import { ConnectedStandardSolanaWallet } from "@privy-io/react-auth/solana";

interface SignMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWallet: ConnectedStandardSolanaWallet | null;
  onSign: (wallet: ConnectedStandardSolanaWallet, message: string) => void;
}

export function SignMessageModal({
  isOpen,
  onClose,
  selectedWallet,
  onSign,
}: SignMessageModalProps) {
  const [message, setMessage] = useState("hello world");

  const handleSign = () => {
    if (selectedWallet) {
      onSign(selectedWallet, message);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign Message"
      description="Sign a message with your selected wallet"
    >
      <div className="space-y-4">
        <Textarea
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
        />
        <Button
          onClick={handleSign}
          disabled={!selectedWallet}
          className="w-full"
        >
          Sign
        </Button>
      </div>
    </Modal>
  );
}
