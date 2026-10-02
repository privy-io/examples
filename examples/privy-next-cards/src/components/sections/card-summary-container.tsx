"use client";

import dynamic from "next/dynamic";

import type { CardEnvironment } from "@/chains";
import type { CardContainerMode } from "./card-container-mode";
import { CardSheet } from "./card-sheet";
import { Modal } from "./modal";

const CardSummaryView = dynamic(
  () =>
    import("@privy-io/react-auth/cards").then((m) => ({
      default: m.CardSummaryView,
    })),
  { ssr: false },
);

export const CardSummaryContainer = ({
  cardId,
  environment,
  mode,
  onClose,
  onReplaced,
}: {
  cardId: string;
  environment: CardEnvironment;
  mode: CardContainerMode;
  onClose: () => void;
  onReplaced: (cardId: string) => void;
}) => {
  const summary = (
    <CardSummaryView
      key={cardId}
      cardId={cardId}
      environment={environment}
      onReplaced={onReplaced}
      onClose={onClose}
    />
  );

  if (mode === "modal") {
    return (
      <Modal onClose={onClose} label="Card summary">
        {summary}
      </Modal>
    );
  }

  return (
    <CardSheet mode={mode} onClose={onClose}>
      {summary}
    </CardSheet>
  );
};
