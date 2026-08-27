/**
 * Tops the wallet up with Moderato test stablecoins by way of the faucet route handler, which calls
 * the `tempo_fundAddress` RPC method. Testnet only.
 */
export const fundWallet = async (address: string): Promise<void> => {
  const response = await fetch("/api/faucet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Faucet request failed (${response.status})`);
  }
};
