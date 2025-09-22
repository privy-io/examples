import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import {
  useLogout,
  usePrivy,
  useWallets,
} from '@privy-io/react-auth';
import Head from 'next/head';
import { addressToEmptyAccount, createKernelAccount } from "@zerodev/sdk";
import { useSmartAccount } from '../components/smart-account-context';
import { serializePermissionAccount, toPermissionValidator } from '@zerodev/permissions';
import { toECDSASigner } from '@zerodev/permissions/signers';
import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless';

export default function LoginPage() {
  const router = useRouter();

  // Show a loading state when we create the wallet
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  const {
    ready,
    authenticated,
    user,
    getAccessToken,
    createWallet,
  } = usePrivy();
  const { smartAccountClient, publicClient, ecdsaValidator } = useSmartAccount();


  const { wallets } = useWallets();
  const { logout } = useLogout({
    onSuccess: () => {
      console.log('🫥 ✅ logOut onSuccess');
      router.push('/');
    },
  });

  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
  
  async function deleteUser() {
    const authToken = await getAccessToken();
    try {
      await axios.delete('/api/users/me', {
        headers: {
          ...(authToken
            ? {
              Authorization: `Bearer ${authToken}`,
            }
            : undefined),
        },
      });
    } catch (error) {
      console.error(error);
    }
    logout();
  }

  async function addSessionKey() {
    if (!smartAccountClient) return;

    const authToken = await getAccessToken();
    let sessionKeyAddress: `0x${string}` | undefined = undefined;
    try {
      const { data } = await axios.post('/api/session_key/init', {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      sessionKeyAddress = data.session_key_address as `0x${string}`;
    } catch (error) {
      console.error(error);
    }

    if (!sessionKeyAddress) return;

    const emptyAccount = addressToEmptyAccount(sessionKeyAddress)
    const emptySessionKeySigner = await toECDSASigner({ signer: emptyAccount })

    // @ts-ignore
    const permissionPlugin = await toPermissionValidator(publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      signer: emptySessionKeySigner,
      policies: [
        // your policies
      ],
    });

    // @ts-ignore
    const sessionKeyAccount = await createKernelAccount(publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      plugins: {
        sudo: ecdsaValidator,
        regular: permissionPlugin,
      },
    });

    const approval = await serializePermissionAccount(sessionKeyAccount);
    try {
      const { data } = await axios.post('/api/session_key/register', {
        session_key_approval: approval
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      sessionKeyAddress = data.session_key_address as `0x${string}`;
    } catch (error) {
      console.error(error);
    }
  }

  const onCreate = async () => {
    setIsCreatingWallet(true);
    try {
      await createWallet();
    } catch (error) {
      console.error('Create wallet error: ', error);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  return (
    <>
      <Head>
        <title>Privy Account Abstraction Example with Session Keys</title>
      </Head>

      <main className="flex min-h-screen flex-col bg-privy-light-blue px-4 py-6 sm:px-20 sm:py-10">
        {isCreatingWallet && (
          <div className="fixed top-0 left-0 w-full bg-slate-700 py-2 text-center text-xs text-white">
            Creating embedded wallet...
          </div>
        )}
        {ready && authenticated ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">Privy Account Abstraction Example with Session Keys</h1>
              <div className="flex flex-row gap-4">
                <button
                  onClick={addSessionKey}
                  className="rounded-md bg-violet-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900"
                >
                  Add session
                </button>
                <button onClick={() => router.push("/session")}
                  className="rounded-md bg-violet-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900"

                >
                  Session user view
                </button>
                <button
                  onClick={deleteUser}
                  className="rounded-md bg-violet-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900"
                >
                  Delete my data
                </button>
                <button
                  onClick={logout}
                  className="rounded-md bg-violet-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="flex flex-row items-start gap-2 py-2">
              {!embeddedWallet && (
                <button
                  className="w-[180px] rounded-md bg-violet-600 py-2 px-4 text-sm text-white transition-all hover:bg-violet-700"
                  onClick={onCreate}
                >
                  Create a smart account
                </button>
              )}
            </div>
          
            {embeddedWallet && smartAccountClient?.account ? (
              <>
                <p className="mt-6 text-sm font-bold uppercase text-gray-600">Privy embedded wallet signer: {embeddedWallet?.address}</p>
                <textarea
                  value={JSON.stringify(embeddedWallet, null, 2)}
                  className="mt-2 max-w-4xl rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 sm:text-sm"
                  rows={JSON.stringify(embeddedWallet, null, 2).split('\n').length}
                  disabled
                />
                <p className="mt-6 text-sm font-bold uppercase text-gray-600">Smart account object: {smartAccountClient?.account?.address}</p>
                <textarea
                  value={JSON.stringify(smartAccountClient?.account, null, 2)}
                  className="mt-2 max-w-4xl rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 sm:text-sm"
                  rows={JSON.stringify(smartAccountClient?.account, null, 2).split('\n').length}
                  disabled
                />
              </>
            ) : null}

            <p className="mt-6 text-sm font-bold uppercase text-gray-600">User object</p>
            <textarea
              value={JSON.stringify(user, null, 2)}
              className="mt-2 max-w-4xl rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 sm:text-sm"
              rows={JSON.stringify(user, null, 2).split('\n').length}
              disabled
            />
          </>
        ) : null}
      </main>
    </>
  );
}
