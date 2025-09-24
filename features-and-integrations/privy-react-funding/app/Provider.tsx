"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { PropsWithChildren } from "react";

const Provider = ({ children }: PropsWithChildren) => (
  <PrivyProvider
    appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
    config={{ embeddedWallets: { createOnLogin: "all-users" } }}
  >
    {children}
  </PrivyProvider>
);

export default Provider;
