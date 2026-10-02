"use client";

import { useCallback, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSignUpForCard } from "@privy-io/react-auth/cards";

import { CARD_CHAINS, type CardEnvironment } from "@/chains";
import Section from "../reusables/section";
import { showErrorToast, showSuccessToast } from "../ui/custom-toast";
import type { CardContainerMode } from "./card-container-mode";
import { CardContainerToggle } from "./card-container-toggle";
import { CardEnvironmentToggle } from "./card-environment-toggle";
import { CardSignUpModal } from "./card-sign-up-modal";
import { CardSummaryContainer } from "./card-summary-container";
import { findEmbeddedWallet } from "./find-embedded-wallet";
import { FundingWalletStatus } from "./funding-wallet-status";
import { ProductionCardWarning } from "./production-card-warning";
import { useActiveCard } from "./use-active-card";
import { useSimulatedCardSpend } from "./use-simulated-card-spend";
import { useWalletFunding } from "./use-wallet-funding";

const PRODUCTION_SPEND_APPROVAL = (() => {
  const stablecoinAddress = process.env.NEXT_PUBLIC_CARD_USDC_ADDRESS;
  const spenderAddress = process.env.NEXT_PUBLIC_CARD_SPENDER_ADDRESS;
  if (!stablecoinAddress || !spenderAddress) return null;
  return { stablecoinAddress, spenderAddress };
})();

const Cards = () => {
  const { user, getAccessToken } = usePrivy();
  const { signUp } = useSignUpForCard();
  const [environment, setEnvironment] =
    useState<CardEnvironment>("sandbox");
  const [containerMode, setContainerMode] =
    useState<CardContainerMode>("modal");
  const [openView, setOpenView] = useState<
    "signup" | "summary" | null
  >(null);
  const wallet = findEmbeddedWallet(user?.linkedAccounts ?? []);
  const chain = CARD_CHAINS[environment];
  const isSandbox = environment === "sandbox";
  const { cardId, setCardId, error, isLoading, totalCards } = useActiveCard({
    userId: user?.id,
    environment,
    getAccessToken,
  });
  const { fund, isFunding } = useWalletFunding({
    address: wallet?.address,
    token: chain.token,
  });
  const { simulate, isSpending, label } = useSimulatedCardSpend({
    cardId,
    environment,
    getAccessToken,
  });

  const closeView = useCallback(() => setOpenView(null), []);

  const switchEnvironment = (next: CardEnvironment) => {
    setOpenView(null);
    setEnvironment(next);
  };

  const onReplaced = (nextCardId: string) => {
    setCardId(nextCardId);
    showSuccessToast("Card replaced. Showing the new card.");
  };

  const openCardSignUp = async () => {
    if (!wallet || (!isSandbox && !PRODUCTION_SPEND_APPROVAL)) return;

    setOpenView("signup");
    try {
      const result = isSandbox
        ? await signUp({
            environment: "sandbox",
            walletId: wallet.id,
            chainId: chain.id,
            asset: "path_usd",
          })
        : await signUp({
            environment: "production",
            spendApproval: PRODUCTION_SPEND_APPROVAL!,
            walletId: wallet.id,
            chainId: chain.id,
            asset: "usdc",
          });
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

  return (
    <>
      <Section
        name="Cards"
        description="Sign up for a card, then review its balance, transactions, and details."
        filepath="src/components/sections/cards"
        actions={[
          {
            name: "Sign up for a card",
            function: openCardSignUp,
            disabled: !wallet || (!isSandbox && !PRODUCTION_SPEND_APPROVAL),
          },
          {
            name: "View card summary",
            function: () => setOpenView("summary"),
            disabled: !wallet || !cardId,
          },
          ...(isSandbox
            ? [
                {
                  name: isFunding ? "Funding…" : "Fund wallet from faucet",
                  function: fund,
                  disabled: !wallet || isFunding,
                },
                {
                  name: isSpending
                    ? "Simulating…"
                    : `Simulate a ${label} purchase`,
                  function: simulate,
                  disabled: !cardId || isSpending,
                },
              ]
            : []),
        ]}
      >
        <CardEnvironmentToggle
          value={environment}
          onChange={switchEnvironment}
        />
        <CardContainerToggle
          value={containerMode}
          onChange={setContainerMode}
        />
        <FundingWalletStatus
          address={wallet?.address}
          cardId={cardId}
          error={error}
          isLoading={isLoading}
          isSandbox={isSandbox}
          chainLabel={chain.label}
          token={chain.token}
          totalCards={totalCards}
        />
        {!isSandbox && (
          <ProductionCardWarning
            isConfigured={Boolean(PRODUCTION_SPEND_APPROVAL)}
          />
        )}
      </Section>

      {openView === "signup" && <CardSignUpModal onClose={closeView} />}
      {openView === "summary" && cardId && (
        <CardSummaryContainer
          cardId={cardId}
          environment={environment}
          mode={containerMode}
          onClose={closeView}
          onReplaced={onReplaced}
        />
      )}
    </>
  );
};

export default Cards;
