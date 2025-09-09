"use client";

import { LinkedAccountWithMetadata, usePrivy } from "@privy-io/react-auth";
import {
  ConnectedStandardSolanaWallet,
  useConnectedStandardWallets,
  useCreateWallet,
  useStandardSignAndSendTransaction,
  useStandardSignMessage,
  useStandardSignTransaction,
} from "@privy-io/react-auth/solana";
import { FileSignature, MessageSquare, Send, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButton } from "@/components/actionButton";
import { SendTransactionModal } from "@/components/modals/sendTransactionModal";
import { SignMessageModal } from "@/components/modals/signMessageModal";
import { SignTransactionModal } from "@/components/modals/signTransactionModal";
import { Badge } from "@/components/ui/badge";
import { WalletCard } from "@/components/walletCard";
import {
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createNoopSigner,
  createSolanaRpc,
  createTransactionMessage,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

export default function Dashboard() {
  const router = useRouter();
  const [selectedWallet, setSelectedWallet] =
    useState<ConnectedStandardSolanaWallet | null>(null);
  const [signMessageModalOpen, setSignMessageModalOpen] = useState(false);
  const [signTransactionModalOpen, setSignTransactionModalOpen] =
    useState(false);
  const [sendTransactionModalOpen, setSendTransactionModalOpen] =
    useState(false);
  const { user: userData, logout, ready } = usePrivy();
  const { createWallet } = useCreateWallet();
  const { wallets } = useConnectedStandardWallets();
  const { signMessage } = useStandardSignMessage();
  const { signTransaction } = useStandardSignTransaction();
  const { signAndSendTransaction } = useStandardSignAndSendTransaction();

  const handleSignMessage = async (
    wallet: ConnectedStandardSolanaWallet,
    message: string,
  ) => {
    console.log(`Signing message "${message}" with wallet:`, wallet.address);
    const encodedMessage = new TextEncoder().encode(message);

    const result = (
      await signMessage({
        message: encodedMessage,
        wallet,
      })
    ).signature;
    console.log("Message signed:", result);
  };

  const handleSignTransaction = async (
    wallet: ConnectedStandardSolanaWallet,
    to: string,
  ) => {
    console.log(`Signing transaction to "${to}" with wallet:`, wallet.address);
    const LAMPORTS_PER_SOL = 1_000_000_000; // 1 SOL = 1 billion lamports

    const transferInstruction = getTransferSolInstruction({
      amount: LAMPORTS_PER_SOL * 1,
      destination: address(to),
      source: createNoopSigner(address(wallet.address)),
    });

    const { getLatestBlockhash } = createSolanaRpc(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string,
    );
    const { value: latestBlockhash } = await getLatestBlockhash().send();

    // Create transaction
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayer(address(wallet.address), tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions([transferInstruction], tx),
      (tx) => compileTransaction(tx),
    );
    const encodedTx = getTransactionEncoder().encode(transaction);

    // Sign the transaction
    const signedTransaction = await signTransaction({
      transaction: new Uint8Array(encodedTx),
      wallet: wallet,
    });
    console.log("Transaction signed:", signedTransaction.signedTransaction);
  };

  const handleSendTransaction = async (
    wallet: ConnectedStandardSolanaWallet,
    toAddress: string,
    amount: string,
  ) => {
    console.log(
      `Sending ${amount} SOL to ${toAddress} from wallet:`,
      wallet.address,
    );

    const LAMPORTS_PER_SOL = 1_000_000_000; // 1 SOL = 1 billion lamports

    const transferInstruction = getTransferSolInstruction({
      amount: BigInt(parseFloat(amount) * LAMPORTS_PER_SOL),
      destination: address(toAddress),
      source: createNoopSigner(address(wallet.address)),
    });

    const { getLatestBlockhash } = createSolanaRpc(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string,
    );
    const { value: latestBlockhash } = await getLatestBlockhash().send();

    // Create transaction using @solana/kit
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayer(address(wallet.address), tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions([transferInstruction], tx),
      (tx) => compileTransaction(tx),
    );

    const foundWallet = wallets.find((v) => v.address === wallet.address);

    if (foundWallet) {
      const encodedTx = getTransactionEncoder().encode(transaction);
      const result = await signAndSendTransaction({
        transaction: new Uint8Array(encodedTx),
        wallet: foundWallet,
      });
      return console.log("Transaction sent:", result.signature);
    }

    console.log("Wallet not found for sending transaction");
  };

  const handleCreateEmbeddedWallet = async () => {
    console.log("Creating new embedded wallet...");
    await createWallet({ createAdditional: true });
  };

  const getWalletDisplayName = (account: LinkedAccountWithMetadata) => {
    if (account.type !== "wallet") return account.type;

    if (account?.walletClientType === "privy") {
      return `Privy ${account.chainType === "ethereum" ? "ETH" : "SOL"} ${account.walletIndex !== undefined ? `#${(account.walletIndex ?? 0) + 1}` : ""}`;
    }
    return account?.walletClientType;
  };

  const handleWalletSelect = (
    wallet: ConnectedStandardSolanaWallet,
    modalType: string,
  ) => {
    setSelectedWallet(wallet);
    switch (modalType) {
      case "signMessage":
        setSignMessageModalOpen(true);
        break;
      case "signTransaction":
        setSignTransactionModalOpen(true);
        break;
      case "sendTransaction":
        setSendTransactionModalOpen(true);
        break;
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg font-[family-name:var(--font-geist-mono)]">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-[family-name:var(--font-geist-mono)]">
      <div className="container mx-auto p-6 space-y-8">
        <div className="space-y-2 flex justify-between">
          <div className="">
            <h1 className="text-3xl font-bold text-white">Wallet Dashboard</h1>
            <p className="text-gray-400">
              Manage your wallets and transactions
            </p>
          </div>

          <button type="button">
            <span
              className="text-sm text-gray-400 hover:text-white cursor-pointer"
              onClick={async () => {
                await logout();
                router.replace("/");
              }}
            >
              Logout
            </span>
          </button>
        </div>

        {/* Active Wallet Card */}
        <div className="bg-gray-900 border-2 border-blue-500 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Active Wallet
                </h2>
                <p className="text-gray-400">
                  Currently selected wallet for transactions
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">
                  {getWalletDisplayName(userData?.wallet)}
                </p>
                <p className="text-sm text-gray-400">
                  {userData?.wallet?.address}
                </p>
              </div>
              <Badge>{userData?.wallet?.chainType.toUpperCase()}</Badge>
            </div>
          </div>
        </div>

        {/* Linked Accounts */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Linked Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((account, index) => (
              <WalletCard
                key={`${account.standardWallet.name}-${index}`}
                account={account}
                isActive={
                  account.address
                    ? account.address === userData?.wallet?.address
                    : false
                }
              />
            ))}
            <WalletCard
              account={{} as ConnectedStandardSolanaWallet}
              isCreateNew={true}
              onCreateNew={handleCreateEmbeddedWallet}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <ActionButton
              icon={<MessageSquare className="h-4 w-4" />}
              label="Sign Message"
              wallets={wallets}
              onWalletSelect={(wallet) =>
                handleWalletSelect(wallet, "signMessage")
              }
            />
            <ActionButton
              icon={<FileSignature className="h-4 w-4" />}
              label="Sign Transaction"
              wallets={wallets}
              onWalletSelect={(wallet) =>
                handleWalletSelect(wallet, "signTransaction")
              }
            />
            <ActionButton
              icon={<Send className="h-4 w-4" />}
              label="Send Transaction"
              wallets={wallets}
              onWalletSelect={(wallet) =>
                handleWalletSelect(wallet, "sendTransaction")
              }
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <SignMessageModal
        isOpen={signMessageModalOpen}
        onClose={() => setSignMessageModalOpen(false)}
        selectedWallet={selectedWallet}
        onSign={handleSignMessage}
      />
      <SignTransactionModal
        isOpen={signTransactionModalOpen}
        onClose={() => setSignTransactionModalOpen(false)}
        selectedWallet={selectedWallet}
        onSign={handleSignTransaction}
      />
      <SendTransactionModal
        isOpen={sendTransactionModalOpen}
        onClose={() => setSendTransactionModalOpen(false)}
        selectedWallet={selectedWallet}
        onSend={handleSendTransaction}
      />
    </div>
  );
}
