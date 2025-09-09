"use client";

import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      // @ts-expect-error - apiUrl is an internal prop for PrivyProvider
      apiUrl={process.env.NEXT_PUBLIC_PRIVY_AUTH_URL}
    >
      {children}
    </PrivyProvider>
  );
}
