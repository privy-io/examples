import { alphaUsd } from "@/constants";
import { useEffect, useState } from "react";
import { tempoTestnet } from "viem/chains";
import { tempoActions } from "viem/tempo";
import { Address, createPublicClient, formatUnits, webSocket } from "viem";

const publicClient = createPublicClient({
  chain: tempoTestnet,
  transport: webSocket("wss://rpc.testnet.tempo.xyz"),
}).extend(tempoActions());

export function useBalance(address: string | undefined) {
  const [balance, setBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState(true);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);

  useEffect(() => {
    if (!address) {
      setBalance("0.00");
      setLoading(false);
      setHasInitialFetch(true);
      return;
    }

    const fetchBalance = async () => {
      try {
        const metadata = await publicClient.token.getMetadata({
          token: alphaUsd as Address,
        });

        const balance = await publicClient.token.getBalance({
          account: address as Address,
          token: alphaUsd as Address,
        });

        const formatted = formatUnits(balance, metadata.decimals);
        const number = parseFloat(formatted);

        // Format with compact notation for large numbers
        let displayBalance: string;
        if (number >= 1_000_000) {
          displayBalance = (number / 1_000_000).toFixed(2) + "M";
        } else if (number >= 1_000) {
          displayBalance = (number / 1_000).toFixed(2) + "K";
        } else {
          displayBalance = number.toFixed(2);
        }

        setBalance(displayBalance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance("0.00");
      } finally {
        // Only set loading to false after first successful fetch
        if (!hasInitialFetch) {
          setLoading(false);
          setHasInitialFetch(true);
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [address, hasInitialFetch]);

  return { balance, loading };
}
