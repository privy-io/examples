import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image.png`,
  button: {
    title: "Privy Farcaster Miniapp Demo",
    action: {
      type: "launch_frame",
      name: "Privy Farcaster Miniapp Demo",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased p-12`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
