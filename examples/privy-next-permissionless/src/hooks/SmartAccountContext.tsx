import React, { useState, useEffect, useContext } from "react";
import { ConnectedWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { baseSepolia } from "viem/chains";
import { Chain, Transport } from "viem";
import {
  signerToSafeSmartAccount,
  SmartAccount,
} from "permissionless/accounts";
import {
  walletClientToSmartAccountSigner,
  type SmartAccountClient,
  createSmartAccountClient,
  ENTRYPOINT_ADDRESS_V07,
} from "permissionless";
import { EntryPoint } from "permissionless/types";
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";

/** Interface returned by custom `useSmartAccount` hook */
interface SmartAccountInterface {
  /** Privy embedded wallet, used as a signer for the smart account */
  eoa: ConnectedWallet | undefined;
  /** Smart account client to send signature/transaction requests to the smart account */
  smartAccountClient:
    | SmartAccountClient<
        EntryPoint,
        Transport,
        Chain,
        SmartAccount<EntryPoint, string, Transport, Chain>
      >
    | Transport
    | any
    | SmartAccount<EntryPoint, string, Transport, Chain>
    | null;
  /** Smart account address */
  smartAccountAddress: `0x${string}` | undefined;
  /** Boolean to indicate whether the smart account state has initialized */
  smartAccountReady: boolean;
}

const SmartAccountContext = React.createContext<SmartAccountInterface>({
  eoa: undefined,
  smartAccountClient: undefined,
  smartAccountAddress: undefined,
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
  const { ready } = usePrivy();
  // Find the embedded wallet by finding the entry in the list with a `walletClientType` of 'privy'
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy",
  );

  // States to store the smart account and its status
  const [eoa, setEoa] = useState<ConnectedWallet | undefined>();
  const [smartAccountClient, setSmartAccountClient] = useState<
    | SmartAccountClient<
        EntryPoint,
        Transport,
        Chain,
        SmartAccount<EntryPoint, string, Transport, Chain>
      >
    | Transport
    | any
    | SmartAccount<EntryPoint, string, Transport, Chain>
    | null
  >();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    `0x${string}` | undefined
  >();
  const [smartAccountReady, setSmartAccountReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
  }, [ready, embeddedWallet]);

  useEffect(() => {
    // Creates a smart account given a Privy `ConnectedWallet` object representing
    // the  user's EOA.
    const createSmartWallet = async (eoa: ConnectedWallet) => {
      setEoa(eoa);
      // Get an EIP1193 provider and viem WalletClient for the EOA
      const eip1193provider = await eoa.getEthereumProvider();
      const privyClient = createWalletClient({
        account: eoa.address as `0x${string}`,
        chain: baseSepolia,
        transport: custom(eip1193provider),
      });

      const customSigner = walletClientToSmartAccountSigner(privyClient);

      const publicClient = createPublicClient({
        chain: baseSepolia, // Replace this with the chain of your app
        transport: http(),
      });

      const safeAccount = await signerToSafeSmartAccount(publicClient, {
        signer: customSigner,
        safeVersion: "1.4.1",
        entryPoint: ENTRYPOINT_ADDRESS_V07,
      });

      const pimlicoPaymaster = createPimlicoPaymasterClient({
        chain: baseSepolia,
        transport: http(process.env.NEXT_PUBLIC_PIMLICO_PAYMASTER_URL),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
      });

      const pimlicoBundler = createPimlicoBundlerClient({
        transport: http(process.env.NEXT_PUBLIC_PIMLICO_PAYMASTER_URL),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
      });

      const smartAccountClient = createSmartAccountClient({
        account: safeAccount,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain: baseSepolia, // Replace this with the chain for your app
        bundlerTransport: http(process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL),
        middleware: {
          sponsorUserOperation: pimlicoPaymaster.sponsorUserOperation,
          gasPrice: async () =>
            (await pimlicoBundler.getUserOperationGasPrice()).fast,
        },
      });

      const smartAccountAddress = smartAccountClient.account?.address;

      setSmartAccountClient(smartAccountClient);
      setSmartAccountAddress(smartAccountAddress);
      setSmartAccountReady(true);
    };

    if (embeddedWallet) createSmartWallet(embeddedWallet);
  }, [embeddedWallet]);

  return (
    <SmartAccountContext.Provider
      value={{
        smartAccountReady: smartAccountReady,
        smartAccountClient: smartAccountClient,
        smartAccountAddress: smartAccountAddress,
        eoa: eoa,
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};
