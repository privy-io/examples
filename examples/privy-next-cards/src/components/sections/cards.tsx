"use client";

import { useCallback, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSignUpForCard } from "@privy-io/react-auth/cards";

import {
  CARD_CHAINS,
  CARD_FUNDING_ASSETS,
  productionSpendApproval,
  type CardEnvironment,
  type CardFundingAsset,
} from "@/chains";
import Section from "../reusables/section";
import { showErrorToast, showSuccessToast } from "../ui/custom-toast";
import type { CardContainerMode } from "./card-container-mode";
import { CardContainerToggle } from "./card-container-toggle";
import { CardEnvironmentToggle } from "./card-environment-toggle";
import { CardFundingAssetToggle } from "./card-funding-asset-toggle";
import { CardSignUpModal } from "./card-sign-up-modal";
import { CardSummaryContainer } from "./card-summary-container";
import { findEmbeddedWallet } from "./find-embedded-wallet";
import { FundingWalletStatus } from "./funding-wallet-status";
import { ProductionCardWarning } from "./production-card-warning";
import { useActiveCard } from "./use-active-card";
import { useSimulatedCardSpend } from "./use-simulated-card-spend";
import { useWalletFunding } from "./use-wallet-funding";

const Cards = () => {
  const { user, getAccessToken } = usePrivy();
  const { signUp, close, isOpen } = useSignUpForCard();
  const [environment, setEnvironment] =
    useState<CardEnvironment>("sandbox");
  const [asset, setAsset] = useState<CardFundingAsset>("pathusd");
  const [containerMode, setContainerMode] =
    useState<CardContainerMode>("modal");
  const [openView, setOpenView] = useState<"summary" | null>(null);
  const wallet = findEmbeddedWallet(user?.linkedAccounts ?? []);
  const chain = CARD_CHAINS[environment];
  const funding = CARD_FUNDING_ASSETS[asset];
  const isSandbox = environment === "sandbox";
  const spendApproval = productionSpendApproval(asset);
  const { cardId, setCardId, error, isLoading, totalCards } = useActiveCard({
    userId: user?.id,
    walletId: wallet?.id,
    environment,
    asset,
    chainId: chain.id,
    getAccessToken,
  });
  const { fund, isFunding } = useWalletFunding({
    address: wallet?.address,
    token: funding.label,
  });
  const { simulate, isSpending, label } = useSimulatedCardSpend({
    cardId,
    environment,
    getAccessToken,
  });

  const closeView = useCallback(() => setOpenView(null), []);

  const switchEnvironment = (next: CardEnvironment) => {
    setOpenView(null);
    setCardId(null);
    setEnvironment(next);
  };

  const switchAsset = (next: CardFundingAsset) => {
    setOpenView(null);
    setCardId(null);
    setAsset(next);
  };

  const onReplaced = (nextCardId: string) => {
    setCardId(nextCardId);
    showSuccessToast("Card replaced. Showing the new card.");
  };

  const openCardSignUp = async () => {
    if (!wallet || (!isSandbox && !spendApproval)) return;

    try {
      const result = isSandbox
        ? await signUp({
            environment: "sandbox",
            walletId: wallet.id,
            chainId: chain.id,
            asset,
          })
        : await signUp({
            environment: "production",
            spendApproval: spendApproval!,
            walletId: wallet.id,
            chainId: chain.id,
            asset,
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
            disabled: !wallet || (!isSandbox && !spendApproval),
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
        <CardFundingAssetToggle value={asset} onChange={switchAsset} />
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
          token={funding.label}
          totalCards={totalCards}
        />
        {!isSandbox && (
          <ProductionCardWarning
            isConfigured={Boolean(spendApproval)}
            token={funding.label}
          />
        )}
      </Section>

      {isOpen && <CardSignUpModal onClose={close} />}
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
