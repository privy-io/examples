"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useSendTransaction as useSendTransactionSolana,
  useSignMessage as useSignMessageSolana,
  useSignTransaction as useSignTransactionSolana,
  useConnectedStandardWallets,
} from "@privy-io/react-auth/solana";
import bs58 from "bs58";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import Section from "../reusables/section";
import { showSuccessToast, showErrorToast } from "@/components/ui/custom-toast";

type WalletInfo = {
  address: string;
  type: "solana";
  name: string;
};

const WalletActions = () => {
  const { signMessage: signMessageSolana } = useSignMessageSolana();
  const { signTransaction: signTransactionSolana } = useSignTransactionSolana();
  const { sendTransaction: sendTransactionSolana } = useSendTransactionSolana();
  const { wallets: walletsSolana } = useConnectedStandardWallets();

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

  const handleSignMessageSolana = async () => {
    if (!selectedWallet) {
      showErrorToast("Please select a Solana wallet");
      return;
    }
    try {
      const message = "Hello world";
      const signatureUint8Array = await signMessageSolana({
        message: new TextEncoder().encode(message),
        options: {
          address: selectedWallet.address,
          uiOptions: {
            title: "Sign this message",
          },
        },
      });
      const signature = bs58.encode(signatureUint8Array);
      showSuccessToast(`Solana Message signed: ${signature.slice(0, 10)}...`);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign Solana message");
    }
  };

  const handleSignTransactionSolana = async () => {
    if (!selectedWallet) {
      showErrorToast("Please select a Solana wallet");
      return;
    }
    try {
      const connection = new Connection("https://api.mainnet-beta.solana.com");
      const transaction = new Transaction();

      const signedTransaction = await signTransactionSolana({
        transaction: transaction,
        connection: connection,
        address: selectedWallet.address,
      });
      console.log(signedTransaction);
      showSuccessToast("Solana Transaction signed successfully");
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to sign Solana transaction");
    }
  };

  const handleSendTransactionSolana = async () => {
    if (!selectedWallet) {
      showErrorToast("Please select a Solana wallet");
      return;
    }
    try {
      const connection = new Connection("https://api.devnet.solana.com");
      const transaction = new Transaction();

      const transferInstruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(selectedWallet.address),
        toPubkey: new PublicKey(selectedWallet.address),
        lamports: 1000000,
      });
      transaction.add(transferInstruction);

      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = new PublicKey(selectedWallet.address);

      const receipt = await sendTransactionSolana({
        transaction: transaction,
        connection: connection,
        address: selectedWallet.address,
      });
      console.log(receipt);

      showSuccessToast("Solana Transaction sent successfully");
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to send Solana transaction");
    }
  };

  const availableActions = [
    {
      name: "Sign message (Solana)",
      function: handleSignMessageSolana,
      disabled: false,
    },
    {
      name: "Sign transaction (Solana)",
      function: handleSignTransactionSolana,
      disabled: false,
    },
    {
      name: "Send transaction (Solana)",
      function: handleSendTransactionSolana,
      disabled: false,
    },
  ];

  return (
    <Section
      name="Wallet actions"
      description={
        "Sign messages and transactions, send transactions for Solana wallets. Seamless experience with Privy embedded wallets."
      }
      filepath="src/components/sections/wallet-actions"
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

export default WalletActions;