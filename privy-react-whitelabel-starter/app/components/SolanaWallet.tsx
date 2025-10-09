import React, {useState} from 'react';
import {usePrivy} from '@privy-io/react-auth';
import {ConnectedStandardSolanaWallet, useSignMessage, useSignAndSendTransaction} from '@privy-io/react-auth/solana';
import {PublicKey, Transaction, Connection, SystemProgram} from '@solana/web3.js';
import {toast} from 'react-toastify';

interface SolanaWalletProps {
  wallet: ConnectedStandardSolanaWallet;
  index: number;
}

const SolanaWallet: React.FC<SolanaWalletProps> = ({wallet, index}) => {
  const [showSignMessage, setShowSignMessage] = useState(false);
  const [showSendTransaction, setShowSendTransaction] = useState(false);
  const {signMessage} = useSignMessage();
  const {signAndSendTransaction} = useSignAndSendTransaction();

  const customSolanaSendTransaction = async () => {
    try {
      // Configure your connection to point to the correct Solana network
      let connection = new Connection('https://api.devnet.solana.com');

      // Fetch the recent blockhash
      let {blockhash} = await connection.getLatestBlockhash();

      // Build out the transaction object for your desired program
      // https://solana-labs.github.io/solana-web3.js/classes/Transaction.html
      let transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: new PublicKey(wallet.address),
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(wallet.address),
          toPubkey: new PublicKey('4tFqt2qzaNsnZqcpjPiyqYw9LdRzxaZdX2ewPncYEWLA'),
          lamports: 1000000000, // 1 SOL = 1,000,000,000 lamports
        }),
      );

      // Send transaction
      const receipt = await signAndSendTransaction({
        transaction: transaction.serialize({ verifySignatures: false }),
        wallet,
      });
      toast.success(`Transaction sent successfully! ${receipt.signature}`);
    } catch (error: any) {
      toast.error(`Failed to send transaction: ${error?.message}`);
    }
  };

  const customSignMessage = async () => {
    try {
      const signatureOutput = await signMessage({
        message: Buffer.from('Your message here'),
        wallet,
      });

      toast.success(`Message signed successfully! ${signatureOutput.signature}`);
    } catch (error: any) {
      toast.error(`Failed to sign message: ${error?.message}`);
    }
  };

  return (
    <div className="wallet-container">
      <h3 className="wallet-header">Solana wallet {index + 1}</h3>
      <p className="wallet-address">
        <span className="break-all">{wallet.address}</span>
      </p>
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
            <span className="break-all">4tFqt2qzaNsnZqcpjPiyqYw9LdRzxaZdX2ewPncYEWLA</span>
          </p>
          <p className="text-xs text-gray-600 mb-2">Value: 10000</p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => customSolanaSendTransaction()}
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

export default SolanaWallet;
