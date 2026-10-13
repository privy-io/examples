"use client";

// The Privy SDK's authorization-signature signing path expects a global
// Buffer, which browsers do not provide. Must run before PrivyProvider mounts.
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  (window as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

import { PrivyProvider } from "@privy-io/react-auth";

/**
 * `authBase` is passed down from the server layout so the client SDK and the
 * server share one auth host, defined in `privy-env.ts`.
 */
export function Providers({
  authBase,
  children,
}: {
  authBase: string;
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      apiUrl={authBase}
      config={{
        loginMethods: ["email", "google"],
        appearance: { theme: "light" },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
