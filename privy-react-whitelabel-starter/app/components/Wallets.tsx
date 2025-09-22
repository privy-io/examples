'use client';
import React, {useEffect, useState} from 'react';
import {
  usePrivy,
  useWallets,
  useSolanaWallets,
  WalletWithMetadata,
  useGuestAccounts,
} from '@privy-io/react-auth';
import {useCreateWallet as useCreateExtendedWallet} from '@privy-io/react-auth/extended-chains';
import {useRouter} from 'next/navigation';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EthereumWallet from '../components/EthereumWallet';
import SolanaWallet from '../components/SolanaWallet';
import SmartWallet from '../components/SmartWallet';

export default function Wallets() {
  const router = useRouter();

  const {ready, authenticated, createWallet: createEthereumWallet, user} = usePrivy();
  const {wallets: ethereumWallets} = useWallets();
  const {createWallet: createSolanaWallet, wallets: solanaWallets} = useSolanaWallets();
  const {createWallet: createExtendedWallet} = useCreateExtendedWallet();
  const {createGuestAccount} = useGuestAccounts();
  const [showSmartWallet, setShowSmartWallet] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  console.log(user);
  const smartWallet = user?.linkedAccounts.find((account) => account.type === 'smart_wallet');

  const embeddedEthereumWallets = ethereumWallets.filter(
    (wallet) => wallet.walletClientType === 'privy',
  );

  const hasExistingSolanaWallet = user?.linkedAccounts.some(
    (account): account is WalletWithMetadata =>
      account.type === 'wallet' &&
      account.walletClientType === 'privy' &&
      account.chainType === 'solana',
  );

  /**
   *
   * If the user clicks create wallet before they have created an account
   * creat a guest account for them so they can create a wallet
   *
   * We create a useEffect to handle the pending action once a the
   * guest account is created, so that createEthereumWallet / createSolanaWallet
   * are updated with the user
   */

  useEffect(() => {
    if (pendingAction === 'Ethereum') {
      createEthereumWallet({createAdditional: true});
    } else if (pendingAction === 'Solana') {
      createSolanaWallet();
    } else if (pendingAction === 'Cosmos') {
      createExtendedWallet({chainType: 'cosmos'});
    } else if (pendingAction === 'Bitcoin') {
      createExtendedWallet({chainType: 'bitcoin-segwit'});
    } else if (pendingAction === 'Stellar') {
      createExtendedWallet({chainType: 'stellar'});
    } else if (pendingAction === 'Sui') {
      createExtendedWallet({chainType: 'sui'});
    } else if (pendingAction === 'Tron') {
      createExtendedWallet({chainType: 'tron'});
    } else if (pendingAction === 'Near') {
      createExtendedWallet({chainType: 'near'});
    } else if (pendingAction === 'Ton') {
      createExtendedWallet({chainType: 'ton'});
    } else if (pendingAction === 'Starknet') {
      createExtendedWallet({chainType: 'starknet'});
    } else if (pendingAction === 'Spark') {
      createExtendedWallet({chainType: 'spark'});
    } else if (pendingAction === 'EthereumSmartWallet') {
      setShowSmartWallet(true);
    }
    setPendingAction('');
  }, [
    user,
    createEthereumWallet,
    createSolanaWallet,
    createExtendedWallet,
    pendingAction,
    setPendingAction,
  ]);

  const createWallet = async (walletType: string) => {
    if (ready && !authenticated && !user?.isGuest) {
      await createGuestAccount();
    }
    setPendingAction(walletType);
  };

  if (!ready) {
    return;
  }

  return (
    <div className="mx-4 px-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-center my-4">Your wallets</h1>
      <div className="text-center mt-4 mx-auto mb-4">
        <p className="status-text">
          Privy enables you to create self-custodial wallets for your authenticated users, across
          chains. These wallets support all common RPCs. Create wallets below to test signing
          messages and sending transactions.
        </p>
        <div className="mb-2 mt-2 flex flex-col sm:flex-row justify-center">
          <a
            href="https://docs.privy.io/guide/react/wallets/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="link mb-2 sm:mb-0 sm:mr-4 status-text"
          >
            Ethereum wallets guide
          </a>
          <a
            href="https://docs.privy.io/guide/react/wallets/solana/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="link status-text"
          >
            Solana wallets guide
          </a>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={() => createWallet('Ethereum')} className="btn">
          <div className="btn-text text-black">Create Ethereum wallet</div>
        </button>
        <button
          onClick={() => createWallet('EthereumSmartWallet')}
          className={`btn ${embeddedEthereumWallets.length === 0 ? 'btn-disabled' : ''}`}
          disabled={embeddedEthereumWallets.length === 0 || showSmartWallet}
        >
          <div
            className={`${embeddedEthereumWallets.length === 0 || showSmartWallet ? 'btn-text-disabled' : 'text-black'} btn-text`}
          >
            Create Ethereum smart wallet
          </div>
        </button>
        <button
          onClick={() => createWallet('Solana')}
          className={`btn ${hasExistingSolanaWallet ? 'btn-disabled' : ''}`}
          disabled={hasExistingSolanaWallet}
        >
          <div
            className={`${hasExistingSolanaWallet ? 'btn-text-disabled' : 'text-black'} btn-text`}
          >
            Create Solana wallet
          </div>
        </button>
        <button onClick={() => createWallet('Cosmos')} className="btn">
          <div className="btn-text text-black">Create Cosmos wallet</div>
        </button>
        <button onClick={() => createWallet('Bitcoin')} className="btn">
          <div className="btn-text text-black">Create Bitcoin wallet</div>
        </button>
        <button onClick={() => createWallet('Stellar')} className="btn">
          <div className="btn-text text-black">Create Stellar wallet</div>
        </button>
        <button onClick={() => createWallet('Sui')} className="btn">
          <div className="btn-text text-black">Create Sui wallet</div>
        </button>
        <button onClick={() => createWallet('Tron')} className="btn">
          <div className="btn-text text-black">Create Tron wallet</div>
        </button>
        <button onClick={() => createWallet('Near')} className="btn">
          <div className="btn-text text-black">Create Near wallet</div>
        </button>
        <button onClick={() => createWallet('Ton')} className="btn">
          <div className="btn-text text-black">Create Ton wallet</div>
        </button>
        <button onClick={() => createWallet('Starknet')} className="btn">
          <div className="btn-text text-black">Create Starknet wallet</div>
        </button>
        <button onClick={() => createWallet('Spark')} className="btn">
          <div className="btn-text text-black">Create Spark wallet</div>
        </button>
      </div>
      <div className="mt-4">
        <div className="mb-4">
          {embeddedEthereumWallets.length > 0 && (
            <h2 className="text-xl font-semibold mb-2">Ethereum:</h2>
          )}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
            {embeddedEthereumWallets.length > 0 &&
              embeddedEthereumWallets.map((wallet, index) => (
                <div key={wallet.address}>
                  <EthereumWallet wallet={wallet} index={index} />
                </div>
              ))}
            {showSmartWallet && smartWallet && (
              <div>
                <SmartWallet
                  key={smartWallet.address}
                  wallet={smartWallet}
                  signer={embeddedEthereumWallets[embeddedEthereumWallets.length - 1].address}
                />
              </div>
            )}
          </div>
        </div>
        {solanaWallets.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Solana</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
              {solanaWallets.map((wallet, index) => (
                <div key={wallet.address}>
                  <SolanaWallet wallet={wallet} index={index} />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Extended chains (non-Ethereum/Solana) */}
        {user &&
          (() => {
            const extendedWallets = user.linkedAccounts.filter(
              (account): account is WalletWithMetadata =>
                account.type === 'wallet' &&
                account.chainType !== 'ethereum' &&
                account.chainType !== 'solana',
            );
            if (extendedWallets.length === 0) return null;
            return (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Other chains</h2>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                  {extendedWallets.map((wallet, index) => (
                    <div key={`${wallet.chainType}-${wallet.address}`} className="wallet-container">
                      <h3 className="wallet-header capitalize">
                        {wallet.chainType} wallet {index + 1}
                      </h3>
                      <p className="wallet-address">
                        <span className="break-all">{wallet.address}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
