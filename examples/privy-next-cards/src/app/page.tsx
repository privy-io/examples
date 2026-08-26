"use client";

import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { ToastContainer } from "react-toastify";

import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { Header } from "@/components/ui/header";
import Cards from "@/components/sections/cards";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";

function Home() {
  const { ready, authenticated, logout, login } = usePrivy();
  if (!ready) {
    return <FullScreenLoader />;
  }

  return (
    <div
      className={
        authenticated
          ? "bg-[#E0E7FF66] md:max-h-[100vh] md:overflow-hidden"
          : "bg-transparent h-screen overflow-hidden"
      }
    >
      <Header authenticated={authenticated} />
      {authenticated ? (
        <section className="w-full h-screen pt-[60px]">
          <div className="overflow-y-auto h-full p-4 pl-8">
            <button className="button" onClick={logout}>
              <ArrowLeftIcon className="h-4 w-4" strokeWidth={2} /> Logout
            </button>

            <Cards />
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
              Privy cards demo
            </div>
            <div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
              Cards
            </div>
            <div className="text-center text-white text-xl font-normal leading-loose mt-8">
              Issue and manage cards for your users with Privy
            </div>
            <button
              className="bg-white text-[#040217] mt-15 w-full max-w-md cursor-pointer rounded-full px-4 py-2 font-medium hover:bg-gray-100 lg:px-8 lg:py-4 lg:text-xl"
              onClick={() => {
                login();
                setTimeout(() => {
                  (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
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
