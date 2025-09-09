import React, {useState} from 'react';
import {baseSepolia} from 'viem/chains';
import {useSmartWallets} from '@privy-io/react-auth/smart-wallets';
import {toast} from 'react-toastify';

interface SmartWalletProps {
  wallet: any;
  signer: string;
}

const SmartWallet: React.FC<SmartWalletProps> = ({wallet, signer}) => {
  const [showSignMessage, setShowSignMessage] = useState(false);
  const [showSendTransaction, setShowSendTransaction] = useState(false);
  const {client} = useSmartWallets();

  if (!client) {
    return <div></div>;
  }

  const signSmartWalletMessage = async () => {
    try {
      const signature = await client.signMessage({
        message: 'Hello world',
      });
      toast.success(
        `Message signed successfully! ${signature.slice(0, 5)}...${signature.slice(-5)}`,
      );
    } catch (error: any) {
      toast.error(`Failed to sign message: ${error?.message}`);
    }
  };

  const sendSmartWalletTransaction = async () => {
    try {
      const txHash = await client.sendTransaction({
        chain: baseSepolia,
        to: '0xF2A919977c6dE88dd8ed90feAADFcC5d65D66038',
        value: BigInt(0),
      });
      toast.success(`Transaction sent successfully! ${txHash}`);
    } catch (error: any) {
      toast.error(`Failed to send transaction: ${error?.message}`);
    }
  };

  return (
    <div className="wallet-container">
      <h3 className="wallet-header">Smart wallet</h3>
      <p className="wallet-address">{wallet.address}</p>
      <p className="wallet-address">Type: {wallet.smartWalletType}</p>
      <p className="wallet-address">Signer: {signer}</p>
      <div className="flex justify-between">
        <div className="flex flex-col">
          <button
            onClick={() => setShowSignMessage(true)}
            className="wallet-button wallet-button-primary mb-3"
          >
            <div className="btn-text">Sign message</div>
          </button>
          <button
            onClick={() => setShowSendTransaction(true)}
            className="wallet-button wallet-button-secondary"
          >
            <div className="btn-text">Send transaction</div>
          </button>
        </div>
      </div>
      {showSignMessage && (
        <div className="mt-4 p-2 border rounded shadow bg-white text-left">
          <h2 className="text-lg font-semibold mb-2">Sign message confirmation</h2>
          <p className="text-xs text-gray-600 mb-2">
            Signing message with Privy wallet: <span className="break-all">{wallet.address}</span>
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => signSmartWalletMessage()}
              className="wallet-button wallet-button-primary"
            >
              <div className="btn-text">Sign message</div>
            </button>
            <button
              onClick={() => setShowSignMessage(false)}
              className="wallet-button wallet-button-secondary"
            >
              <div className="btn-text">Cancel</div>
            </button>
          </div>
        </div>
      )}
      {showSendTransaction && (
        <div className="mt-4 p-2 border rounded shadow bg-white text-left">
          <h2 className="text-lg font-semibold mb-2">Custom transaction</h2>
          <p className="text-xs text-gray-600 mb-2">
            From: <br />
            <span className="break-all">{wallet.address}</span>
          </p>
          <p className="text-xs text-gray-600 mb-2">
            To: <br />
            <span className="break-all">0xF2A919977c6dE88dd8ed90feAADFcC5d65D66038</span>
          </p>
          <p className="text-xs text-gray-600 mb-2">Value: 10000</p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => sendSmartWalletTransaction()}
              className="wallet-button wallet-button-primary"
            >
              <div className="btn-text">Send</div>
            </button>
            <button
              onClick={() => setShowSendTransaction(false)}
              className="wallet-button wallet-button-secondary"
            >
              <div className="btn-text">Cancel</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartWallet;
