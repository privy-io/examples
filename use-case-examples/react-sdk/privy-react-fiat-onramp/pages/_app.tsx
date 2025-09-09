import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";
import React from "react";
import { mainnet } from "viem/chains";

const privyLogo =
  "https://pub-dc971f65d0aa41d18c1839f8ab426dcb.r2.dev/privy.png";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link
          rel="preload"
          href="/fonts/AdelleSans-Regular.woff"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Regular.woff2"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Semibold.woff"
          as="font"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/AdelleSans-Semibold.woff2"
          as="font"
          crossOrigin=""
        />

        <link rel="icon" href="/favicon.ico" sizes="any" />

        <title>Fiat Onramp Demo</title>
        <meta
          name="description"
          content="Demo implementation of Privy with a fiat on-ramp"
        />
      </Head>
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
    </>
  );
}

export default MyApp;
