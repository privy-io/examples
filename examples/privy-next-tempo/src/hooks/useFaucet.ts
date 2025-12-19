import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { tempoTestnet } from "viem/chains";
import { tempoActions } from "viem/tempo";
import {
  createPublicClient,
  http,
  type Address,
} from "viem";

export function useFaucet() {
  const { wallets } = useWallets();
  const [isFunding, setIsFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hashes, setHashes] = useState<readonly `0x${string}`[] | null>(null);

  const fund = async () => {
    if (isFunding) return;
    setIsFunding(true);
    setError(null);
    setHashes(null);

    const wallet = wallets.find((w) => w.walletClientType === "privy");
    if (!wallet?.address) {
      const errMsg = "No Privy embedded wallet found";
      setError(errMsg);
      setIsFunding(false);
      throw new Error(errMsg);
    }

    try {
      const client = createPublicClient({
        chain: tempoTestnet,
        transport: http("https://rpc.testnet.tempo.xyz"),
      }).extend(tempoActions());

      const txHashes = await client.faucet.fund({
        account: wallet.address as Address,
      });

      setHashes(txHashes);
      return txHashes;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fund wallet";
      setError(errorMessage);
      throw err;
    } finally {
      setIsFunding(false);
    }
  };

  return {
    fund,
    isFunding,
    error,
    hashes,
    reset: () => {
      setError(null);
      setHashes(null);
    },
  };
}


