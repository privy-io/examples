import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { PRIVY_AUTH_BASE } from "@/lib/privy-env";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fiat Orchestration Demo",
  description:
    "Privy fiat orchestration APIs — KYC, deposit accounts, and offramp via Bridge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        {/* Server component, so PRIVY_ENV resolves here and the client SDK
            inherits the same environment from a single variable. */}
        <Providers authBase={PRIVY_AUTH_BASE}>{children}</Providers>
      </body>
    </html>
  );
}
