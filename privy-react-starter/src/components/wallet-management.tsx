import {
  useImportWallet as useImportWalletEvm,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import { useState } from "react";
import { Badge } from "./ui/badge";
import {
  useImportWallet as useImportWalletSolana,
  useExportWallet as useExportWalletSolana,
  useConnectedStandardWallets,
} from "@privy-io/react-auth/solana";

const WalletManagement = () => {
  const { wallets: walletsEvm } = useWallets();
  const { wallets: walletsSolana } = useConnectedStandardWallets();
  const { exportWallet: exportWalletEvm } = usePrivy();

  const { importWallet: importWalletEvm } = useImportWalletEvm();
  const { exportWallet: exportWalletSolana } = useExportWalletSolana();
  const { importWallet: importWalletSolana } = useImportWalletSolana();

  const [message, setMessage] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string>("");

  const handleExport = async (chain: "ethereum" | "solana") => {
    try {
      if (chain === "ethereum") {
        // export first privy wallet
        const privyWallet = walletsEvm.find(
          (wallet) => wallet.walletClientType === "privy",
        );
        await exportWalletEvm({ address: privyWallet?.address as string });
      } else {
        // export first solana wallet
        await exportWalletSolana({
          address: walletsSolana[0]?.address as string,
        });
      }
      setMessage("Exported wallet");
    } catch (e) {
      setMessage(e?.toString?.() ?? "Failed to export wallet");
    }
  };

  const handleImport = async (chain: "ethereum" | "solana") => {
    try {
      if (chain === "ethereum") {
        await importWalletEvm({ privateKey });
      } else {
        await importWalletSolana({ privateKey });
      }

      setMessage("success");
    } catch (e) {
      setMessage(e?.toString?.() ?? "Failed to import wallet");
    } finally {
      setPrivateKey("");
    }
  };

  return (
    <div className={["card", "card-padding"].join(" ")}>
      <div className="row-between-start">
        <div>
          <h3 className="card-title">
            Wallet management{" "}
            <Badge>
              <code>@/components/wallet-management.tsx</code>
            </Badge>
          </h3>
          <p className={["mt-1", "muted", "text-sm"].join(" ")}>
            Export your embedded wallet or import an external private key.
          </p>
        </div>
      </div>

      {message && (
        <div className={["mt-2", "alert", "text-xs"].join(" ")}>{message}</div>
      )}

      <div className={["mt-3"].join(" ")}>
        <div className={["row", "wrap", "gap-2"].join(" ")}>
          <button onClick={() => handleExport("ethereum")} className="btn">
            Export wallet (Ethereum)
          </button>
          <button onClick={() => handleExport("solana")} className="btn">
            Export wallet (Solana)
          </button>
        </div>

        <div className="mt-3">
          <label className={["block", "text-xs", "font-medium"].join(" ")}>
            Private key (hex for Ethereum, base58 for Solana)
          </label>
          <input
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="0x... (Ethereum) or base58... (Solana)"
            className="input"
          />
          <div className={["mt-2", "row", "wrap", "gap-2"].join(" ")}>
            <button
              onClick={() => handleImport("ethereum")}
              disabled={!privateKey}
              className="btn"
            >
              Import wallet (Ethereum)
            </button>
            <button
              onClick={() => handleImport("solana")}
              disabled={!privateKey}
              className="btn"
            >
              Import wallet (Solana)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletManagement;
