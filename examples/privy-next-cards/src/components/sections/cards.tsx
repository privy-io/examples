"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import dynamic from "next/dynamic";

import Section from "../reusables/section";
import { Modal } from "./modal";
import { showSuccessToast, showErrorToast } from "../ui/custom-toast";
import { findEmbeddedWallet } from "./find-embedded-wallet";
import { simulateSpend } from "./simulate-spend";
import { listCards } from "./cards-api";

// Loaded when the modal first opens rather than at first paint. Statically importing these puts
// them and their transitive deps (~400kB) in the initial page bundle, which every visitor pays for
// even though neither view can be reached without clicking. They only ever render inside the modal,
// so there is nothing to server-render.
const SignUpForCardView = dynamic(
  () =>
    import("@privy-io/react-auth/ui").then((m) => ({
      default: m.SignUpForCardView,
    })),
  { ssr: false },
);

const CardSummaryView = dynamic(
  () =>
    import("@privy-io/react-auth/ui").then((m) => ({
      default: m.CardSummaryView,
    })),
  { ssr: false },
);

type CardEnvironment = "sandbox" | "production";

/**
 * The chain each environment funds cards from, and how to label it.
 *
 * Production is Base mainnet, so its USDC is real money. Any sandbox testnet with a published
 * Bridge spender works in sandbox; Base Sepolia is the default here.
 */
const CARD_CHAINS: Record<CardEnvironment, { id: string; label: string }> = {
  sandbox: { id: "eip155:84532", label: "Base Sepolia" },
  production: { id: "eip155:8453", label: "Base" },
};

/** Named in `CardSummaryView`'s footer legal disclosure as the Platform Provider. */
const DEVELOPER_NAME = "Privy Cards Demo";

/** Amount, in cents, of the simulated purchase used to put a row on the transaction list. */
const TEST_SPEND_AMOUNT = 50;

/** Formatted for the button label, so the copy cannot drift from the amount actually charged. */
const TEST_SPEND_LABEL = `$${(TEST_SPEND_AMOUNT / 100).toFixed(2)}`;

/** Which card view the modal is showing, if any. */
type OpenView = "signup" | "summary" | null;

const Cards = () => {
  const { user, getAccessToken } = usePrivy();
  const userId = user?.id;
  const [environment, setEnvironment] = useState<CardEnvironment>("sandbox");
  const [cardId, setCardId] = useState<string | null>(null);
  const [openView, setOpenView] = useState<OpenView>(null);
  const [isSpending, setIsSpending] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);

  const wallet = findEmbeddedWallet(user?.linkedAccounts ?? []);
  const chain = CARD_CHAINS[environment];
  const isSandbox = environment === "sandbox";

  // Look up whether this user already has a card in the selected environment. This is what makes
  // the production side usable at all — signup is disabled there, so the card has to come from
  // somewhere — and it keeps the pill honest instead of trusting a local cache.
  useEffect(() => {
    if (!userId) {
      setCardId(null);
      return;
    }

    let active = true;
    setIsLoadingCard(true);

    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("No access token");
        const cards = await listCards({ environment, accessToken: token });
        // One card per account, so the first is the card.
        if (active) setCardId(cards[0]?.id ?? null);
      } catch {
        if (active) setCardId(null);
      } finally {
        if (active) setIsLoadingCard(false);
      }
    })();

    // Environment switches mid-flight would otherwise let a stale response win.
    return () => {
      active = false;
    };
  }, [userId, environment, getAccessToken]);

  const onCardReady = (readyCardId: string) => {
    setCardId(readyCardId);
    showSuccessToast("Card is ready.");
    setOpenView("summary");
  };

  // Stable so the modal's Escape listener and scroll lock are not torn down and re-applied on
  // every render of this section.
  const closeModal = useCallback(() => setOpenView(null), []);

  const switchEnvironment = (next: CardEnvironment) => {
    // Close first: the open view is bound to the environment it was opened for.
    setOpenView(null);
    setEnvironment(next);
  };

  const onSimulateSpend = async () => {
    if (!cardId) return;

    setIsSpending(true);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Log in first");

      const result = await simulateSpend({
        cardId,
        environment,
        accessToken: token,
        amount: TEST_SPEND_AMOUNT,
      });

      if (result.approved) {
        showSuccessToast("Simulated purchase captured. Open the card summary.");
      } else {
        showErrorToast(
          `Authorization declined${result.declineReason ? `: ${result.declineReason}` : ""}. It still appears in the transaction list.`,
        );
      }
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Simulated purchase failed",
      );
    } finally {
      setIsSpending(false);
    }
  };

  return (
    <Section
      name="Cards"
      description="Sign up for a card, then review its balance, transactions, and details."
      filepath="src/components/sections/cards"
      actions={[
        // Hidden once a card exists. There is one card per account, so signing up again would only
        // walk the disclosure steps and hand back the same card.
        ...(cardId
          ? []
          : [
              {
                name: "Sign up for a card",
                function: () => setOpenView("signup"),
                disabled: !wallet,
              },
            ]),
        {
          name: "View card summary",
          function: () => setOpenView("summary"),
          disabled: !wallet || !cardId,
        },
        // Stripe's Issuing test helpers only exist in test mode, so there is no way to fabricate a
        // production authorization. Live spend has to be a real purchase.
        ...(isSandbox
          ? [
              {
                name: isSpending
                  ? "Simulating…"
                  : `Simulate a ${TEST_SPEND_LABEL} purchase`,
                function: onSimulateSpend,
                disabled: !cardId || isSpending,
              },
            ]
          : []),
      ]}
    >
      <div className="mb-4 flex items-center gap-2 text-[14px]">
        <span className="font-medium">Environment</span>
        <div className="inline-flex overflow-hidden rounded-full border border-[#E2E3F0]">
          {(["sandbox", "production"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => switchEnvironment(option)}
              className={`px-3 py-1 text-[13px] capitalize ${
                environment === option
                  ? "bg-[#5B4FFF] text-white"
                  : "bg-white text-[#040217] hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {wallet ? (
        <div className="rounded-md border border-[#E2E3F0] p-4 text-[14px]">
          <div className="flex items-center gap-2">
            <p className="font-medium">Funding wallet</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[12px] ${
                cardId
                  ? "bg-[#E8F5E9] text-[#1B5E20]"
                  : "bg-[#E2E3F0] text-[#040217]"
              }`}
            >
              {isLoadingCard ? "Checking…" : cardId ? "Card created" : "No card yet"}
            </span>
          </div>
          <p className="font-light break-all">{wallet.address}</p>

          {isSandbox ? (
            <p className="mt-2 font-light">
              The card spends USDC on {chain.label} from this wallet.{" "}
              {cardId ? "Keep it topped up with" : "Before signing up, give it"}{" "}
              <a
                className="text-primary underline"
                href="https://docs.base.org/base-chain/tools/network-faucets"
                target="_blank"
                rel="noreferrer"
              >
                Base Sepolia ETH
              </a>{" "}
              for gas and{" "}
              <a
                className="text-primary underline"
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noreferrer"
              >
                testnet USDC
              </a>{" "}
              to spend.
            </p>
          ) : (
            <p className="mt-2 font-light">
              The card spends real USDC on {chain.label} from this wallet, and
              the approval transaction needs real ETH for gas.
            </p>
          )}
        </div>
      ) : (
        <p className="text-[14px] font-light">
          Waiting for an embedded Ethereum wallet. The provider creates one on
          login for users without one.
        </p>
      )}

      {!isSandbox && (
        <p className="mt-3 rounded-md bg-[#FFF4E5] p-3 text-[13px] font-light text-[#663C00]">
          Production uses real money, and a card created here cannot spend yet:
          the SDK publishes no mainnet Bridge spender, so signup skips the USDC
          approval and still reports the card as ready. Simulated purchases are
          sandbox-only &mdash; Stripe&apos;s test helpers do not exist for live
          keys.
        </p>
      )}

      {openView === "signup" && wallet && (
        <Modal onClose={closeModal} label="Sign up for a card">
          <SignUpForCardView
            environment={environment}
            walletId={wallet.id}
            chainId={chain.id}
            onCardReady={onCardReady}
            onClose={closeModal}
          />
        </Modal>
      )}

      {openView === "summary" && cardId && (
        <Modal onClose={closeModal} label="Card summary">
          <CardSummaryView
            cardId={cardId}
            developerName={DEVELOPER_NAME}
            environment={environment}
            onClose={closeModal}
          />
        </Modal>
      )}
    </Section>
  );
};

export default Cards;
