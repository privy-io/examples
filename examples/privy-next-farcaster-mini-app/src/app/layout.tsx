// FILE ALTERED FROM CANONICAL STARTER

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/providers/providers";

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

export const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image.png`,
  button: {
    title: "Privy Farcaster Miniapp Demo",
    action: {
      type: "launch_frame",
      name: "Privy Farcaster Miniapp Demo",
      url: appUrl,
      splashImageUrl: `${appUrl}/BG.svg`,
      splashBackgroundColor: "#000000",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privy Farcaster Miniapp Demo",
    openGraph: {
      title: "Privy Farcaster Miniapp Demo",
      description: "A Privy Farcaster Miniapp demo app.",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${abcFavorit.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
