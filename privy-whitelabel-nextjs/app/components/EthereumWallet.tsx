import React, {useState} from 'react';
import {usePrivy, ConnectedWallet} from '@privy-io/react-auth';
import {baseSepolia} from 'viem/chains';
import {toast} from 'react-toastify';

interface EthereumWalletProps {
  wallet: ConnectedWallet;
  index: number;
}

const EthereumWallet: React.FC<EthereumWalletProps> = ({wallet, index}) => {
  const [showSignMessage, setShowSignMessage] = useState(false);
  const [showSendTransaction, setShowSendTransaction] = useState(false);
  const {sendTransaction, signMessage} = usePrivy();

  const customCreateAndSendTransaction = async (address: string, value: number) => {
    const transactionRequest = {
      to: address,
      chainId: baseSepolia.id,
      value: value,
    };
    try {
      const {hash} = await sendTransaction(transactionRequest);
      toast.success(`Transaction sent successfully! ${hash}`);
    } catch (error: any) {
      console.log(error.message);
      toast.error(`Failed to send transaction: ${error?.message}`);
    }
  };

  const customSignMessage = async () => {
    try {
      const {signature} = await signMessage({ message: 'Your messsage here' });
      toast.success(`Message signed successfully! ${signature}`);
    } catch (error: any) {
      toast.error(`Failed to send transaction: ${error?.message}`);
    }
  };

  return (
    <div className="wallet-container">
      <h3 className="wallet-header">Embedded wallet {index + 1}</h3>
      <p className="wallet-address">{wallet.address}</p>
      <p className="wallet-chainId">ChainId: {wallet.chainId}</p>
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
              onClick={() => customSignMessage()}
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
              onClick={() =>
                customCreateAndSendTransaction('0xF2A919977c6dE88dd8ed90feAADFcC5d65D66038', 10000)
              }
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

export default EthereumWallet;
