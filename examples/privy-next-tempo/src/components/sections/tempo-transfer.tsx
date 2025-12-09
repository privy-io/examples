"use client";

import { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { useAccount, useWatchBlockNumber, useSwitchChain } from "wagmi";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { Hooks } from "tempo.ts/wagmi";
import { formatUnits, parseUnits } from "viem";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";
import { alphaUsd, tempoChain } from "@/providers/providers";

const TempoTransfer = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const account = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  useEffect(() => {
    if (wallets.length > 0 && !account.address) {
      const evmWallet = wallets.find((w) => w.type === "ethereum");
      if (evmWallet) {
        setActiveWallet(evmWallet);
      }
    }
  }, [wallets, account.address, setActiveWallet]);

  useEffect(() => {
    if (account.address && account.chainId !== tempoChain.id) {
      switchChain({ chainId: tempoChain.id });
    }
  }, [account.address, account.chainId, switchChain]);

  const isOnTempoChain = account.chainId === tempoChain.id;

  const metadata = Hooks.token.useGetMetadata({
    token: alphaUsd,
    chainId: tempoChain.id,
  });

  const balance = Hooks.token.useGetBalance({
    account: account?.address,
    token: alphaUsd,
    chainId: tempoChain.id,
  });

  useWatchBlockNumber({
    onBlockNumber() {
      balance.refetch();
    },
  });

  const transfer = Hooks.token.useTransferSync();
  const fundWallet = Hooks.faucet.useFundSync();

  const hasZeroBalance = !balance.data || balance.data === BigInt(0);

  const handleTransfer = () => {
    if (!account.address) {
      showErrorToast("Please connect a wallet first");
      return;
    }
    if (!recipient || !recipient.startsWith("0x")) {
      showErrorToast("Please enter a valid recipient address");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      showErrorToast("Please enter a valid amount");
      return;
    }

    const decimals = metadata.data?.decimals ?? 6;

    transfer.mutate(
      {
        amount: parseUnits(amount, decimals),
        to: recipient as `0x${string}`,
        token: alphaUsd,
        feeToken: alphaUsd,
      },
      {
        onSuccess: (data) => {
          showSuccessToast(
            `Transfer successful! Hash: ${data.receipt.transactionHash.slice(0, 16)}...`
          );
          setAmount("");
          setRecipient("");
          balance.refetch();
        },
        onError: (error) => {
          console.error("Transfer error:", error);
          showErrorToast(`Transfer failed: ${error.message}`);
        },
      }
    );
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: tempoChain.id });
  };

  const handleFundWallet = () => {
    if (!account.address) {
      showErrorToast("Please connect a wallet first");
      return;
    }

    fundWallet.mutate(
      {
        account: account.address,
      },
      {
        onSuccess: () => {
          showSuccessToast("Wallet funded successfully!");
          balance.refetch();
        },
        onError: (error) => {
          console.error("Fund wallet error:", error);
          showErrorToast(`Failed to fund wallet: ${error.message}`);
        },
      }
    );
  };

  const availableActions = isOnTempoChain
    ? [
        {
          name: transfer.isPending ? "Sending..." : "Send Transfer",
          function: handleTransfer,
          disabled: transfer.isPending || !account.address,
        },
      ]
    : [
        {
          name: isSwitching ? "Switching..." : "Switch to Tempo Testnet",
          function: handleSwitchChain,
          disabled: isSwitching,
        },
      ];

  const formattedBalance = balance.data
    ? formatUnits(balance.data, metadata.data?.decimals ?? 6)
    : "0";

  return (
    <Section
      name="Tempo TIP-20 Transfer"
      description="Send TIP-20 tokens on Tempo testnet. Gas fees are paid in the feeToken (AlphaUSD)."
      filepath="src/components/sections/tempo-transfer"
      actions={availableActions}
    >
      <div className="space-y-4">
        <div className="p-4 bg-[#F5F7FF] rounded-lg">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Connected Wallet:</span>
              <span className="text-sm font-mono">
                {account.address
                  ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
                  : "Not connected"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Network:</span>
              <span className={`text-sm font-semibold ${isOnTempoChain ? "text-green-600" : "text-orange-500"}`}>
                {isOnTempoChain ? "Tempo Testnet ✓" : `Chain ${account.chainId} (switch required)`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {metadata.data?.name ?? "Token"} Balance:
              </span>
              <span className="text-sm font-semibold">
                {balance.isLoading ? (
                  "Loading..."
                ) : (
                  <>
                    {formattedBalance} {metadata.data?.symbol ?? ""}
                  </>
                )}
              </span>
            </div>
          </div>

          {hasZeroBalance && isOnTempoChain && account.address && (
            <button
              onClick={handleFundWallet}
              disabled={fundWallet.isPending}
              className="w-full mt-3 px-4 py-2 bg-[#5B4FFF] text-white rounded-md hover:bg-[#4A3FE6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {fundWallet.isPending ? "Funding..." : "🚰 Fund Wallet with Testnet Tokens"}
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="recipient"
              className="block text-sm font-medium mb-1"
            >
              Recipient Address
            </label>
            <input
              id="recipient"
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount ({metadata.data?.symbol ?? "tokens"})
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              className="w-full px-3 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {transfer.data && (
          <div className="p-3 bg-[#DCFCE7] border border-[#87D7B7] rounded-lg">
            <p className="text-sm text-gray-700">
              Last transaction:{" "}
              <a
                href={`https://explore.tempo.xyz/tx/${transfer.data.receipt.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5B4FFF] underline"
              >
                View on Explorer
              </a>
            </p>
          </div>
        )}
      </div>
    </Section>
  );
};

export default TempoTransfer;
