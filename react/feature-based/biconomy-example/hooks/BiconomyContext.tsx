import React, { useState, useMemo, useEffect, useContext } from "react";
import { IBundler, Bundler } from '@biconomy/bundler';
import { IPaymaster, BiconomyPaymaster } from '@biconomy/paymaster';
import { ChainId } from "@biconomy/core-types";
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS  } from "@biconomy/account";
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";
import { ConnectedWallet, usePrivy, useWallets } from '@privy-io/react-auth';

interface BiconomyInterface {
    smartAccount?: BiconomySmartAccountV2;
    smartAccountAddress?: string;
};

const BiconomyContext = React.createContext<BiconomyInterface>({
    smartAccount: undefined,
    smartAccountAddress: undefined
});

export const useBiconomy = () => {
    return useContext(BiconomyContext);
};

export const BiconomyProvider = ({ children }: { children: React.ReactNode }) => {
    const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | undefined>();
    const [smartAccountAddress, setSmartAccountAddress] = useState<string | undefined>();
    const {wallets} = useWallets();
    const {ready, authenticated} = usePrivy();

    const bundler: IBundler = useMemo(() => new Bundler({
        bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL as string,
        chainId: ChainId.POLYGON_MUMBAI,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      }), []);

    const paymaster: IPaymaster = useMemo(() => new BiconomyPaymaster({
        paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL as string,
      }), []);

    const createBiconomyAccountFromEOA = async (wallet: ConnectedWallet) => {
        await wallet.switchChain(80001);
        const provider = await wallet.getEthersProvider();
        const signer = provider.getSigner();

        const validationModule = await ECDSAOwnershipValidationModule.create({
            signer: signer,
            moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
        });

        const biconomySmartAccount = await BiconomySmartAccountV2.create({
            provider: provider,
            chainId: ChainId.POLYGON_MUMBAI,
            bundler: bundler,
            paymaster: paymaster,
            entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
            defaultValidationModule: validationModule,
            activeValidationModule: validationModule,
            rpcUrl: `https://polygon-mumbai.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
        });


        setSmartAccount(biconomySmartAccount);
        const address = await biconomySmartAccount.getAccountAddress();
        setSmartAccountAddress(address);
    }

    useEffect(() => {
        if (!ready || !authenticated) return;
        const embeddedWallet = wallets.find((wallet) => (wallet.walletClientType === 'privy'));
        if (embeddedWallet && !smartAccount) createBiconomyAccountFromEOA(embeddedWallet);
    }, [wallets]);


    return (
        <BiconomyContext.Provider value={{smartAccount: smartAccount, smartAccountAddress: smartAccountAddress}}>{children}</BiconomyContext.Provider>
    );
};