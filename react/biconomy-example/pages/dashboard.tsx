import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import { usePrivy } from "@privy-io/react-auth";
import { useBiconomy } from "../hooks/BiconomyContext";
import {ethers} from "ethers";
import abi from '../lib/nft.json';
import { PaymasterMode, type IHybridPaymaster, type SponsorUserOperationDto } from "@biconomy/paymaster";

const NFT_CONTRACT_ADDRESS = "0x34bE7f35132E97915633BC1fc020364EA5134863";
const MUMBAI_SCAN_URL = "https://mumbai.polygonscan.com";

export default function DashboardPage() {
  const router = useRouter();
  const {ready, authenticated, user, logout} = usePrivy();
  const {smartAccount, smartAccountAddress} = useBiconomy();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) router.push('/');
  }, [ready, authenticated, router]);

  const onMint = useCallback(async () => {
    if (!smartAccount || !smartAccountAddress) return;

    // Initialize ethers contract instance for NFT
    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`)
    const nft = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, provider);

    // Construct minting userOp
    const mintTransaction = await nft.populateTransaction.mint!(smartAccountAddress);
    const mintUserOp = await smartAccount.buildUserOp([{
      to: NFT_CONTRACT_ADDRESS,
      data: mintTransaction.data
    }]);

    // Construct configuration for Biconomy paymaster
    const biconomyPaymaster = smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
    const paymasterServiceData: SponsorUserOperationDto = {
      mode: PaymasterMode.SPONSORED,
      smartAccountInfo: {
        name: 'BICONOMY',
        version: '2.0.0'
      },
    };
    const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(
        mintUserOp,
        paymasterServiceData
    );
    mintUserOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

    // Send user op to mempool
    setIsLoading(true);
    const toastId = toast.loading('Minting...');
    try {
      const userOpResponse = await smartAccount.sendUserOp(mintUserOp);
      const { receipt } = await userOpResponse.wait(1);
      toast.update(toastId, {
        render: (
          <a
            href={`${MUMBAI_SCAN_URL}/tx/${receipt.transactionHash}`}
            target="_blank"
            color="#FF8271"
          >
            Click here to see your mint transaction.
          </a>
        ),
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error) {
      toast.update(toastId, {
        render:
          "Failed to mint NFT. Please see the developer console for more information.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error(`Failed to mint with error: ${error}`);
    }
    setIsLoading(false);
  }, [smartAccount, smartAccountAddress]);

  return (
    <>
      <Head>
        <title>Privy x Biconomy Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        <ToastContainer />
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy x Biconomy Demo</h1>
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
                disabled={!ready || !authenticated || !smartAccount || isLoading}
                className="text-sm bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 py-2 px-4 rounded-md text-white"
              >
                {"Mint NFT without Gas"}
              </button>
            </div>

            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              Your Smart Wallet Address
            </p>
            <a
              className="mt-2 text-sm text-gray-500 hover:text-violet-600"
              href={`${MUMBAI_SCAN_URL}/address/${smartAccountAddress}`}
            >
              {smartAccountAddress}
            </a>
            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              Your Signer Address
            </p>
            <a
              className="mt-2 text-sm text-gray-500 hover:text-violet-600"
              href={`${MUMBAI_SCAN_URL}/address/${user?.wallet?.address}`}
            >
              {user?.wallet?.address}
            </a>
          </>
        ) : null}
      </main>
    </>
  );
}
