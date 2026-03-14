import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MPP Agent Demo | Privy',
  description:
    'Demo showcasing MPP (Machine Payments Protocol) with Privy agentic wallets. Create AI agents, fund them, and execute autonomous HTTP 402 payments.',
  openGraph: {
    title: 'MPP Agent Demo | Privy',
    description:
      'MPP payment protocol demo with Privy agentic wallets.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
