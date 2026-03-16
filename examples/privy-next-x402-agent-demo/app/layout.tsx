import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'x402 Agent Demo | Privy',
  description:
    'Demo showcasing x402 payment protocol with Privy agentic wallets. Create AI agents, fund them, set spending policies, and execute autonomous HTTP 402 payments.',
  openGraph: {
    title: 'x402 Agent Demo | Privy',
    description:
      'x402 payment protocol demo with Privy agentic wallets.',
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
