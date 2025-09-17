import {
  useWallets,
  useSendTransaction as useSendTransactionEvm,
  useSignMessage as useSignMessageEvm,
  useSignTransaction as useSignTransactionEvm,
} from "@privy-io/react-auth";
import {
  useSendTransaction as useSendTransactionSolana,
  useSignMessage as useSignMessageSolana,
  useSignTransaction as useSignTransactionSolana,
  useConnectedStandardWallets,
} from "@privy-io/react-auth/solana";
import bs58 from "bs58";
import { useState } from "react";
import { Badge } from "./ui/badge";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const WalletActionsCard = () => {
  const { signMessage: signMessageEvm } = useSignMessageEvm();
  const { signTransaction: signTransactionEvm } = useSignTransactionEvm();
  const { sendTransaction: sendTransactionEvm } = useSendTransactionEvm();
  const { wallets: walletsEvm } = useWallets();
  const { signMessage: signMessageSolana } = useSignMessageSolana();
  const { signTransaction: signTransactionSolana } = useSignTransactionSolana();
  const { sendTransaction: sendTransactionSolana } = useSendTransactionSolana();
  const { wallets: walletsSolana } = useConnectedStandardWallets();

  const [message, setMessage] = useState<string | null>(null);
  const handleSignMessageEvm = async () => {
    try {
      setMessage(null);
      const message = "Hello, world!";
      const { signature } = await signMessageEvm(
        { message },
        { address: walletsEvm[0]?.address }
      );
      setMessage(signature);
    } catch (e) {
      setMessage(e?.toString?.() ?? "Failed to sign message");
    }
  };
  const handleSignMessageSolana = async () => {
    const message = "Hello world";
    const signatureUint8Array = await signMessageSolana({
      message: new TextEncoder().encode(message),
      options: {
        address: walletsSolana[0].address, // Optional: Specify the wallet to use for signing. If not provided, the first wallet will be used.
        uiOptions: {
          title: "Sign this message",
        },
      },
    });
    const signature = bs58.encode(signatureUint8Array);
    setMessage(signature);
  };
  const handleSignTransactionEvm = async () => {
    try {
      setMessage(null);

      const transaction = await signTransactionEvm(
        { to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C", value: 10000 },
        { address: walletsEvm[0]?.address }
      );
      setMessage(
        typeof transaction === "string"
          ? transaction
          : JSON.stringify(transaction)
      );
    } catch (e) {
      setMessage(e?.toString?.() ?? "Failed to sign transaction");
    }
  };

  const handleSignTransactionSolana = async () => {
    const connection = new Connection("https://api.mainnet-beta.solana.com");

    // Create your transaction (either legacy Transaction or VersionedTransaction)
    const transaction = new Transaction(); // or new VersionedTransaction()
    // Add your instructions to the transaction...

    // Sign the transaction
    const signedTransaction = await signTransactionSolana({
      transaction: transaction,
      connection: connection,
      address: walletsSolana[0].address, // Optional: Specify the wallet to use for signing. If not provided, the first wallet will be used.
    });
    setMessage(JSON.stringify(signedTransaction));
  };
  const handleSendTransactionEvm = async () => {
    try {
      setMessage(null);

      const transaction = await sendTransactionEvm(
        { to: "0xE3070d3e4309afA3bC9a6b057685743CF42da77C", value: 10000 },
        { address: walletsEvm[0]?.address }
      );
      setMessage(
        typeof transaction === "string"
          ? transaction
          : JSON.stringify(transaction)
      );
    } catch (e) {
      setMessage(e?.toString?.() ?? "Failed to send transaction");
    }
  };
  const handleSendTransactionSolana = async () => {
    const connection = new Connection("https://api.devnet.solana.com"); // Replace with your Solana RPC endpoint

    // Create your transaction (either legacy Transaction or VersionedTransaction)
    const transaction = new Transaction(); // or new VersionedTransaction()

    try {
      // Build and add your instructions to the transaction...
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(walletsSolana[0].address), // Replace with the sender's address
        toPubkey: new PublicKey(walletsSolana[0].address), // Replace with the recipient's address
        lamports: 1000000, // Amount in lamports (1 SOL = 1,000,000,000 lamports)
      });
      transaction.add(transferInstruction);

      // Fetch and set the latest blockhash
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash; // Replace with the latest blockhash

      // Set your address as the fee payer
      transaction.feePayer = new PublicKey(walletsSolana[0].address); // Set fee payer

      // Send the transaction
      const receipt = await sendTransactionSolana({
        transaction: transaction,
        connection: connection,
        address: walletsSolana[0].address, // Optional: Specify the wallet to use for signing. If not provided, the first wallet will be used.
      });
      setMessage(JSON.stringify(receipt));
    } catch (error) {
      setMessage(error?.toString?.() ?? "Failed to send transaction");
    }
  };

  return (
    <div className={["card", "card-padding"].join(" ")}>
      <div className="row-between-start">
        <div>
          <h3 className="card-title">
            Wallet actions{" "}
            <Badge>
              <code>@/components/wallet-actions-card.tsx</code>
            </Badge>
          </h3>
          <p className={["mt-1", "text-sm", "muted"].join(" ")}>
            If you are using Privy embedded wallets, you can disable the UI
            modal prompt on these actions. So users can have seamless one click
            experience.
          </p>
        </div>
      </div>

      {message && (
        <div className={["mt-3", "alert", "text-xs"].join(" ")}>{message}</div>
      )}

      <div className={["mt-3", "row", "wrap", "gap-2"].join(" ")}>
        <button onClick={handleSignMessageEvm} className="btn">
          Sign Message
        </button>
        <button onClick={handleSignMessageSolana} className="btn">
          Sign Message (Solana)
        </button>

        <button onClick={handleSignTransactionEvm} className="btn">
          Sign Transaction
        </button>

        <button onClick={handleSignTransactionSolana} className="btn">
          Sign Transaction (Solana)
        </button>

        <button onClick={handleSendTransactionEvm} className="btn">
          Send Transaction
        </button>

        <button onClick={handleSendTransactionSolana} className="btn">
          Send Transaction (Solana)
        </button>
      </div>
    </div>
  );
};

export default WalletActionsCard;
