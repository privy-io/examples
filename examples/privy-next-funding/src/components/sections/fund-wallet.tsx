"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAddFunds,
  useDepositAddress as useDepositAddressModal,
  useFiatOnramp,
  useFundWalletWithBankDeposit,
  useWallets as useEthereumWallets,
} from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";

import Section from "../reusables/section";

type FlowKey = "add-funds" | "deposit-address" | "fiat-onramp" | "bank-deposit";

type FlowState = {
  inProgress: FlowKey | null;
  error: string | null;
  message: string | null;
};

type WalletChainType = "ethereum" | "solana";

type FundingWallet = {
  address: string;
  chainType: WalletChainType;
};

type FundingDestination = {
  address: string;
  chain: `${string}:${string}`;
  asset: string;
};

type BankDepositDestination = FundingDestination & {
  asset: "usdc";
};

const BASE_CHAIN = "eip155:8453" as const;
const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const SOLANA_CHAIN = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" as const;
const SOLANA_USDC_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOLANA_BANK_DEPOSIT_CHAIN = "solana:mainnet" as const;

const DEFAULT_USDC_DESTINATIONS = {
  ethereum: {
    chain: BASE_CHAIN,
    asset: BASE_USDC_ADDRESS,
  },
  solana: {
    chain: SOLANA_CHAIN,
    asset: SOLANA_USDC_ADDRESS,
  },
} satisfies Record<WalletChainType, Omit<FundingDestination, "address">>;

const BANK_DEPOSIT_DESTINATIONS = {
  ethereum: {
    chain: BASE_CHAIN,
    asset: "usdc",
  },
  solana: {
    chain: SOLANA_BANK_DEPOSIT_CHAIN,
    asset: "usdc",
  },
} satisfies Record<WalletChainType, Omit<BankDepositDestination, "address">>;

const getWalletId = (wallet: FundingWallet) =>
  `${wallet.chainType}:${wallet.address}`;

const FLOW_LABELS: Record<FlowKey, string> = {
  "add-funds": "Unified funding",
  "deposit-address": "Deposit address",
  "fiat-onramp": "Fiat onramp",
  "bank-deposit": "Bank deposit",
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Action could not be completed. Check the dashboard configuration and try again";

const FundWallet = () => {
  const { wallets: ethereumWallets } = useEthereumWallets();
  const { wallets: solanaWallets } = useSolanaWallets();
  const { addFunds } = useAddFunds();
  const { createDepositAddress } = useDepositAddressModal();
  const { fund: fundWithFiat } = useFiatOnramp();
  const { fund: fundWithBankDeposit } = useFundWalletWithBankDeposit();

  const wallets = useMemo<FundingWallet[]>(
    () => [
      ...ethereumWallets.map((wallet) => ({
        address: wallet.address,
        chainType: "ethereum" as const,
      })),
      ...solanaWallets.map((wallet) => ({
        address: wallet.address,
        chainType: "solana" as const,
      })),
    ],
    [ethereumWallets, solanaWallets],
  );

  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [state, setState] = useState<FlowState>({
    inProgress: null,
    error: null,
    message: null,
  });

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => getWalletId(wallet) === selectedWalletId),
    [selectedWalletId, wallets],
  );

  useEffect(() => {
    if (!selectedWalletId && wallets[0]) {
      setSelectedWalletId(getWalletId(wallets[0]));
      return;
    }

    if (
      selectedWalletId &&
      wallets.every((wallet) => getWalletId(wallet) !== selectedWalletId)
    ) {
      setSelectedWalletId(wallets[0] ? getWalletId(wallets[0]) : "");
    }
  }, [selectedWalletId, wallets]);

  const runFlow = async (
    flow: FlowKey,
    action: (wallet: NonNullable<typeof selectedWallet>) => Promise<void>,
  ) => {
    setState({ inProgress: flow, error: null, message: null });

    try {
      if (!selectedWallet) {
        throw new Error("Create or select a wallet before funding");
      }

      const wallet = selectedWallet;
      await action(wallet);
      setState({
        inProgress: null,
        error: null,
        message: `${FLOW_LABELS[flow]} flow completed`,
      });
    } catch (error) {
      setState({
        inProgress: null,
        error: getErrorMessage(error),
        message: null,
      });
    }
  };

  const getFundingDestination = (
    wallet: FundingWallet,
  ): FundingDestination => ({
    address: wallet.address,
    ...DEFAULT_USDC_DESTINATIONS[wallet.chainType],
  });

  const getBankDepositDestination = (
    wallet: FundingWallet,
  ): BankDepositDestination => ({
    address: wallet.address,
    ...BANK_DEPOSIT_DESTINATIONS[wallet.chainType],
  });

  const isBusy = Boolean(state.inProgress);

  const availableActions = [
    {
      name:
        state.inProgress === "add-funds"
          ? "Opening unified funding"
          : "Open unified funding",
      function: () => {
        void runFlow("add-funds", async (wallet) => {
          await addFunds({
            destination: getFundingDestination(wallet),
            fiat: {
              source: { assets: ["usd"], defaultAsset: "usd" },
              defaultAmount: "25",
              environment: "production",
            },
            crypto: {},
          });
        });
      },
      disabled: isBusy || !selectedWallet,
    },
    {
      name:
        state.inProgress === "deposit-address"
          ? "Opening deposit address"
          : "Open deposit address",
      function: () => {
        void runFlow("deposit-address", async (wallet) => {
          const destination = getFundingDestination(wallet);

          await createDepositAddress({
            destinationChain: destination.chain,
            destinationCurrency: destination.asset,
            destinationAddress: destination.address,
          });
        });
      },
      disabled: isBusy || !selectedWallet,
    },
    {
      name:
        state.inProgress === "fiat-onramp"
          ? "Opening fiat onramp"
          : "Open fiat onramp",
      function: () => {
        void runFlow("fiat-onramp", async (wallet) => {
          await fundWithFiat({
            source: { assets: ["usd"], defaultAsset: "usd" },
            destination: getFundingDestination(wallet),
            defaultAmount: "25",
            environment: "production",
          });
        });
      },
      disabled: isBusy || !selectedWallet,
    },
    {
      name:
        state.inProgress === "bank-deposit"
          ? "Opening bank deposit"
          : "Open bank deposit",
      function: () => {
        void runFlow("bank-deposit", async (wallet) => {
          await fundWithBankDeposit({
            source: { assets: ["usd", "eur", "gbp"], defaultAsset: "usd" },
            destination: getBankDepositDestination(wallet),
            provider: "bridge-sandbox",
          });
        });
      },
      disabled: isBusy || !selectedWallet,
    },
  ];

  return (
    <Section
      name="Fund wallet"
      description="Explore funding flows for a selected Ethereum or Solana wallet, including sandbox bank deposit instructions."
      filepath="src/components/sections/fund-wallet.tsx"
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
            value={selectedWalletId}
            onChange={(event) => setSelectedWalletId(event.target.value)}
            className="w-full pl-3 pr-8 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black appearance-none"
          >
            {wallets.length === 0 ? (
              <option value="">No wallets available</option>
            ) : (
              <>
                <option value="">Select a wallet</option>
                {wallets.map((wallet) => (
                  <option key={getWalletId(wallet)} value={getWalletId(wallet)}>
                    {wallet.address} [{wallet.chainType}]
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
        {state.inProgress ? (
          <p className="mt-2 text-sm font-light text-[#4B4B5A]">
            {FLOW_LABELS[state.inProgress]} is in progress. Complete or close
            the Privy modal to continue.
          </p>
        ) : null}
        {state.error ? (
          <p className="mt-2 text-sm font-light text-red-700">{state.error}</p>
        ) : null}
        {state.message ? (
          <p className="mt-2 text-sm font-light text-green-700">
            {state.message}
          </p>
        ) : null}
      </div>
    </Section>
  );
};

export default FundWallet;
