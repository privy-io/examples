"use client";

import { useLogin, useLogout, usePrivy, useUser } from "@privy-io/react-auth";
import Image from "next/image";
import { Header } from "../components/ui/header";
import { FullScreenLoader } from "../components/ui/fullscreen-loader";
import { PermissionlessActions } from "../components/sections/permissionless-actions";

export default function HomePage() {
  const { ready, authenticated } = usePrivy();
  const { user } = useUser();
  const { login } = useLogin();
  const { logout } = useLogout();

  if (!ready) {
    return <FullScreenLoader />;
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen min-w-full">
        <Header authenticated={authenticated} />
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
                  Permissionless Demo
            </div>
            <div className="text-center mt-4 text-white text-7xl font-medium font-abc-favorit leading-[81.60px]">
              Smart Accounts
            </div>
            <div className="text-center text-white text-xl font-normal leading-loose mt-8">
              Get started developing with Privy and Permissionless smart
              accounts
            </div>
            <button
              className="bg-white text-brand-off-black mt-15 w-full max-w-md rounded-full px-4 py-2 hover:bg-gray-100 lg:px-8 lg:py-4 lg:text-xl"
              onClick={() => {
                login();
                setTimeout(() => {
                  (
                    document.querySelector(
                      'input[type="email"]',
                    ) as HTMLInputElement
                  )?.focus();
                }, 150);
              }}
            >
              Get started
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full">
      <Header authenticated={authenticated} />

      <div className="flex flex-col lg:flex-row w-full pt-[60px]">
        {/* Main content area */}
        <div className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Permissionless Smart Accounts
                </h1>
                <p className="text-gray-600">
                  Interact with smart accounts using gasless transactions and
                  account abstraction
                </p>
              </div>
              <button onClick={logout} className="button-outline">
                Logout
              </button>
            </div>

            {/* Main sections */}
            <div className="space-y-6">
              <PermissionlessActions />

              {/* User object section */}
              <div className="border border-gray-300 rounded-lg p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    User Object
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Current authenticated user data and metadata
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-2">
                    src/app/page.tsx
                  </p>
                </div>
                <textarea
                  value={JSON.stringify(user, null, 2)}
                  className="w-full bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md"
                  rows={20}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
