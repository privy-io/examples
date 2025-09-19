// FILE ALTERED FROM CANONICAL STARTER
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { useLoginToMiniApp } from "@privy-io/react-auth/farcaster";
import { ToastContainer } from "react-toastify";
import miniappSdk from "@farcaster/miniapp-sdk";

import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { Header } from "@/components/ui/header";
import CreateAWallet from "@/components/sections/create-a-wallet";
import UserObject from "@/components/sections/user-object";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import FundWallet from "@/components/sections/fund-wallet";
import LinkAccounts from "@/components/sections/link-accounts";
import UnlinkAccounts from "@/components/sections/unlink-accounts";
import WalletActions from "@/components/sections/wallet-actions";
import SessionSigners from "@/components/sections/session-signers";
import WalletManagement from "@/components/sections/wallet-management";
import MFA from "@/components/sections/mfa";

function Home() {
  const { ready, authenticated, logout, login } = usePrivy();

  const { initLoginToMiniApp, loginToMiniApp } = useLoginToMiniApp();
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  // an effect to ensure if we are in mini app context
  useEffect(() => {
    if (miniappSdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      miniappSdk.actions.ready();
    }
  }, [isSDKLoaded]);

  // here we handle the login user automatically with farcaster (removes the need for the user to click the login button, can be removed if you want to use the login button)
  // when you open in TBA, if the user has added their TBA wallet to their farcaster account as an verified auth address, they will be logged in automatically
  // change this useEffect to your needs
  useEffect(() => {
    if (ready && !authenticated) {
      const login = async () => {
        // Initialize a new login attempt to get a nonce for the Farcaster wallet to sign
        const { nonce } = await initLoginToMiniApp();
        // Request a signature from Farcaster
        const result = await miniappSdk.actions.signIn({ nonce: nonce });
        // Send the received signature from Farcaster to Privy for authentication
        // or pass a SIWF message signed by an auth address
        await loginToMiniApp({
          message: result.message,
          signature: result.signature,
        });
      };
      login();
    }
  }, [ready, authenticated, initLoginToMiniApp, loginToMiniApp]);

  if (!ready) {
    return <FullScreenLoader />;
  }

  return (
    <div className="bg-[#E0E7FF66] md:max-h-[100vh] md:overflow-hidden">
      <Header />
      {authenticated ? (
        <section className="w-full flex flex-col md:flex-row md:h-[calc(100vh-60px)]">
          <div className="flex-grow overflow-y-auto h-full p-4 pl-8">
            <button className="button" onClick={logout}>
              <ArrowLeftIcon className="h-4 w-4" strokeWidth={2} /> Logout
            </button>

            <div>
              <CreateAWallet />
              <FundWallet />
              <LinkAccounts />
              <UnlinkAccounts />
              <WalletActions />
              <SessionSigners />
              <WalletManagement />
              <MFA />
            </div>
          </div>
          <UserObject />
        </section>
      ) : (
        <section className="w-full flex flex-row justify-center items-center h-[calc(100vh-60px)] relative">
          <Image
            src="./BG.svg"
            alt="Background"
            fill
            style={{ objectFit: "cover", zIndex: 0 }}
            priority
          />
          <div className="z-10 flex flex-col items-center justify-center w-full h-full">
            <div className="flex h-10 items-center justify-center rounded-[20px] border border-white px-6 text-lg text-white font-abc-favorit">
              Farcaster miniapp Demo
            </div>
            <div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
              Starter repo
            </div>
            <div className="text-center text-white text-xl font-normal leading-loose mt-8">
              Get started building Farcaster mini apps with Privy and Next.js
              using our starter repo
            </div>
            <button
              className="bg-white text-brand-off-black mt-15 w-full max-w-md rounded-full px-4 py-2 hover:bg-gray-100 lg:px-8 lg:py-4 lg:text-xl"
              onClick={() => {
                login();
                setTimeout(() => {
                  (
                    document.querySelector(
                      'input[type="email"]'
                    ) as HTMLInputElement
                  )?.focus();
                }, 150);
              }}
            >
              Get started
            </button>
          </div>
        </section>
      )}

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        limit={1}
        aria-label="Toast notifications"
        style={{ top: 58 }}
      />
    </div>
  );
}

export default Home;
