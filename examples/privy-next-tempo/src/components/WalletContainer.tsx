import { motion } from "motion/react";

interface WalletContainerProps {
  children: React.ReactNode;
  animate?: boolean;
}

export function WalletContainer({
  children,
  animate = false,
}: WalletContainerProps) {
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full overflow-y-auto"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="container mx-auto px-4 py-8 max-w-md"
        >
          {children}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="w-full overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-md">{children}</div>
    </div>
  );
}
