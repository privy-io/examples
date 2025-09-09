import {
  useSendTransaction,
  useWallets,
  useConnectWallet,
} from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

export const SendTransactionButton = () => {
  const { sendTransaction } = useSendTransaction();
  const { wallets } = useWallets();
  const { connectWallet } = useConnectWallet();

  const handleSendTransaction = async () => {
    await sendTransaction(
      {
        to: "0x0000000000000000000000000000000000000000",
        value: 1,
        chainId: 1,
      },
      {
        address: wallets[0].address,
      }
    );
  };

  return (
    <div>
      {wallets[0] ? (
        <div>
          <Button className="w-full my-2" onClick={handleSendTransaction}>
            Send Transaction
          </Button>
        </div>
      ) : (
        <Button className="w-full my-2" onClick={() => connectWallet()}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default SendTransactionButton;
