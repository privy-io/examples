"use client";

import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import { SmartAccountProvider } from "../hooks/SmartAccountContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!privyAppId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Environment Configuration Required
          </h1>
          <p className="text-gray-600 mb-4">
            Please copy .env.example to .env and fill in your Privy app ID and
            Pimlico URLs.
          </p>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            cp .env.example .env
          </code>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["email", "google"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          showWalletUIs: false,
        },
        // @ts-ignore
        defaultChain: baseSepolia,
      }}
    >
      <SmartAccountProvider>
        <ToastContainer position="top-center" />
        {children}
      </SmartAccountProvider>
    </PrivyProvider>
  );
}
