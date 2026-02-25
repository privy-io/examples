'use client';

import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { base } from 'viem/chains';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <BasePrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#5B4FFF',
        },
        loginMethods: ['email', 'wallet', 'google', 'apple'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: base,
        supportedChains: [base],
      }}
    >
      {children}
    </BasePrivyProvider>
  );
}
