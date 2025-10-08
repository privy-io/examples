import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import OnrampModal from "../components/onramp";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import {
  useWallets as useSolanaWallets,
  useExportWallet,
} from "@privy-io/react-auth/solana";
import { mainnet } from "viem/chains";

function formatAddress(address?: string | null) {
  if (!address) return "";
  const leading = address.slice(0, 5);
  const trailing = address.slice(address.length - 4);
  return `${leading}...${trailing}`;
}

export default function HomePage() {
  const {
    ready,
    authenticated,
    user,
    logout,
    signMessage,
    sendTransaction,
    exportWallet: exportEvmWallet,
  } = usePrivy();

  const { wallets: evmWallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();
  const { exportWallet: exportSolanaWallet } = useExportWallet();

  const router = useRouter();
  // Signature produced using `signMessage`
  const [signature, setSignature] = useState<string | null>(null);
  // Fiat onramp URL returned from server
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);
  // Balance of embedded wallet
  const [evmBalance, setEvmBalance] = useState<string | undefined>(undefined);

  // Method to get the user's Goerli ETH balance
  const updateEvmBalance = async () => {
    if (!user?.wallet?.address) return;
    try {
      const ethersProvider = new ethers.InfuraProvider(
        "mainnet",
        process.env.NEXT_PUBLIC_INFURA_API_KEY,
      );
      const balanceInWei = await ethersProvider.getBalance(user.wallet.address);
      setEvmBalance(ethers.formatEther(balanceInWei));
    } catch (error) {
      console.error(`Cannot connect to Infura with error: ${error}`);
    }
  };

  // Method to invoke fiat on-ramp flow for current user
  const onFundEVMWallet = async () => {
    // Error if user does not have a wallet
    if (!evmWallets.length) {
      throw new Error("No EVM wallet found");
    }

    const wallet = evmWallets[0];

    const fundingConfig = {
      amount: "100",
      asset: "USDC",
      chain: mainnet,
    };

    if (wallet?.address) {
      setOnrampUrl(
        `https://buy-sandbox.moonpay.com/?walletAddress=${wallet.address}&currencyCode=${fundingConfig.asset.toLowerCase()}&networkCode=${fundingConfig.chain.name.toLowerCase()}&quoteCurrencyAmount=${fundingConfig.amount}&defaultPaymentMethod=card&apiKey=${process.env.NEXT_PUBLIC_MOONPAY_API_KEY}`,
      );
    }
  };

  const onFundSolanaWallet = async () => {
    if (!solanaWallets.length) {
      throw new Error("No Solana wallet found");
    }

    const wallet = solanaWallets[0];

    const fundingConfig = {
      amount: "0.1",
    };

    if (wallet?.address) {
      setOnrampUrl(
        `https://buy-sandbox.moonpay.com/?walletAddress=${wallet.address}&currencyCode=sol&networkCode=solana&quoteCurrencyAmount=${fundingConfig.amount}&defaultPaymentMethod=card&apiKey=${process.env.NEXT_PUBLIC_MOONPAY_API_KEY}`,
      );
    }
  };

  const onSign = async () => {
    try {
      const { signature } = await signMessage({
        message: "I hereby vote for foobar",
      });
      setSignature(signature);
    } catch (error) {
      console.error("Signing error:", error);
    }
  };

  const onSend = async () => {
    try {
      const receipt = await sendTransaction({
        to: "0xFf8c476a67B2903e077b16CdB823710ea3D4BC7f",
        chainId: mainnet.id,
        value: ethers.parseEther("0.00005"),
      });
      console.log("Transaction Receipt:", receipt);
    } catch (error) {
      console.error(`Failed to send transaction with error ${error}`);
    }
  };

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
    updateEvmBalance();
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>Fiat Onramp Demo</title>
      </Head>

      <main className="flex min-h-screen flex-col bg-[#E0E7FF66] px-4 py-6 sm:px-20 sm:py-10">
        <OnrampModal onrampUrl={onrampUrl} onClose={() => setOnrampUrl(null)} />
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold font-abc-favorit">
                Fiat Onramp Demo
              </h1>
              <div className="flex flex-row gap-4">
                <button onClick={logout} className="button-outline">
                  Logout
                </button>
              </div>
            </div>
            <p className="mb-4 text-sm font-bold uppercase text-gray-600">
              My Embedded Wallet
            </p>
            <div className="flex flex-row flex-wrap gap-4">
              <div>
                <div className="flex w-[180px] flex-col items-center gap-2 rounded-xl bg-white p-2">
                  <button
                    className="button-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    {formatAddress(user?.wallet?.address)}
                  </button>
                  <p className="text-sm">Privy wallet</p>
                  <button className="button w-full" onClick={onSign}>
                    Sign message
                  </button>
                </div>
                {signature && (
                  <>
                    <p className="mt-6 text-sm font-bold uppercase text-gray-600">
                      Privy wallet signature
                    </p>
                    <textarea
                      value={signature}
                      className="mt-2 w-[200px] max-w-4xl rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 sm:text-sm"
                      rows={1}
                      disabled
                    />
                  </>
                )}
              </div>
              <div className="flex flex-col items-start gap-2 py-2">
                {evmWallets.length > 0 && (
                  <button onClick={onFundEVMWallet} className="button">
                    Fund EVM embedded wallet
                  </button>
                )}
                {solanaWallets.length > 0 && (
                  <button onClick={onFundSolanaWallet} className="button">
                    Fund Solana embedded wallet
                  </button>
                )}
              </div>
              <div className="flex flex-col items-start gap-2 py-2">
                <button onClick={onSend} className="button">
                  Send an EVM transaction
                </button>
              </div>
              <div className="flex flex-col items-start gap-2 py-2">
                {evmWallets.length > 0 && (
                  <button onClick={() => exportEvmWallet()} className="button">
                    Export embedded wallet
                  </button>
                )}
                {solanaWallets.length > 0 && (
                  <button
                    onClick={() => exportSolanaWallet()}
                    className="button"
                  >
                    Export solana wallet
                  </button>
                )}
              </div>
            </div>

            <p className="mt-6 text-sm font-bold uppercase text-gray-600">
              My balance
            </p>
            <p>{evmBalance} ETH</p>

            <p className="mt-6 text-sm font-bold uppercase text-gray-600">
              User object
            </p>
            <textarea
              value={JSON.stringify(user, null, 2)}
              className="mt-2 max-w-4xl rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 sm:text-sm"
              rows={JSON.stringify(user, null, 2).split("\n").length}
              disabled
            />
          </>
        ) : null}
      </main>
    </>
  );
}
