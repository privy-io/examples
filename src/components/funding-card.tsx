import {
  useFundWallet as useFundWalletEvm,
  useWallets,
} from "@privy-io/react-auth";
import { useFundWallet as useFundWalletSolana } from "@privy-io/react-auth/solana";
import { Badge } from "./ui/badge";

const FundingCard = () => {
  const { wallets } = useWallets();
  const { fundWallet: fundWalletEvm } = useFundWalletEvm();
  const { fundWallet: fundWalletSolana } = useFundWalletSolana();
  const handleFundWallet = async () => {
    await fundWalletEvm(wallets[0]?.address as string);
  };

  const handleFundWalletWithUSDC = async () => {
    await fundWalletEvm(wallets[0]?.address as string, {
      asset: "USDC",
      amount: "1",
    });
  };
  const handleFundWalletSolana = async () => {
    await fundWalletSolana(wallets[0]?.address as string);
  };

  const handleFundWalletWithSOL = async () => {
    await fundWalletSolana(wallets[0]?.address as string, {
      amount: "1",
      asset: "USDC",
    });
  };

  return (
    <div className={["card", "card-padding"].join(" ")}>
      <div className="row-between-start">
        <div>
          <h3 className="card-title">
            Fund Wallet{" "}
            <Badge>
              <code>@/components/funding-card.tsx</code>
            </Badge>
          </h3>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "10px",
        }}
      >
        <button onClick={handleFundWallet} className="btn">
          Fund Wallet
        </button>
        <button onClick={handleFundWalletWithUSDC} className="btn">
          Fund Wallet with USDC (EVM)
        </button>
        <button onClick={handleFundWalletSolana} className="btn">
          Fund Wallet with Solana
        </button>
        <button onClick={handleFundWalletWithSOL} className="btn">
          Fund Wallet with USDC (Solana)
        </button>
      </div>
    </div>
  );
};

export default FundingCard;
