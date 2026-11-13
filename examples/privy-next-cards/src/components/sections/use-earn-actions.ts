"use client";

import { useState } from "react";
import { useEarn, useTransfer, useWalletActions } from "@privy-io/react-auth";
import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  http,
  isAddress,
  parseAbi,
} from "viem";

import { TEMPO_MAINNET } from "@/chains";
import { showErrorToast, showSuccessToast } from "../ui/custom-toast";
import { listCards } from "./cards-api";

/**
 * The Privy ID of this demo app's Tempo Earn vault, the OUSD vault its production cards spend from.
 * Earn deposits and withdrawals take Privy's vault ID, but the card's funding source only carries
 * the vault's onchain address, so a fork with its own vault replaces this with its vault's ID.
 *
 * TODO: read it from the card's `tempo_earn_vault` funding source once the card API returns it.
 */
const EARN_VAULT_ID = "gef5yslz5jhca3y4hljwhcqn";

/** OUSD and the Earn share token, like every TIP-20 token, have 6 decimals. */
const DECIMALS = 6;

const vaultAbi = parseAbi([
  "function previewRedeem(uint256 shares) view returns (uint256)",
]);

const tempo = createPublicClient({ chain: TEMPO_MAINNET, transport: http() });

/**
 * How long to wait for an Earn action to settle. Privy retries a failed send for about two and a
 * half minutes before marking the action failed, so a shorter wait reads a doomed action as pending.
 */
const SETTLE_TIMEOUT_MS = 5 * 60_000;
const POLL_INTERVAL_MS = 1_500;

/**
 * Where **Send OUSD** points by default: Privy's internal test faucet, so test funds go back where
 * they came from. A fork can set its own address or leave it empty for a blank prompt.
 */
const DEFAULT_SEND_RECIPIENT = "0xB8644175b78da1971C7278Ead8ff70Ce65E0981b";

type EarnAction = "deposit" | "withdraw" | "send";

const COPY: Record<
  EarnAction,
  {
    prompt: string;
    past: string;
    done: string;
    error: string;
  }
> = {
  deposit: {
    prompt: "How much OUSD to deposit into Earn?",
    past: "Deposited",
    done: "into Earn. The card can spend it now.",
    error: "Earn deposit failed",
  },
  withdraw: {
    prompt: "How much OUSD to withdraw from Earn?",
    past: "Withdrew",
    done: "from Earn back to the wallet.",
    error: "Earn withdrawal failed",
  },
  send: {
    prompt: "How much OUSD to send?",
    past: "Sent",
    done: "from the wallet.",
    error: "Send failed",
  },
};

/** The card's Earn funding source, after checking the card belongs to the signed-in wallet. */
export const getEarnFundingSource = async ({
  cardId,
  walletId,
  accessToken,
}: {
  cardId: string;
  walletId: string;
  accessToken: string;
}) => {
  const cards = await listCards({ environment: "production", accessToken });
  const card = cards.find((candidate) => candidate.id === cardId);
  if (card && card.wallet_id !== walletId) {
    throw new Error("This card is funded by a different wallet.");
  }
  const vault = card?.funding_sources?.find(
    (source) => source.type === "tempo_earn_vault",
  );
  if (!vault) throw new Error("This card doesn't spend from an Earn vault.");
  return vault;
};

export type EarnFundingSource = Awaited<
  ReturnType<typeof getEarnFundingSource>
>;

/**
 * The wallet's balances on both sides of the vault, read onchain from the funding source's
 * addresses: OUSD in the wallet, vault shares, what those shares redeem for, and the most a
 * withdrawal can take. The vault's exact-amount withdrawal reverts when it would burn the wallet's
 * last share, so that last figure is what all but one share redeem for, leaving one share of dust.
 */
export const readEarnBalances = async ({
  vault,
  walletAddress,
}: {
  vault: EarnFundingSource;
  walletAddress: string;
}) => {
  const balanceOf = (token: string) =>
    tempo.readContract({
      address: token as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [walletAddress as `0x${string}`],
    });
  const previewRedeem = (shares: bigint) =>
    shares > BigInt(0)
      ? tempo.readContract({
          address: vault.vault_address as `0x${string}`,
          abi: vaultAbi,
          functionName: "previewRedeem",
          args: [shares],
        })
      : Promise.resolve(BigInt(0));

  const [ousd, shares] = await Promise.all([
    balanceOf(vault.asset_address),
    balanceOf(vault.share_token_address),
  ]);
  const [earnValue, withdrawable] = await Promise.all([
    previewRedeem(shares),
    previewRedeem(shares > BigInt(1) ? shares - BigInt(1) : BigInt(0)),
  ]);
  return {
    ousd: formatUnits(ousd, DECIMALS),
    shares: formatUnits(shares, DECIMALS),
    earnValue: formatUnits(earnValue, DECIMALS),
    withdrawable: formatUnits(withdrawable, DECIMALS),
  };
};

/**
 * Moves OUSD between the funding wallet and the Earn vault. Signup approves and opts the card into
 * the vault but doesn't deposit anything, so a card that spends from Earn needs a deposit first;
 * withdrawing returns unspent OUSD to the wallet. Each prompt starts at the most the wallet can
 * actually move.
 */
export const useEarnActions = ({
  walletId,
  walletAddress,
  cardId,
  getAccessToken,
}: {
  walletId?: string;
  walletAddress?: string;
  cardId: string | null;
  getAccessToken: () => Promise<string | null>;
}) => {
  const earn = useEarn();
  const { transfer } = useTransfer();
  const { getAction } = useWalletActions();
  const [pending, setPending] = useState<EarnAction | null>(null);

  const run = async (action: EarnAction) => {
    if (!walletId || !walletAddress || !cardId) return;

    setPending(action);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token");

      const vault = await getEarnFundingSource({
        cardId,
        walletId,
        accessToken,
      });
      const balances = await readEarnBalances({ vault, walletAddress });
      const available =
        action === "withdraw" ? balances.withdrawable : balances.ousd;
      const spendsFromEarn = vault.selected;
      if (Number(available) === 0) {
        throw new Error(
          action === "withdraw"
            ? "Nothing to withdraw from Earn."
            : "The wallet has no OUSD.",
        );
      }
      const recipient =
        action === "send"
          ? window
              .prompt("Send OUSD to which address?", DEFAULT_SEND_RECIPIENT)
              ?.trim()
          : undefined;
      if (action === "send") {
        if (!recipient) return;
        if (!isAddress(recipient)) throw new Error("That isn't an address.");
      }
      const amount = window.prompt(COPY[action].prompt, available)?.trim();
      if (!amount) return;

      // The call resolves once Privy accepts the action, before anything lands onchain, so wait for
      // it to settle rather than reporting success on submission. A failed status read is retried,
      // so a network blip doesn't report a failure for an action that may still succeed.
      const created =
        action === "send"
          ? await transfer(walletId, {
              source: { asset_address: vault.asset_address, chain: "tempo" },
              destination: { address: recipient! },
              amount,
            })
          : await earn[action](walletId, { vault_id: EARN_VAULT_ID, amount });
      const deadline = Date.now() + SETTLE_TIMEOUT_MS;
      let settled: Awaited<ReturnType<typeof getAction>> | null = null;
      while (Date.now() < deadline) {
        settled = await getAction(walletId, created.id).catch(() => null);
        if (settled && settled.status !== "pending") break;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      if (!settled || settled.status === "pending") {
        throw new Error(
          `${COPY[action].error}: couldn't confirm it within 5 minutes. Check the wallet on the explorer before retrying.`,
        );
      }
      if (settled.status === "succeeded") {
        showSuccessToast(
          action === "deposit" && !spendsFromEarn
            ? `Deposited ${amount} OUSD into Earn. Switch the card to Earn in its settings to spend it.`
            : action === "send"
              ? `Sent ${amount} OUSD to ${recipient}.`
              : `${COPY[action].past} ${amount} OUSD ${COPY[action].done}`,
        );
      } else {
        throw new Error(
          `${COPY[action].error}: ${settled.failure_reason?.message ?? settled.status}`,
        );
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : COPY[action].error,
      );
    } finally {
      setPending(null);
    }
  };

  return {
    depositToEarn: () => run("deposit"),
    withdrawFromEarn: () => run("withdraw"),
    sendOusd: () => run("send"),
    pending,
  };
};
