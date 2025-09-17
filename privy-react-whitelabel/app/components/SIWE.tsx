import {useConnectWallet, useLoginWithSiwe, useWallets} from '@privy-io/react-auth';
import {toast} from 'react-toastify';
import {baseSepolia} from 'viem/chains';

const SIWE = () => {
  const {connectWallet} = useConnectWallet();
  const {wallets} = useWallets();
  const {generateSiweMessage, loginWithSiwe} = useLoginWithSiwe();

  const handleLoginWithSiwe = async () => {
    if (!wallets[0]) {
      toast.success(`No wallet found`);
      return;
    }
    const message = await generateSiweMessage({
      address: wallets[0].address,
      chainId: `eip155:${baseSepolia.id}`,
    });

    const signature = await wallets[0].sign(message);
    loginWithSiwe({
      signature,
      message,
    });
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <button onClick={() => connectWallet({walletChainType: 'ethereum-only'})} className="btn">
        <div className="btn-text">Connect Wallet</div>
      </button>
      <button onClick={() => handleLoginWithSiwe()} className="btn">
        <div className="btn-text">Login with SIWE</div>
      </button>
    </div>
  );
};

export default SIWE;
