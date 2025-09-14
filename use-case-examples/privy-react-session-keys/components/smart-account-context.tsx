
import React, { useState, useEffect, useContext, useMemo } from "react";
import { ConnectedWallet, useWallets } from "@privy-io/react-auth";
import { ENTRYPOINT_ADDRESS_V07, providerToSmartAccountSigner } from 'permissionless';
import {KernelValidator, signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {createZeroDevPaymasterClient, createKernelAccountClient, createKernelAccount, KernelAccountClient} from "@zerodev/sdk";
import { Client, EIP1193Provider, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { SmartAccountSigner } from "permissionless/accounts";

interface SmartAccountInterface {
  smartAccountClient?: KernelAccountClient<any>;
  smartAccountSigner?: SmartAccountSigner<"custom", `0x${string}`>;
  ecdsaValidator?: KernelValidator<"0x0000000071727De22E5E9d8BAf0edAc6f37da032", "ECDSAValidator"> ;
  publicClient?: Client;
  smartAccountReady: boolean;
}

const SmartAccountContext = React.createContext<SmartAccountInterface>({
  smartAccountClient: undefined,
  smartAccountReady: false,
});

export const useSmartAccount = () => {
  return useContext(SmartAccountContext);
};

export const SmartAccountProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Get a list of all of the wallets (EOAs) the user has connected to your site
  const { wallets } = useWallets();
  // Find the embedded wallet by finding the entry in the list with a `walletClientType` of 'privy'
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  // States to store the smart account and its status
  const [smartAccountReady, setSmartAccountReady] = useState(false);
  const [smartAccountClient, setSmartAccountClient] = useState<KernelAccountClient<any> | undefined>();
  const [smartAccountSigner, setSmartAccountSigner] = useState<SmartAccountSigner<"custom", `0x${string}`> | undefined>();
  const [ecdsaValidator, setEcdsaValidator] = useState<KernelValidator<"0x0000000071727De22E5E9d8BAf0edAc6f37da032", "ECDSAValidator"> | undefined>();
  const [publicClient, setPublicClient] = useState<Client | undefined>();


  useEffect(() => {
    const initializeSmartAccount = async (embeddedWallet: ConnectedWallet) => {
      const provider = await embeddedWallet.getEthereumProvider();
      const smartAccountSigner = await providerToSmartAccountSigner(provider as EIP1193Provider);
      setSmartAccountSigner(smartAccountSigner);

      const publicClient = createPublicClient({
        transport: http(baseSepolia.rpcUrls.default.http[0]),
      })
      setPublicClient(publicClient);

      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
      });
      setEcdsaValidator(ecdsaValidator);

      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
         entryPoint: ENTRYPOINT_ADDRESS_V07,
      });
      
      // Create a Kernel account client to send user operations from the smart account
      const kernelClient = createKernelAccountClient({
          account,
          chain: baseSepolia,
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          bundlerTransport: http(process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL),
          middleware: {
            sponsorUserOperation: async ({ userOperation }) => {
              const zerodevPaymaster = createZeroDevPaymasterClient({
                chain: baseSepolia,
                entryPoint: ENTRYPOINT_ADDRESS_V07,
                transport: http(process.env.NEXT_PUBLIC_ZERODEV_PAYMASTER_URL),
              })
              return zerodevPaymaster.sponsorUserOperation({
                userOperation,
                entryPoint: ENTRYPOINT_ADDRESS_V07,
              })
            }
          }
      });
      setSmartAccountClient(kernelClient as KernelAccountClient<any>);
      setSmartAccountReady(true);
    }

    if (embeddedWallet) {
        initializeSmartAccount(embeddedWallet);
        setSmartAccountClient
    }
  }, [embeddedWallet]);

  

  return (
    <SmartAccountContext.Provider
      value={{
        smartAccountReady: smartAccountReady,
        smartAccountClient: smartAccountClient,
        smartAccountSigner: smartAccountSigner,
        ecdsaValidator: ecdsaValidator,
        publicClient: publicClient
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};
