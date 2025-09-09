import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import { useSmartAccount } from "../hooks/SmartAccountContext";
import { BASE_GOERLI_SCAN_URL, NFT_ADDRESS } from "../lib/constants";
import { encodeFunctionData } from "viem";
import ABI from "../lib/nftABI.json";
import { ToastContainer, toast } from "react-toastify";
import { Alert } from "../components/AlertWithLink";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();
  const {
    smartAccountAddress,
    smartAccountProvider,
    sendSponsoredUserOperation,
    eoa,
  } = useSmartAccount();

  // If the user is not authenticated, redirect them back to the landing page
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const isLoading = !smartAccountAddress || !smartAccountProvider;
  const [isMinting, setIsMinting] = useState(false);

  const onMint = async () => {
    // The mint button is disabled if either of these are undefined
    if (!smartAccountProvider || !smartAccountAddress) return;

    // Store a state to disable the mint button while mint is in progress
    setIsMinting(true);
    const toastId = toast.loading("Minting...");

    try {
      // From a viem `RpcTransactionRequest` (e.g. calling an ERC-721's `mint` method),
      // build and send a user operation. Gas fees will be sponsored by the Base Paymaster.
      const userOpHash = await sendSponsoredUserOperation({
        from: smartAccountAddress,
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

      // Once we have a hash for the user operation, watch it until the transaction has
      // been confirmed.
      const transactionHash =
        await smartAccountProvider.waitForUserOperationTransaction(userOpHash);

      toast.update(toastId, {
        render: (
          <Alert href={`${BASE_GOERLI_SCAN_URL}/tx/${transactionHash}`}>
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

  return (
    <>
      <Head>
        <title>Privy x Base Paymaster Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated && !isLoading ? (
          <>
            <ToastContainer />
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">
                Privy x Base Paymaster Demo
              </h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
            <div className="mt-12 flex gap-4 flex-wrap">
              <button
                onClick={onMint}
                className="text-sm bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 py-2 px-4 rounded-md text-white"
                disabled={isLoading || isMinting}
              >
                Mint NFT
              </button>
            </div>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              Your Smart Wallet Address
            </p>
            <a
              className="mt-2 text-sm text-gray-500 hover:text-violet-600"
              href={`${BASE_GOERLI_SCAN_URL}/address/${smartAccountAddress}#tokentxnsErc721`}
            >
              {smartAccountAddress}
            </a>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              Your Signer Address
            </p>
            <a
              className="mt-2 text-sm text-gray-500 hover:text-violet-600"
              href={`${BASE_GOERLI_SCAN_URL}/address/${eoa?.address}`}
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
