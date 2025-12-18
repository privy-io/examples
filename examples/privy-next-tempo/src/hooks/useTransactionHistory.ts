import { useEffect, useState } from "react";
import { formatUnits } from "viem";

interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  type: "send" | "receive";
  amount: string;
  formattedTimestamp: string;
  memo?: string;
  token?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export function useTransactionHistory(
  address: string | undefined,
  refreshTrigger?: string
) {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);

  useEffect(() => {
    if (!address) {
      setTransactions([]);
      setLoading(false);
      setHasInitialFetch(true);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setError(null);

        // Fetch transactions via our own API route to avoid CORS
        const url = new URL("/api/transactions", window.location.origin);
        url.searchParams.set("address", address);
        url.searchParams.set("limit", "10");
        url.searchParams.set("offset", "0");

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error(
            `Failed to fetch transactions: ${response.statusText}`
          );
        }

        const data = (await response.json()) as {
          transactions?: Array<{
            hash: string;
            from: string;
            to: string;
            value: string;
            blockNumber: string;
            input: string;
            timestamp: number;
            [key: string]: unknown;
          }>;
          error?: string | null;
        };

        if (data.error) {
          throw new Error(data.error);
        }

        // Parse and format transactions
        const parsedTxs: TransactionData[] = [];

        for (const tx of data.transactions || []) {
          try {
            // Determine transaction type
            const type =
              tx.from.toLowerCase() === address.toLowerCase()
                ? "send"
                : "receive";

            // Parse amount from transaction value (assuming 6 decimals for USDC)
            // For ERC20 transfers, value is "0x0", actual amount is in the input data
            let amount = tx.value;
            let memo: string | undefined;

            // Check for transferWithMemo (function signature: 0x95777d59 on Tempo)
            if (tx.input && tx.input.startsWith("0x95777d59")) {
              // transferWithMemo(address to, uint256 amount, bytes32 memo)
              try {
                // Function selector is at chars 0-10 (0x95777d59)
                // to is at chars 10-74 (64 chars = 32 bytes)
                // amount is at chars 74-138 (64 chars = 32 bytes)
                // memo is at chars 138-202 (64 chars = 32 bytes)
                const amountHex = "0x" + tx.input.slice(10 + 64, 10 + 64 + 64);
                amount = amountHex;

                const memoHex =
                  "0x" + tx.input.slice(10 + 64 + 64, 10 + 64 + 64 + 64);
                memo = parseHexToString(memoHex);
              } catch (e) {
                console.error("Error parsing transferWithMemo:", e);
              }
            }
            // Check for basic transfer (function signature: 0xa9059cbb)
            else if (tx.input && tx.input.startsWith("0xa9059cbb")) {
              // transfer(address to, uint256 amount)
              // Function selector is at chars 0-10 (0xa9059cbb)
              // to is at chars 10-74 (64 chars = 32 bytes)
              // amount is at chars 74-138 (64 chars = 32 bytes)
              const amountHex = "0x" + tx.input.slice(10 + 64, 10 + 64 + 64);
              amount = amountHex;
            }

            const formattedAmount = formatUnits(BigInt(amount), 6);
            const blockNumber = parseInt(tx.blockNumber, 16);

            parsedTxs.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: amount,
              blockNumber,
              timestamp: tx.timestamp || 0,
              type,
              amount: parseFloat(formattedAmount).toFixed(2),
              formattedTimestamp: formatTimestamp(tx.timestamp || 0),
              memo,
            });
          } catch (err) {
            console.error("Error processing transaction:", err, tx);
          }
        }

        setTransactions(parsedTxs);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch transactions"
        );
        setTransactions([]);
      } finally {
        // Only set loading to false after first successful fetch
        if (!hasInitialFetch) {
          setLoading(false);
          setHasInitialFetch(true);
        }
      }
    };

    fetchTransactions();

    // Refresh transactions every 10 seconds to match balance refresh
    const interval = setInterval(fetchTransactions, 10000);

    return () => clearInterval(interval);
  }, [address, refreshTrigger, hasInitialFetch]);

  return { transactions, loading, error };
}

function formatTimestamp(unixTimestamp: number): string {
  if (!unixTimestamp) return "Unknown";

  const date = new Date(unixTimestamp * 1000);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;

  return date.toLocaleDateString();
}

function parseHexToString(hex: string): string | undefined {
  try {
    // Remove 0x prefix if present
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;

    // Convert hex to bytes
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16);
    }

    // Find the first non-zero byte and the end of the string
    let start = 0;
    let end = bytes.length;

    // Skip leading null bytes
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] !== 0) {
        start = i;
        break;
      }
    }

    // Find the null terminator from the start
    for (let i = start; i < bytes.length; i++) {
      if (bytes[i] === 0) {
        end = i;
        break;
      }
    }

    // If no meaningful content found
    if (start === end) {
      return undefined;
    }

    // Convert to string
    const decoder = new TextDecoder();
    const result = decoder.decode(bytes.slice(start, end)).trim();

    // Return undefined if the result is empty or only whitespace
    return result.length > 0 ? result : undefined;
  } catch (e) {
    console.error("Error parsing hex to string:", e);
    return undefined;
  }
}
