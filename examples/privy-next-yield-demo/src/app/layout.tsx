import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PrivyProvider } from "@/components/PrivyProvider";

const inter = localFont({
  src: "../../public/fonts/InterVariable.ttf",
  variable: "--font-inter",
  display: "swap",
});

const abcFavorit = localFont({
  src: "../../public/fonts/ABCFavorit-Medium.woff2",
  variable: "--font-abc-favorit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Privy Yield Demo",
  description: "Earn yield on your USDC with Privy Yield",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${abcFavorit.variable} antialiased`}>
        <PrivyProvider>
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
