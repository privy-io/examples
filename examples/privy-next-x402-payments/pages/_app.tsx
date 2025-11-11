import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { PrivyProvider } from "@privy-io/react-auth";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Privy x402 Payments Example</title>
        <meta
          name="description"
          content="Privy x402 payment protocol integration example"
        />
        <link rel="icon" href="/privy-logo.png" />
      </Head>

      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        config={{
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          defaultChain: {
            id: 84532, // Base Sepolia
            name: "Base Sepolia",
            network: "base-sepolia",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ["https://sepolia.base.org"],
              },
            },
            blockExplorers: {
              default: {
                name: "BaseScan",
                url: "https://sepolia.basescan.org",
              },
            },
            testnet: true,
          },
        }}
      >
        <Component {...pageProps} />
      </PrivyProvider>
    </>
  );
}

export default MyApp;
