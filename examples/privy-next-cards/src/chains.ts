import { tempo, tempoModerato } from "viem/chains";

/**
 * pathUSD. Root TIP-20 on Tempo and Tempo Moderato, and the sandbox spend-approval
 * target when the card asset is `pathusd`.
 */
export const PATH_USD = "0x20C0000000000000000000000000000000000000" as const;

/**
 * OpenUSD. Same TIP-20 address on Tempo and Tempo Moderato. Sandbox signup with
 * asset `ousd` approves this token. Production signup passes it as
 * `spendApproval.stablecoinAddress`.
 */
export const OUSD = "0x20c0000000000000000000006a37DA5C996874BE" as const;

/**
 * Tempo has no native gas token. Fees are paid in a TIP-20 stablecoin. The sandbox
 * chain pins pathUSD as the fee token. The Moderato faucet funds pathUSD and OUSD,
 * and Privy sponsors the card approval, so the fee token does not have to match the
 * card asset.
 */
export const TEMPO_TESTNET = tempoModerato.extend({ feeToken: PATH_USD });

/** Tempo mainnet. The card spends pathUSD or OUSD. The Bridge spender comes from env. */
export const TEMPO_MAINNET = tempo;

export type CardEnvironment = "sandbox" | "production";

/**
 * The chain each environment funds cards from.
 *
 * Sandbox is Tempo Moderato. The SDK ships a built-in spend-approval target for it, and
 * swaps that target to OUSD when the card asset is `ousd`. Production is Tempo mainnet.
 * Its spender has to be supplied. See `productionSpendApproval`.
 */
export const CARD_CHAINS: Record<
  CardEnvironment,
  { id: string; label: string }
> = {
  sandbox: {
    id: `eip155:${TEMPO_TESTNET.id}`,
    label: TEMPO_TESTNET.name,
  },
  production: {
    id: `eip155:${TEMPO_MAINNET.id}`,
    label: TEMPO_MAINNET.name,
  },
};

/** Asset string `signUp` sends. `ousd` selects the SDK's Moderato OUSD spend target. */
export type CardFundingAsset = "pathusd" | "ousd";

export const CARD_FUNDING_ASSETS: Record<
  CardFundingAsset,
  { label: string; address: string }
> = {
  pathusd: { label: "PathUSD", address: PATH_USD },
  ousd: { label: "OUSD", address: OUSD },
};

/** Production has no built-in spend target. The stablecoin follows the funding-asset toggle. */
export const productionSpendApproval = (asset: CardFundingAsset) => {
  const spenderAddress = process.env.NEXT_PUBLIC_CARD_SPENDER_ADDRESS;
  if (!spenderAddress) return null;
  return {
    stablecoinAddress: CARD_FUNDING_ASSETS[asset].address,
    spenderAddress,
  };
};
