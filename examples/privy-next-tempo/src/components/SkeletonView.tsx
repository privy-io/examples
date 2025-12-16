import { WalletContainer } from "./WalletContainer";
import { WalletHeader } from "./WalletHeader";
import { SkeletonCard } from "./SkeletonCard";
import { SkeletonButton } from "./SkeletonButton";
import { GlassCard } from "./GlassCard";

export function SkeletonView() {
  return (
    <WalletContainer>
      <WalletHeader />
      <SkeletonCard />
      <div className="grid grid-cols-2 gap-4 mb-12">
        <SkeletonButton />
        <SkeletonButton />
      </div>
      <GlassCard>
        <div
          className="h-3 w-28 rounded mb-6"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
        />
        <div className="space-y-4">
          <div className="animate-pulse">
            <div
              className="h-12 w-full rounded"
              style={{ background: "rgba(255, 255, 255, 0.05)" }}
            />
          </div>
          <div className="animate-pulse">
            <div
              className="h-12 w-full rounded"
              style={{ background: "rgba(255, 255, 255, 0.05)" }}
            />
          </div>
        </div>
      </GlassCard>
    </WalletContainer>
  );
}
