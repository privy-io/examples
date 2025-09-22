"use client";
import { useState, useMemo, useEffect } from "react";
import { useSolanaWallets } from "@privy-io/react-auth";
import {
  useImportWallet as useImportWalletSolana,
  useExportWallet as useExportWalletSolana,
} from "@privy-io/react-auth/solana";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";

type WalletInfo = {
  address: string;
  type: "solana";
  name: string;
  isPrivy?: boolean;
};

const WalletManagement = () => {
  const { wallets: walletsSolana } = useSolanaWallets();
  const { exportWallet: exportWalletSolana } = useExportWalletSolana();
  const { importWallet: importWalletSolana } = useImportWalletSolana();

  const allWallets = useMemo((): WalletInfo[] => {
    const solanaWallets: WalletInfo[] = walletsSolana.map((wallet) => ({
      address: wallet.address,
      type: "solana" as const,
      name: wallet.address,
      isPrivy: wallet.walletClientType === "privy",
    }));

    return solanaWallets;
  }, [walletsSolana]);

  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [privateKey, setPrivateKey] = useState<string>("");

  useEffect(() => {
    if (allWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(allWallets[0]);
    }
  }, [allWallets, selectedWallet]);

  const handleExportWallet = async () => {
    if (!selectedWallet) {
      showErrorToast("Please select a wallet to export");
      return;
    }

    if (!selectedWallet.isPrivy) {
      showErrorToast("Only Privy wallets can be exported");
      return;
    }

    try {
      await exportWalletSolana({ address: selectedWallet.address });
      showSuccessToast("Solana wallet exported");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to export wallet";
      showErrorToast(message);
    }
  };

  const handleImportSolana = async () => {
    if (!privateKey) {
      showErrorToast("Please enter a private key");
      return;
    }
    try {
      await importWalletSolana({ privateKey });
      showSuccessToast("Solana wallet imported successfully");
      setPrivateKey("");
    } catch (error) {
      const message = error?.toString?.() ?? "Failed to import Solana wallet";
      showErrorToast(message);
    }
  };

  const isPrivateKeyEmpty = !privateKey.trim();

  const availableActions = [
    {
      name: "Export selected wallet",
      function: handleExportWallet,
      disabled: !selectedWallet || !selectedWallet.isPrivy,
    },
    {
      name: "Import wallet (Solana)",
      function: handleImportSolana,
      disabled: isPrivateKeyEmpty,
    },
  ];

  return (
    <Section
      name="Wallet management"
      description={
        "Export your embedded Solana wallet or import an external private key for Solana network."
      }
      filepath="src/components/sections/wallet-management"
      actions={availableActions}
    >
      <div className="mb-4">
        <label
          htmlFor="wallet-management-select"
          className="block text-sm font-medium mb-2"
        >
          Select wallet to export:
        </label>
        <div className="relative">
          <select
            id="wallet-management-select"
            value={selectedWallet?.address || ""}
            onChange={(e) => {
              const wallet = allWallets.find(
                (w) => w.address === e.target.value
              );
              setSelectedWallet(wallet || null);
            }}
            className="w-full pl-3 pr-8 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black appearance-none"
          >
            {allWallets.length === 0 ? (
              <option value="">No wallets available</option>
            ) : (
              <>
                <option value="">Select a wallet</option>
                {allWallets.map((wallet) => (
                  <option key={wallet.address} value={wallet.address}>
                    {wallet.address} [solana]
                  </option>
                ))}
              </>
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Private key for Solana wallet import (base58 format)
        </label>
        <input
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="Enter private key to import Solana wallet (base58 format)"
          className="w-full px-3 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>
    </Section>
  );
};

export default WalletManagement;