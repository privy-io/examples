export function SkeletonButton() {
  return (
    <div
      className="rounded-lg backdrop-blur-xl animate-pulse"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        height: "96px",
      }}
    />
  );
}
