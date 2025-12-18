import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { createPublicClient, http } from "viem";

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

    const wallet = wallets[0];
    if (!wallet?.address) {
      const errMsg = "No active wallet";
      setError(errMsg);
      setIsFunding(false);
      throw new Error(errMsg);
    }

    try {
      // Faucet is a Tempo JSON-RPC method: `tempo_fundAddress`.
      // We call it directly via the Tempo public RPC.
      const publicClient = createPublicClient({
        transport: http("https://rpc.testnet.tempo.xyz"),
      });

      const result = await publicClient.request({
        method: "tempo_fundAddress",
        params: [wallet.address],
      });

      const txHashes = result as readonly `0x${string}`[];
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


