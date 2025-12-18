interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className = "",
  padding = "md",
}: GlassCardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`rounded-lg backdrop-blur-xl ${paddingClasses[padding]} ${className}`}
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
      }}
    >
      {children}
    </div>
  );
}
