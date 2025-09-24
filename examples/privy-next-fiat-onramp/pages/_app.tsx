import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import React from "react";
import { mainnet } from "viem/chains";
import localFont from "next/font/local";

const inter = localFont({
  src: "../public/fonts/InterVariable.ttf",
  variable: "--font-inter",
  display: "swap",
});

const abcFavorit = localFont({
  src: "../public/fonts/ABCFavorit-Medium.woff2",
  variable: "--font-abc-favorit",
  display: "swap",
});

const privyLogo =
  "https://pub-dc971f65d0aa41d18c1839f8ab426dcb.r2.dev/privy.png";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>

        <link rel="icon" href="/favicon.ico" sizes="any" />

        <title>Fiat Onramp Demo</title>
        <meta
          name="description"
          content="Demo implementation of Privy with a fiat on-ramp"
        />
      </Head>
      <div className={`${inter.variable} ${abcFavorit.variable} antialiased`}>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        config={{
          defaultChain: mainnet,
          appearance: {
            logo: privyLogo,
          },
          embeddedWallets: {
            solana: {
              createOnLogin: "users-without-wallets",
            },
            ethereum: {
              createOnLogin: "users-without-wallets",
            },
          },
        }}
      >
        <Component {...pageProps} />
      </PrivyProvider>
      </div>
    </>
  );
}

export default MyApp;
