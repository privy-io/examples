'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import {baseSepolia} from 'viem/chains';
import {SmartWalletsProvider} from '@privy-io/react-auth/smart-wallets';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: 'light',
        },
        defaultChain: baseSepolia,
        embeddedWallets: {
          createOnLogin: 'off', // Anything other than 'off' will not be honored with whitelabel Auth. You must use createWallet from usePrivy()
          showWalletUIs: false,
        },
      }}
    >
      {/* Remove <SmartWalletsProvider if you do not want to use smart wallets */}
      <SmartWalletsProvider>{children}</SmartWalletsProvider>
    </PrivyProvider>
  );
}
