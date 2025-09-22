import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useLinkWithSiwe, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { useSmartAccount } from "../hooks/SmartAccountContext";
import { BASE_SEPOLIA_SCAN_URL, NFT_ADDRESS } from "../lib/constants";
import { encodeFunctionData } from "viem";
import ABI from "../lib/nftABI.json";
import { ToastContainer, toast } from "react-toastify";
import { Alert } from "../components/AlertWithLink";
import { baseSepolia } from "viem/chains";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const { generateSiweMessage, linkWithSiwe } = useLinkWithSiwe();
  const { smartAccountAddress, smartAccountClient, eoa } = useSmartAccount();

  // If the user is not authenticated, redirect them back to the landing page
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const isLoading = !smartAccountAddress || !smartAccountClient;
  const [isMinting, setIsMinting] = useState(false);

  const onMint = async () => {
    // The mint button is disabled if either of these are undefined
    if (!smartAccountClient || !smartAccountAddress) return;

    // Store a state to disable the mint button while mint is in progress
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
    // The link button is disabled if either of these are undefined
    if (!smartAccountClient || !smartAccountAddress) return;
    const chainId = `eip155:${baseSepolia.id}`;

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
  };

  return (
    <>
      <Head>
        <title>Privy x Permissionless Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated && !isLoading ? (
          <>
            <ToastContainer />
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">
                Privy x Permissionless Demo
              </h1>
              <button onClick={logout} className="button">
                Logout
              </button>
            </div>
            <div className="mt-12 flex gap-4 flex-wrap">
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
                className={`button ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Link smart account to user
              </button>
            </div>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              Your Smart Wallet Address
            </p>
            <a
              className="mt-2 text-sm text-gray-500 hover:text-violet-600"
              href={`${BASE_SEPOLIA_SCAN_URL}/address/${smartAccountAddress}#tokentxnsErc721`}
            >
              {smartAccountAddress}
            </a>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              Your Signer Address
            </p>
            <a
              className="mt-2 text-sm text-gray-500 hover:text-violet-600"
              href={`${BASE_SEPOLIA_SCAN_URL}/address/${eoa?.address}`}
            >
              {eoa?.address}
            </a>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              User object
            </p>
            <textarea
              value={JSON.stringify(user, null, 2)}
              className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2"
              rows={20}
              disabled
            />
          </>
        ) : null}
      </main>
    </>
  );
}
