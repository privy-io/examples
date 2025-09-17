import { useCreateWallet as useCreateEvmWallet } from "@privy-io/react-auth";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useCreateWallet as useCreateWalletExtendedChains } from "@privy-io/react-auth/extended-chains";
import { useState } from "react";
import { Badge } from "./ui/badge";
type ChainType =
  | "solana"
  | "ethereum"
  | "cosmos"
  | "stellar"
  | "sui"
  | "tron"
  | "bitcoin-segwit"
  | "near"
  | "ton"
  | "starknet"
  | "spark";

const CreateWalletCard = () => {
  const [message, setMessage] = useState<string | null>(null);
  const { createWallet: createWalletSolana } = useSolanaWallets();
  const { createWallet: createWalletExtendedChains } =
    useCreateWalletExtendedChains();

  const { createWallet: createWalletEvm } = useCreateEvmWallet({
    onSuccess: ({ wallet }) => {
      console.log("Created wallet ", wallet);
      setMessage("success");
    },
    onError: (error) => {
      setMessage(error?.toString() ?? "Failed to create wallet");
    },
  });

  const handleCreate = async (chain: ChainType) => {
    setMessage(null);
    switch (chain) {
      case "solana":
        try {
          await createWalletSolana({
            createAdditional: true,
          });
          setMessage("success");
        } catch (error) {
          setMessage(error?.toString() ?? "Failed to create wallet");
        }
        break;
      case "ethereum":
        await createWalletEvm({
          createAdditional: true,
        });
        break;
      default:
        try {
          await createWalletExtendedChains({
            chainType: chain,
          });
          setMessage("success");
        } catch (e) {
          setMessage(e?.toString?.() ?? "Failed to create wallet");
        }
        break;
    }
  };
  return (
    <div className={["card", "card-padding"].join(" ")}>
      <div className="row-between-start">
        <div>
          <h3 className="card-title">
            Create wallet{" "}
            <Badge>
              <code>@/components/create-wallet-card.tsx</code>
            </Badge>
          </h3>
          <p className={["mt-1", "text-sm", "muted"].join(" ")}>
            Creates a new wallet for the user. To limit to a single wallet per
            user, remove the <code>createAdditional</code> flag from{" "}
            <code>createWallet</code>.
          </p>
        </div>
      </div>
      {message && (
        <div
          className={[
            "mt-2",
            message === "success" ? "alert-success" : "alert-error",
            "alert",
            "text-xs",
          ].join(" ")}
        >
          {message}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "10px",
        }}
      >
        <button onClick={() => handleCreate("solana")} className="btn">
          Create Solana Wallet
        </button>
        <button onClick={() => handleCreate("ethereum")} className="btn">
          Create Ethereum Wallet
        </button>
        <button onClick={() => handleCreate("cosmos")} className="btn">
          Create Cosmos Wallet
        </button>
        <button onClick={() => handleCreate("stellar")} className="btn">
          Create Stellar Wallet
        </button>
        <button onClick={() => handleCreate("sui")} className="btn">
          Create Sui Wallet
        </button>
        <button onClick={() => handleCreate("tron")} className="btn">
          Create Tron Wallet
        </button>
        <button onClick={() => handleCreate("bitcoin-segwit")} className="btn">
          Create Bitcoin Segwit Wallet
        </button>
        <button onClick={() => handleCreate("near")} className="btn">
          Create Near Wallet
        </button>
        <button onClick={() => handleCreate("ton")} className="btn">
          Create Ton Wallet
        </button>
        <button onClick={() => handleCreate("starknet")} className="btn">
          Create Starknet Wallet
        </button>
        <button onClick={() => handleCreate("spark")} className="btn">
          Create Spark Wallet
        </button>
      </div>
    </div>
  );
};

export default CreateWalletCard;
