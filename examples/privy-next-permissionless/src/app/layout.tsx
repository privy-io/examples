import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../providers/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const abcFavorit = Inter({
  subsets: ["latin"],
  variable: "--font-abc-favorit",
});

export const metadata: Metadata = {
  title: "Privy x Permissionless Demo",
  description:
    "A demo showcasing Privy authentication with Permissionless smart accounts",
  icons: {
    icon: [
      { url: "/favicons/favicon.ico", sizes: "any" },
      { url: "/favicons/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${abcFavorit.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
