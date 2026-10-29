import type { SignUpForCardOptions } from "@privy-io/react-auth/cards";
import { base } from "viem/chains";

import { CARD_CHAINS, type CardEnvironment } from "@/chains";
import { isOpen, listCards } from "./cards-api";

/** Resume the newest open card rather than changing its funding chain or asset. */
export const getCardSignUpOptions = async ({
  environment,
  walletId,
  accessToken,
}: {
  environment: CardEnvironment;
  walletId: string;
  accessToken: string;
}): Promise<SignUpForCardOptions> => {
  const cards = await listCards({ environment, accessToken });
  const card = cards.find(isOpen);
  if (card && (!card.wallet_id || !card.chain_id || !card.asset)) {
    throw new Error("The existing card is missing its funding wallet, chain, or asset.");
  }
  const chainId = card?.chain_id ?? CARD_CHAINS[environment].id;
  const asset = card?.asset ?? (environment === "sandbox" ? "path_usd" : "ousd");
  const funding = { walletId: card?.wallet_id ?? walletId, chainId, asset };

  if (environment === "sandbox") {
    if (chainId !== CARD_CHAINS.sandbox.id) {
      throw new Error("This example only supports sandbox cards on Tempo Moderato.");
    }
    return { environment, ...funding };
  }

  let stablecoinAddress: string | undefined;
  let spenderAddress: string | undefined;
  if (chainId === CARD_CHAINS.production.id && asset === "ousd") {
    // Keep the existing env names for the default Tempo production target.
    stablecoinAddress = process.env.NEXT_PUBLIC_CARD_USDC_ADDRESS;
    spenderAddress = process.env.NEXT_PUBLIC_CARD_SPENDER_ADDRESS;
  } else if (chainId === `eip155:${base.id}` && asset === "usdc") {
    stablecoinAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    spenderAddress = process.env.NEXT_PUBLIC_BASE_CARD_SPENDER_ADDRESS;
  } else {
    throw new Error(`No production approval target configured for ${asset} on ${chainId}.`);
  }

  if (!stablecoinAddress || !spenderAddress) {
    throw new Error(
      chainId === `eip155:${base.id}`
        ? "Set NEXT_PUBLIC_BASE_CARD_SPENDER_ADDRESS to your Base card program's production spender."
        : "Set NEXT_PUBLIC_CARD_USDC_ADDRESS to the Tempo OUSD token and NEXT_PUBLIC_CARD_SPENDER_ADDRESS to its production spender.",
    );
  }

  return {
    environment,
    ...funding,
    spendApproval: { stablecoinAddress, spenderAddress },
  };
};
