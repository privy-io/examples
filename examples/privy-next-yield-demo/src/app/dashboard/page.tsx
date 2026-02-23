"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WalletCard } from "@/components/WalletCard";
import { DepositForm } from "@/components/DepositForm";
import { WithdrawForm } from "@/components/WithdrawForm";
import { PositionDisplay } from "@/components/PositionDisplay";
import { FeeRecipientCard } from "@/components/FeeRecipientCard";
import { PrivyLogo } from "@/components/PrivyLogo";

export default function Dashboard() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const handleTransactionSuccess = () => {
    // Trigger a refresh of the position display
    setRefreshKey((prev) => prev + 1);
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-6 w-6 text-[#5B4FFF]"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-[#64668B]">Loading...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F1F2F9]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E3F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-[#040217]">
                Yield
              </span>
            </div>
            <div className="badge-info">Base Mainnet</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <FeeRecipientCard />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-[#E2E3F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#9498B8]">
              <span className="text-sm">Powered by</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://docs.privy.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#64668B] hover:text-[#5B4FFF] transition-colors"
              >
                Documentation
              </a>
              <a
                href="https://privy.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#64668B] hover:text-[#5B4FFF] transition-colors"
              >
                Privy.io
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
