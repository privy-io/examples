import React, { useState } from "react";
import { useSmartAccount } from "../../hooks/SmartAccountContext";
import { BASE_SEPOLIA_SCAN_URL, NFT_ADDRESS } from "../../lib/constants";
import { encodeFunctionData } from "viem";
import ABI from "../../lib/nftABI.json";
import { toast } from "react-toastify";
import { Alert } from "../AlertWithLink";
import { baseSepolia } from "viem/chains";
import { Section } from "../reusables/section";
import { useLinkWithSiwe } from "@privy-io/react-auth";

export function PermissionlessActions() {
  const { generateSiweMessage, linkWithSiwe } = useLinkWithSiwe();
  const { smartAccountAddress, smartAccountClient, eoa } = useSmartAccount();
  const [isMinting, setIsMinting] = useState(false);

  const isLoading = !smartAccountAddress || !smartAccountClient;

  const onMint = async () => {
    if (!smartAccountClient || !smartAccountAddress) return;

    setIsMinting(true);
    const toastId = toast.loading("Minting...");

    try {
      const transactionHash = await smartAccountClient.sendTransaction({
        account: smartAccountClient.account!,
        chain: baseSepolia,
        to: NFT_ADDRESS,
        data: encodeFunctionData({
          abi: ABI,
          functionName: "mint",
          args: [smartAccountAddress],
        }),
      });

      toast.update(toastId, {
        render: "Waiting for your transaction to be confirmed...",
        type: "info",
        isLoading: true,
      });

      toast.update(toastId, {
        render: (
          <Alert href={`${BASE_SEPOLIA_SCAN_URL}/tx/${transactionHash}`}>
            Successfully minted! Click here to see your transaction.
          </Alert>
        ),
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error) {
      console.error("Mint failed with error: ", error);
      toast.update(toastId, {
        render: (
          <Alert>
            There was an error sending your transaction. See the developer
            console for more info.
          </Alert>
        ),
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }

    setIsMinting(false);
  };

  const onLink = async () => {
    if (!smartAccountClient || !smartAccountAddress) return;
    const chainId = `eip155:${baseSepolia.id}`;

    try {
      const message = await generateSiweMessage({
        address: smartAccountAddress,
        chainId,
      });

      const signature = await smartAccountClient.signMessage({ message });

      await linkWithSiwe({
        signature,
        message,
        chainId,
        walletClientType: "privy_smart_account",
        connectorType: "safe",
      });

      toast.success("Successfully linked smart account to user!");
    } catch (error) {
      console.error("Link failed with error: ", error);
      toast.error("Failed to link smart account. See console for details.");
    }
  };

  const actions = (
    <>
      <button
        onClick={onMint}
        disabled={isLoading || isMinting}
        className={`button ${
          isLoading || isMinting ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Mint NFT
      </button>
      <button
        onClick={onLink}
        disabled={isLoading}
        className={`button ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        Link Account
      </button>
    </>
  );

  return (
    <Section
      name="Permissionless Actions"
      description="Interact with smart accounts using Permissionless.js for gasless transactions and account abstraction"
      filepath="src/components/sections/permissionless-actions.tsx"
      actions={actions}
    >
      <div className="space-y-4">
        <div>
          <p className="font-bold uppercase text-sm text-gray-600">
            Smart Wallet Address
          </p>
          <a
            className="mt-1 text-sm text-gray-500 hover:text-violet-600 break-all"
            href={`${BASE_SEPOLIA_SCAN_URL}/address/${smartAccountAddress}#tokentxnsErc721`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {smartAccountAddress}
          </a>
        </div>

        <div>
          <p className="font-bold uppercase text-sm text-gray-600">
            Signer Address (EOA)
          </p>
          <a
            className="mt-1 text-sm text-gray-500 hover:text-violet-600 break-all"
            href={`${BASE_SEPOLIA_SCAN_URL}/address/${eoa?.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {eoa?.address}
          </a>
        </div>
      </div>
    </Section>
  );
}
