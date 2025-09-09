import '../styles/globals.css';
import type {AppProps} from 'next/app';
import Head from 'next/head';
import React from 'react';

import {PrivyProvider} from '@privy-io/react-auth';

import { SmartAccountProvider } from '../components/smart-account-context';

const privyLogo = 'https://pub-dc971f65d0aa41d18c1839f8ab426dcb.r2.dev/privy.png';

function MyApp({Component, pageProps}: AppProps) {
  return (
    <>
      <Head>
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Regular.woff2" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff" as="font" crossOrigin="" />
        <link rel="preload" href="/fonts/AdelleSans-Semibold.woff2" as="font" crossOrigin="" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Disallow crawlers */}
        <meta name="robots" content="noindex" />

        <title>Privy Auth Demo</title>
        <meta name="description" content="Privy Account Abstraction Example with Session Keys" />
      </Head>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
        // Exists but is hidden as a private feature
        // @ts-ignore
        apiUrl={process.env.NEXT_PUBLIC_PRIVY_AUTH_URL}
        config={{
          appearance: {
            logo: privyLogo,
          },
          embeddedWallets: {
            noPromptOnSignature: false,
          },
          loginMethods: ['email', 'google']
        }}
      >
        <SmartAccountProvider>
          <Component {...pageProps} />
        </SmartAccountProvider>
      </PrivyProvider>
    </>
  );
}

export default MyApp;
