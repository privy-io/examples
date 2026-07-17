"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useDepositAddress,
  useFiatOnramp,
  useWallets as useWalletsEvm,
} from "@privy-io/react-auth";
import { useWallets as useWalletsSolana } from "@privy-io/react-auth/solana";
import Section from "../reusables/section";
import { showErrorToast } from "../ui/custom-toast";

type WalletInfo = {
  address: string;
  type: "ethereum" | "solana";
  name: string;
};

type FundingDestination = {
  address: string;
  chain: `${string}:${string}`;
  asset: string;
};

const BASE_CHAIN = "eip155:8453" as const;
const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const SOLANA_CHAIN = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" as const;
const SOLANA_USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const FUND_DESTINATIONS = {
  ethereum: { chain: BASE_CHAIN, asset: BASE_USDC },
  solana: { chain: SOLANA_CHAIN, asset: SOLANA_USDC },
} satisfies Record<
  WalletInfo["type"],
  { chain: `${string}:${string}`; asset: string }
>;

const FundWallet = () => {
  const { wallets: walletsEvm } = useWalletsEvm();
  const { wallets: walletsSolana } = useWalletsSolana();
  const { fund } = useFiatOnramp();
  const { createDepositAddress } = useDepositAddress();

  const allWallets = useMemo((): WalletInfo[] => {
    const evmWallets: WalletInfo[] = walletsEvm.map((wallet) => ({
      address: wallet.address,
      type: "ethereum" as const,
      name: wallet.address,
    }));

    const solanaWallets: WalletInfo[] = walletsSolana.map((wallet) => ({
      address: wallet.address,
      type: "solana" as const,
      name: wallet.address,
    }));

    return [...evmWallets, ...solanaWallets];
  }, [walletsEvm, walletsSolana]);

  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  useEffect(() => {
    if (allWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(allWallets[0]);
    }
  }, [allWallets, selectedWallet]);

  const getFundingDestination = (): FundingDestination | null => {
    if (!selectedWallet) {
      showErrorToast("Please select a wallet");
      return null;
    }

    return {
      address: selectedWallet.address,
      ...FUND_DESTINATIONS[selectedWallet.type],
    };
  };

  const fundWithFiat = () => {
    const destination = getFundingDestination();
    if (!destination) {
      return;
    }

    void fund({
      source: {},
      destination,
      defaultAmount: "15",
    }).catch((error) => {
      console.log(error);
      showErrorToast("Failed to add funds with fiat. Please try again.");
    });
  };

  const createDepositAddressHandler = () => {
    const destination = getFundingDestination();
    if (!destination) {
      return;
    }

    void createDepositAddress({
      destinationChain: destination.chain,
      destinationCurrency: destination.asset,
      destinationAddress: destination.address,
    }).catch((error) => {
      console.log(error);
      showErrorToast("Failed to create deposit address. Please try again.");
    });
  };

  const availableActions = [
    {
      name: "Add USDC via fiat",
      function: fundWithFiat,
      disabled: !selectedWallet,
    },
    {
      name: "Add USDC via crypto",
      function: createDepositAddressHandler,
      disabled: !selectedWallet,
    },
  ];
  return (
    <Section
      name="Add funds"
      description={
        "Add USDC using Privy's fiat onramp or deposit address flow."
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
                (w) => w.address === e.target.value,
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
                    {wallet.address} [
                    {wallet.type === "ethereum" ? "ethereum" : "solana"}]
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
