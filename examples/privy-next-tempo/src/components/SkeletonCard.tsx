import { GlassCard } from "./GlassCard";

export function SkeletonCard() {
  return (
    <GlassCard padding="lg" className="mb-6">
      <div className="animate-pulse">
        <div
          className="h-3 w-24 rounded mb-6"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
        />
        <div
          className="h-16 w-48 rounded mb-8"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
        />
        <div
          className="h-3 w-32 rounded"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
        />
      </div>
    </GlassCard>
  );
}
