import { alphaUsd } from "@/constants";
import { toViemAccount, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { tempoTestnet } from 'viem/chains'
import { tempoActions } from 'viem/tempo'
import {
  createWalletClient,
  custom,
  parseUnits,
  stringToHex,
  walletActions,
  type Address,
} from "viem";

export function useSend() {
  const { wallets } = useWallets();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const send = async (to: string, amount: string, memo: string = "") => {
    if (isSending) return;
    setIsSending(true);
    setError(null);
    setTxHash(null);

    const wallet = wallets.find((w) => w.walletClientType === "privy");
    if (!wallet?.address) {
      const errMsg = "No Privy embedded wallet found";
      setError(errMsg);
      setIsSending(false);
      throw new Error(errMsg);
    }

    try {
      const provider = await wallet.getEthereumProvider();
      const client = createWalletClient({
        account: wallet.address as Address,
        chain: tempoTestnet,
        transport: custom(provider),
      })
        .extend(walletActions)
        .extend(tempoActions());

      const metadata = await client.token.getMetadata({
        token: alphaUsd,
      });
      let recipient: Address;
      if (to.startsWith("0x")) {
        recipient = to as Address;
      } else {
        recipient = await getAddress(to);
      }
      const { receipt } = await client.token.transferSync({
        to: recipient,
        amount: parseUnits(amount, metadata.decimals),
        memo: stringToHex(memo || to),
        token: alphaUsd,
      });

      setTxHash(receipt.transactionHash);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSending(false);
    }
  };

  return {
    send,
    isSending,
    error,
    txHash,
    reset: () => {
      setError(null);
      setTxHash(null);
    },
  };
}

async function getAddress(to: string): Promise<Address> {
  const res = await fetch("/api/find", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier: to }),
  });

  if (!res.ok) {
    throw new Error("Failed to find user");
  }

  const data = (await res.json()) as { address: Address };
  return data.address;
}
