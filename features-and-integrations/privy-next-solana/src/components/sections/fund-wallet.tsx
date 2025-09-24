"use client";

import { useState, useMemo, useEffect } from "react";
import { useSolanaWallets as useWalletsSolana } from "@privy-io/react-auth";
import Section from "../reusables/section";
import { useFundWallet as useFundWalletSolana } from "@privy-io/react-auth/solana";
import { showErrorToast } from "../ui/custom-toast";

type WalletInfo = {
  address: string;
  type: "solana";
  name: string;
};

const FundWallet = () => {
  const { wallets: walletsSolana } = useWalletsSolana();
  const { fundWallet: fundWalletSolana } = useFundWalletSolana();

  const allWallets = useMemo((): WalletInfo[] => {
    const solanaWallets: WalletInfo[] = walletsSolana.map((wallet) => ({
      address: wallet.address,
      type: "solana" as const,
      name: wallet.address,
    }));

    return solanaWallets;
  }, [walletsSolana]);

  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  useEffect(() => {
    if (allWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(allWallets[0]);
    }
  }, [allWallets, selectedWallet]);

  const fundWalletSolanaHandler = (asset?: "USDC" | "native-currency") => {
    if (!selectedWallet) {
      showErrorToast("Please select a Solana wallet");
      return;
    }
    try {
      fundWalletSolana(selectedWallet.address, {
        amount: "1",
        ...(asset && { asset }),
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to fund wallet. Please try again.");
    }
  };

  const availableActions = [
    {
      name: "Fund SOL",
      function: fundWalletSolanaHandler,
      disabled: false,
    },
    {
      name: "Fund USDC (Solana)",
      function: () => {
        fundWalletSolanaHandler("USDC");
      },
      disabled: false,
    },
  ];

  return (
    <Section
      name="Fund wallet"
      description={
        "Fund Solana wallet using a card, exchange, or external wallet. Privy has bridging integration out of the box powered by Relay reservoir."
      }
      filepath="src/components/sections/fund-wallet"
      actions={availableActions}
    >
      <div className="mb-4">
        <label
          htmlFor="fund-wallet-select"
          className="block text-sm font-medium mb-2"
        >
          Select wallet:
        </label>
        <div className="relative">
          <select
            id="fund-wallet-select"
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
    </Section>
  );
};

export default FundWallet;