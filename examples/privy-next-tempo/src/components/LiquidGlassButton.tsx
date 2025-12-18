import { motion } from "motion/react";

interface LiquidGlassButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function LiquidGlassButton({
  onClick,
  children,
  className = "",
  fullWidth = false,
}: LiquidGlassButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`relative py-6 rounded-lg backdrop-blur-sm font-light tracking-wide transition-all duration-300 border border-white/50 hover:bg-white/30 ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.025)",
        color: "var(--text-primary)",
      }}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-70 pointer-events-none" />
      <div className="absolute inset-0 rounded-lg bg-gradient-to-tl from-white/30 via-transparent to-transparent opacity-50 pointer-events-none" />
      <div className="relative">{children}</div>
    </motion.button>
  );
}
