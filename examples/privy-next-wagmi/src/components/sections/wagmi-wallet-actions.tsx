"use client";

import { useEffect } from "react";
import { useWallets, useConnectWallet } from "@privy-io/react-auth";
import {
  Config,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
} from "wagmi";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";
import { useAccount } from "wagmi";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { parseEther } from "viem";
import { SendTransactionVariables } from "wagmi/query";

const WalletActions = () => {
  const { signMessage } = useSignMessage({
    mutation: {
      onSuccess: (data) => {
        showSuccessToast(`EVM Message signed: ${data.slice(0, 10)}...`);
      },
    },
  });
  const { sendTransaction } = useSendTransaction({
    mutation: {
      onSuccess: (data) => {
        showSuccessToast(`EVM Transaction sent: ${data.slice(0, 20)}...`);
      },
    },
  });
  const { signTypedData } = useSignTypedData({
    mutation: {
      onSuccess: (data) => {
        showSuccessToast(`Typed Data signed: ${data.slice(0, 10)}...`);
      },
    },
  });
  const { connectWallet } = useConnectWallet({
    onSuccess: ({ wallet }) => {
      showSuccessToast(
        "Successfully connected wallet: " + wallet.walletClientType,
      );
    },
    onError: (error) => {
      console.log(error);
      showErrorToast("Failed to connect wallet");
    },
  });
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();

  const selectedWallet = useAccount();

  useEffect(() => {
    if (wallets.length > 0 && !selectedWallet.address) {
      setActiveWallet(wallets[0]);
    }
  }, [selectedWallet, setActiveWallet, wallets]);

  const handleSignMessageEvm = () => {
    if (!selectedWallet.address) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      const message = "Hello, world!";
      signMessage({
        message,
        account: selectedWallet.address,
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign EVM message");
    }
  };

  const handleSendTransactionEvm = () => {
    if (!selectedWallet.address) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      const transactionRequest: SendTransactionVariables<Config, number> = {
        to: "0xF2A919977c6dE88dd8ed90feAADFcC5d65D66038" as `0x${string}`,
        value: parseEther("0.001"),
        type: "eip1559",
      };
      sendTransaction(transactionRequest);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to send EVM transaction");
    }
  };

  const handleSignTypedData = () => {
    if (!selectedWallet.address) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      // All properties on a domain are optional
      const domain = {
        name: "Ether Mail",
        version: "1",
        chainId: selectedWallet.chain?.id,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      } as const;

      // The named list of all type definitions
      const types = {
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },
        ],
      } as const;

      const message = {
        from: {
          name: "Cow",
          wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
          name: "Bob",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
      } as const;

      signTypedData({
        primaryType: "Mail",
        domain,
        types,
        message,
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign typed data");
    }
  };

  const handleConnectWallet = () => {
    try {
      connectWallet();
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to connect wallet");
    }
  };

  const availableActions = [
    {
      name: "Connect Wallet",
      function: handleConnectWallet,
    },
    {
      name: "Sign message (EVM)",
      function: handleSignMessageEvm,
    },
    {
      name: "Sign typed data (EVM)",
      function: handleSignTypedData,
    },
    {
      name: "Send transaction (EVM)",
      function: handleSendTransactionEvm,
    },
  ];

  return (
    <Section
      name="Wagmi wallet actions"
      description={
        "Using Wagmi, we can sign messages, typed data, and send transactions creating a seamless experience across Privy embedded wallets and externally connected wallets."
      }
      filepath="src/components/sections/wagmi-wallet-actions"
      actions={availableActions}
    >
      <div className="mb-4">
        <label
          htmlFor="wallet-select"
          className="block text-sm font-medium mb-2"
        >
          Select wallet:
        </label>
        <div className="relative">
          <select
            id="wallet-select"
            value={selectedWallet?.address || ""}
            onChange={(e) => {
              const wallet = wallets.find((w) => w.address === e.target.value);
              setActiveWallet(wallet || wallets[0]);
            }}
            className="w-full pl-3 pr-8 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black appearance-none"
          >
            {wallets.length === 0 ? (
              <option value="">No wallets available</option>
            ) : (
              <>
                <option value="">Select a wallet</option>
                {wallets.map((wallet) => (
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

export default WalletActions;
