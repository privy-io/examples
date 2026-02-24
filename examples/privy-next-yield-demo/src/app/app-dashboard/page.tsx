"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";

import { AppWalletCard } from "@/components/AppWalletCard";
import { AppWithdrawForm } from "@/components/AppWithdrawForm";
import { PositionDisplay } from "@/components/PositionDisplay";
import { FeeRecipientCard } from "@/components/FeeRecipientCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { Header } from "@/components/ui/header";
import { getFeeRecipientWalletId } from "@/lib/constants";

export default function AppDashboard() {
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const feeRecipientWalletId = getFeeRecipientWalletId();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const handleTransactionSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!ready) {
    return <FullScreenLoader />;
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#E0E7FF66]">
      <Header authenticated={true} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[60px]">
        <div className="mt-4 mb-6">
          <button className="button" onClick={logout}>
            <ArrowLeftIcon className="h-4 w-4" strokeWidth={2} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - App Wallet & Withdraw */}
          <div className="lg:col-span-1 space-y-6">
            <AppWalletCard />
            <AppWithdrawForm onSuccess={handleTransactionSuccess} />
          </div>

          {/* Right Column - Position & Vault Info */}
          <div className="lg:col-span-2 space-y-6">
            <PositionDisplay
              key={`position-${refreshKey}`}
              walletId={feeRecipientWalletId}
            />
            <TransactionHistory
              refreshKey={refreshKey}
              walletId={feeRecipientWalletId}
            />
            <FeeRecipientCard />
          </div>
        </div>
      </main>

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
