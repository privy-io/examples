import { useCallback } from "react";
import { STRAWBERRY_APP_ID } from "./constants";
import {
  SendTransactionParameters,
  SignTypedDataParameters,
} from "@wagmi/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  useConnect,
  useDisconnect,
  createConfig,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  WagmiProvider,
} from "wagmi";
import { strawberryConnector } from "./strawberryConnector";

export const StrawberryWalletProvider = ({
  children,
}: React.PropsWithChildren) => {
  const wagmiConfig = createConfig({
    chains: [baseSepolia],
    ssr: true,
    connectors: [strawberryConnector()],
    transports: { [baseSepolia.id]: http() },
    multiInjectedProviderDiscovery: false,
  });

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};

export const useStrawberrySdk = () => {
  const { connect, connectors } = useConnect();
  const { sendTransactionAsync } = useSendTransaction();
  const { signTypedDataAsync } = useSignTypedData();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const login = useCallback(async () => {
    const connector = connectors.find((c) => c.id === STRAWBERRY_APP_ID);
    if (!connector) {
      throw new Error("Connector not found");
    }
    return connect({ connector });
  }, [connect, connectors]);

  const logout = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const signMessage = useCallback(
    async (message: string) => {
      return signMessageAsync({ message });
    },
    [signMessageAsync]
  );

  const signTypedData = useCallback(
    async (data: SignTypedDataParameters) => {
      return signTypedDataAsync(data);
    },
    [signTypedDataAsync]
  );

  const sendTransaction = useCallback(
    async (data: SendTransactionParameters) => {
      return sendTransactionAsync(data);
    },
    [sendTransactionAsync]
  );

  return {
    login,
    logout,
    signMessage,
    signTypedData,
    sendTransaction,
  };
};
