"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { WalletCard } from "@/components/WalletCard";
import { DepositForm } from "@/components/DepositForm";
import { WithdrawForm } from "@/components/WithdrawForm";
import { PositionDisplay } from "@/components/PositionDisplay";
import { FeeRecipientCard } from "@/components/FeeRecipientCard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { Header } from "@/components/ui/header";

export default function Dashboard() {
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

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
      <Header authenticated={true} onLogout={logout} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[84px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Wallet & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <WalletCard />
            <DepositForm onSuccess={handleTransactionSuccess} />
            <WithdrawForm onSuccess={handleTransactionSuccess} />
          </div>

          {/* Right Column - Position & Vault Info */}
          <div className="lg:col-span-2 space-y-6">
            <PositionDisplay key={`position-${refreshKey}`} />
            <TransactionHistory refreshKey={refreshKey} />
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
