"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import { ConnectedStandardSolanaWallet } from "@privy-io/react-auth/solana";

interface SendTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWallet: ConnectedStandardSolanaWallet | null;
  onSend: (
    wallet: ConnectedStandardSolanaWallet,
    toAddress: string,
    amount: string,
  ) => void;
}

export function SendTransactionModal({
  isOpen,
  onClose,
  selectedWallet,
  onSend,
}: SendTransactionModalProps) {
  const [toAddress, setToAddress] = useState("");
  const [solAmount, setSolAmount] = useState("");

  const handleSend = () => {
    if (selectedWallet && toAddress && solAmount) {
      onSend(selectedWallet, toAddress, solAmount);
      onClose();
      setToAddress("");
      setSolAmount("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Transaction"
      description="Send SOL to another wallet address"
    >
      <div className="space-y-4">
        <Input
          label="To"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Enter recipient address"
        />
        <Input
          label="SOL Amount"
          type="number"
          step="0.001"
          value={solAmount}
          onChange={(e) => setSolAmount(e.target.value)}
          placeholder="0.0"
        />
        <Button
          onClick={handleSend}
          disabled={!selectedWallet || !toAddress || !solAmount}
          className="w-full"
        >
          Send Transaction
        </Button>
      </div>
    </Modal>
  );
}
