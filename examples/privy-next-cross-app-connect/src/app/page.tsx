"use client";

import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { ToastContainer } from "react-toastify";

import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { Header } from "@/components/ui/header";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import WagmiActions from "@/components/sections/wagmi-actions";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useAccount, useDisconnect } from "wagmi";

function Home() {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  return (
    <div
      className={`${
        !!address
          ? "bg-[#E0E7FF66] md:max-h-screen md:overflow-hidden"
          : "bg-transparent h-screen overflow-hidden"
      }`}
    >
      <Header authenticated={!!address} />
      {!!address ? (
        <section className="w-full flex flex-col md:flex-row md:h-screen pt-[60px]">
          <div className="grow md:overflow-y-auto md:h-full p-4 pl-8 pb-4">
            <button className="button" onClick={() => disconnect()}>
              <ArrowLeftIcon className="h-4 w-4" strokeWidth={2} /> Disconnect
            </button>

            <div className="mt-4 flex justify-center">
              <ConnectButton />
            </div>

            <div>
              <WagmiActions />
            </div>
          </div>
        </section>
      ) : (
        <section className="w-full flex flex-row justify-center items-center h-screen relative">
          <Image
            src="./BG.svg"
            alt="Background"
            fill
            style={{ objectFit: "cover", zIndex: 0 }}
            priority
          />
          <div className="z-10 flex flex-col items-center justify-center w-full h-full">
            <div className="flex h-10 items-center justify-center rounded-[20px] border border-white px-6 text-lg text-white font-abc-favorit">
                  Cross App Connect Demo
            </div>
            <div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
              Starter repo
            </div>
            <div className="text-center text-white text-xl font-normal leading-loose mt-8">
              Get started developing with Privy using our Next.js starter repo
            </div>
            <div className="mt-15">
              <ConnectButton />
            </div>
            {/* <button
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
            </button> */}
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
