'use client';
import {useConnectWallet, useLoginWithSiws} from '@privy-io/react-auth';
import {useConnectedStandardWallets} from '@privy-io/react-auth/solana';
import {toast} from 'react-toastify';

const toBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};
const SIWS = () => {
  const {connectWallet} = useConnectWallet();
  const {wallets} = useConnectedStandardWallets();
  const {generateSiwsMessage, loginWithSiws} = useLoginWithSiws();

  const handleLoginWithSiws = async () => {
    if (!wallets[0]) {
      toast.success(`No wallet found`);
      return;
    }
    const message = await generateSiwsMessage({
      address: wallets[0].address,
    });

    const encoded: Uint8Array = new TextEncoder().encode(message);
    const {signature} = await wallets[0].signMessage({message: encoded});
    await loginWithSiws({
      signature: toBase64(signature),
      message,
    });
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() =>
          connectWallet({
            walletChainType: 'solana-only',
          })
        }
        className="btn"
      >
        <div className="btn-text">Connect Wallet</div>
      </button>
      <button onClick={() => handleLoginWithSiws()} className="btn">
        <div className="btn-text">Login with SIWS</div>
      </button>
    </div>
  );
};

export default SIWS;
