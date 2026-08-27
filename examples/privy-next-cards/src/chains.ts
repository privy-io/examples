import { tempo, tempoModerato } from "viem/chains";

/**
 * pathUSD, the TIP-20 test stablecoin the faucet hands out on Moderato. This is also the
 * `stablecoinAddress` in the SDK's built-in sandbox spend-approval target for `eip155:42431`, so the
 * card's allowance and the wallet's balance are denominated in the same token.
 */
export const PATH_USD = "0x20C0000000000000000000000000000000000000" as const;

/**
 * Tempo has no native gas token — fees are paid in a TIP-20 stablecoin. Pinning `feeToken` to the
 * same token the card spends means one faucet top-up covers both the approval transaction and the
 * card, instead of the two-token dance an ETH-gas chain needs.
 *
 * Privy sponsors the card's approval transaction (`sponsor: true`), so in practice the fee token only
 * matters on the pre-funded fallback path when sponsorship is unavailable.
 */
export const TEMPO_TESTNET = tempoModerato.extend({ feeToken: PATH_USD });

/**
 * Tempo mainnet. No `feeToken` here: the production stablecoin comes from the Bridge integration via
 * `NEXT_PUBLIC_CARD_USDC_ADDRESS`, so hardcoding a fee token would be a guess about a real balance.
 */
export const TEMPO_MAINNET = tempo;

export type CardEnvironment = "sandbox" | "production";

/**
 * The chain each environment funds cards from, and how to label it.
 *
 * Sandbox is Tempo Testnet (Moderato), the one Tempo chain the SDK ships a built-in spend-approval
 * target for. Production is Tempo mainnet, so its stablecoin is real money and its approval target
 * has to be supplied — see `PRODUCTION_SPEND_APPROVAL` in `cards.tsx`.
 */
export const CARD_CHAINS: Record<
  CardEnvironment,
  { id: string; label: string; token: string | null }
> = {
  sandbox: {
    id: `eip155:${TEMPO_TESTNET.id}`,
    label: TEMPO_TESTNET.name,
    token: "pathUSD",
  },
  // No token name for production: which stablecoin a live card settles in comes from the Bridge
  // integration via `NEXT_PUBLIC_CARD_USDC_ADDRESS`, so naming one here would be a guess about
  // someone else's configuration. Tempo mainnet's only initialized TIP-20 today is pathUSD.
  production: {
    id: `eip155:${TEMPO_MAINNET.id}`,
    label: TEMPO_MAINNET.name,
    token: null,
  },
};
