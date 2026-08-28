"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSignUpForCard } from "@privy-io/react-auth/ui";
import dynamic from "next/dynamic";

import Section from "../reusables/section";
import { Modal } from "./modal";
import { showSuccessToast, showErrorToast } from "../ui/custom-toast";
import { Badge, type BadgeVariant } from "../ui/badge";
import { findEmbeddedWallet } from "./find-embedded-wallet";
import { simulateSpend } from "./simulate-spend";
import { fundWallet } from "./tempo-faucet";
import { isOpen, listCards } from "./cards-api";
import { CARD_CHAINS, type CardEnvironment } from "@/chains";

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

/**
 * Where a production card's stablecoin allowance goes: the mainnet USDC contract and the Bridge
 * spender that pulls from it at spend time. `SignUpForCardView` requires this on
 * `environment="production"` and builds it in for sandbox testnets, because Bridge does not publish
 * its mainnet spender to the SDK. Both come from the Bridge production integration behind the app's
 * card configuration.
 *
 * Read from env rather than hardcoded: the values are per-integration, and approving the wrong
 * spender leaves a `ready` card that cannot spend. Production signup stays gated until both are set.
 */
const PRODUCTION_SPEND_APPROVAL = (() => {
  const stablecoinAddress = process.env.NEXT_PUBLIC_CARD_USDC_ADDRESS;
  const spenderAddress = process.env.NEXT_PUBLIC_CARD_SPENDER_ADDRESS;
  if (!stablecoinAddress || !spenderAddress) return null;
  return { stablecoinAddress, spenderAddress };
})();

/** Amount, in cents, of the simulated purchase used to put a row on the transaction list. */
const TEST_SPEND_AMOUNT = 50;

/** Formatted for the button label, so the copy cannot drift from the amount actually charged. */
const TEST_SPEND_LABEL = `$${(TEST_SPEND_AMOUNT / 100).toFixed(2)}`;

/** Which card view the modal is showing, if any. */
type OpenView = "signup" | "summary" | null;

const Cards = () => {
  const { user, getAccessToken } = usePrivy();
  const { signUp } = useSignUpForCard();
  const userId = user?.id;
  const [environment, setEnvironment] = useState<CardEnvironment>("sandbox");
  const [cardId, setCardId] = useState<string | null>(null);
  const [openView, setOpenView] = useState<OpenView>(null);
  const [isSpending, setIsSpending] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isLoadingCard, setIsLoadingCard] = useState(false);
  // Why the card lookup failed, if it did. Kept apart from "no card yet": a failed lookup says
  // nothing about whether a card exists, and reporting it as "no card" sends you off to sign up for
  // one you already have.
  const [cardLookupError, setCardLookupError] = useState<string | null>(null);
  // How many cards the lookup found in total, open or not. Distinguishes "you have never had a card
  // here" from "every card you have here is cancelled" — the same empty summary otherwise, and the
  // second one is the confusing case, since the card does exist.
  const [totalCards, setTotalCards] = useState(0);

  const wallet = findEmbeddedWallet(user?.linkedAccounts ?? []);
  const chain = CARD_CHAINS[environment];
  const isSandbox = environment === "sandbox";

  // Label and tone derived together, so the pill cannot end up reading "Checking…" in the green of
  // a card that is already there — which is what two parallel ternaries over the same four states
  // drifted into.
  const cardStatus: { label: string; variant: BadgeVariant } = isLoadingCard
    ? { label: "Checking…", variant: "default" }
    : cardId
      ? { label: "Card created", variant: "success" }
      : cardLookupError
        ? { label: "Lookup failed", variant: "destructive" }
        : totalCards > 0
          ? { label: "Card cancelled", variant: "warning" }
          : { label: "No card yet", variant: "default" };

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
    setCardLookupError(null);

    void (async () => {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("No access token");
        const cards = await listCards({ environment, accessToken: token });
        if (!active) return;
        // Newest first, and cancelled cards stay in the list, so the newest open one is the live
        // card. A replacement lands ahead of the card it closed.
        setCardId(cards.find(isOpen)?.id ?? null);
        setTotalCards(cards.length);
      } catch (error) {
        if (!active) return;
        setCardId(null);
        setTotalCards(0);
        // Reported rather than swallowed. Silently treating a failed lookup as "no card yet" is how
        // an existing card looks like a missing one.
        setCardLookupError(
          error instanceof Error ? error.message : "Card lookup failed",
        );
        console.error("Cards: card lookup failed", error);
      } finally {
        if (active) setIsLoadingCard(false);
      }
    })();

    // Environment switches mid-flight would otherwise let a stale response win.
    return () => {
      active = false;
    };
  }, [userId, environment, getAccessToken]);

  // A replacement closes the card the panel was opened on, so `CardSummaryView` does not adopt the
  // new card — it shows a "card cancelled" banner and hands the new id here. Point the demo at the
  // replacement and remount the panel on it; the `key` on the view is what forces the refetch.
  const onReplaced = (newCardId: string) => {
    setCardId(newCardId);
    showSuccessToast("Card replaced. Showing the new card.");
  };

  // Stable so the modal's Escape listener and scroll lock are not torn down and re-applied on
  // every render of this section.
  const closeModal = useCallback(() => setOpenView(null), []);

  const switchEnvironment = (next: CardEnvironment) => {
    // Close first: the open view is bound to the environment it was opened for.
    setOpenView(null);
    setEnvironment(next);
  };

  const openCardSignUp = async () => {
    if (!wallet || (!isSandbox && !PRODUCTION_SPEND_APPROVAL)) return;

    setOpenView("signup");
    try {
      let result;
      if (isSandbox) {
        result = await signUp({
          environment: "sandbox",
          walletId: wallet.id,
          chainId: chain.id,
        });
      } else {
        if (!PRODUCTION_SPEND_APPROVAL) return;
        result = await signUp({
          environment: "production",
          spendApproval: PRODUCTION_SPEND_APPROVAL,
          walletId: wallet.id,
          chainId: chain.id,
        });
      }
      setCardId(result.id);
      showSuccessToast("Card is ready.");
      setOpenView("summary");
    } catch (error) {
      if (
        !(error instanceof Error) ||
        error.message !== "User cancelled card sign-up"
      ) {
        showErrorToast(
          error instanceof Error ? error.message : "Card sign-up failed",
        );
      }
    } finally {
      setOpenView((view) => (view === "signup" ? null : view));
    }
  };

  const onFundWallet = async () => {
    if (!wallet) return;

    setIsFunding(true);
    try {
      await fundWallet(wallet.address);
      showSuccessToast(
        `Faucet sent test stablecoins to the wallet. ${chain.token} balances may take a moment to show up.`,
      );
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : "Faucet request failed",
      );
    } finally {
      setIsFunding(false);
    }
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
        // Always shown, card or no card. The flow is the point of the demo, so it stays reachable
        // for a second look at the disclosure and KYC steps; a user who already has a card walks
        // them again and the SDK hands back the card that exists rather than issuing another.
        {
          name: "Sign up for a card",
          function: openCardSignUp,
          // Production needs a spend-approval target; without one there is nothing to sign up into
          // but a card that cannot spend.
          disabled: !wallet || (!isSandbox && !PRODUCTION_SPEND_APPROVAL),
        },
        {
          name: "View card summary",
          function: () => setOpenView("summary"),
          disabled: !wallet || !cardId,
        },
        // Both sandbox-only. Moderato's faucet is an RPC method on the chain itself, and Stripe's
        // Issuing test helpers only exist in test mode — there is no way to fabricate a production
        // authorization, so live spend has to be a real purchase.
        ...(isSandbox
          ? [
              {
                name: isFunding ? "Funding…" : "Fund wallet from faucet",
                function: onFundWallet,
                disabled: !wallet || isFunding,
              },
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
      <div className="mb-4 flex items-center gap-3 text-[14px]">
        <span className="font-medium">Environment</span>
        {/* Segmented control: a light track with the selected option raised out of it on a white
            pill, so the active environment reads at a glance without a saturated fill. */}
        <div className="inline-flex gap-1 rounded-2xl bg-[#E7E7F3] p-1.5">
          {(["sandbox", "production"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => switchEnvironment(option)}
              aria-pressed={environment === option}
              className={`cursor-pointer rounded-xl px-5 py-2 text-[15px] font-medium capitalize transition-colors duration-150 ${
                environment === option
                  ? "bg-white text-[#040217] shadow-sm"
                  : "bg-transparent text-[#6B6B8C] hover:text-[#040217]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {wallet ? (
        <div className="w-full max-w-[480px] rounded-xl border border-[#E2E3F0] bg-white p-4 text-[14px]">
          <div className="flex items-center gap-2">
            <p className="font-medium">Funding wallet</p>
            <Badge variant={cardStatus.variant}>{cardStatus.label}</Badge>
          </div>

          {cardLookupError && (
            <p className="mt-2 rounded-md bg-[#FDECEA] p-2 text-[13px] font-light break-words text-[#7F1D1D]">
              {cardLookupError}
            </p>
          )}

          {!cardLookupError && !cardId && totalCards > 0 && (
            <p className="mt-2 text-[13px] font-light">
              {totalCards === 1 ? "The card" : `All ${totalCards} cards`} on this
              wallet {totalCards === 1 ? "has" : "have"} been cancelled, so there
              is nothing to summarize. Sign up again for a new one.
            </p>
          )}
          <p className="font-light break-all">{wallet.address}</p>

          {isSandbox ? (
            <p className="mt-2 font-light">
              The card spends {chain.token} on {chain.label} from this wallet.
              Tempo has no native gas token — fees are paid in the same
              stablecoin — so one faucet top-up covers both the approval and the
              card.
            </p>
          ) : (
            <p className="mt-2 font-light">
              The card spends the real stablecoin configured for this deployment
              on {chain.label} from this wallet. Fees are paid in stablecoin
              rather than a native gas token, so no separate gas balance is
              needed.
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
        <p className="mt-3 w-full max-w-[480px] rounded-xl bg-[#FFF4E5] p-3 text-[13px] font-light text-[#663C00]">
          Production uses real money.{" "}
          {PRODUCTION_SPEND_APPROVAL
            ? "Signup grants a real USDC allowance to the Bridge spender configured in this deployment's env, so a card issued here can spend."
            : "Signup is disabled until NEXT_PUBLIC_CARD_USDC_ADDRESS and NEXT_PUBLIC_CARD_SPENDER_ADDRESS are set — the SDK requires the mainnet spend-approval target, since Bridge does not publish it."}{" "}
          Simulated purchases are sandbox-only &mdash; Stripe&apos;s test helpers
          do not exist for live keys.
        </p>
      )}

      {openView === "signup" && (
        <Modal
          onClose={closeModal}
          label="Sign up for a card"
          dismissible={false}
        >
          {/* The hook owns the active flow and settles its promise from this view's controls.
              Backdrop and Escape dismissal stay disabled so the view always gets to settle it. */}
          <SignUpForCardView />
        </Modal>
      )}

      {openView === "summary" && cardId && (
        <Modal onClose={closeModal} label="Card summary">
          {/* Keyed on the card id so a replacement remounts the view on the new card rather than
              leaving the closed one's data in place. */}
          <CardSummaryView
            key={cardId}
            cardId={cardId}
            environment={environment}
            onReplaced={onReplaced}
            onClose={closeModal}
          />
        </Modal>
      )}
    </Section>
  );
};

export default Cards;
