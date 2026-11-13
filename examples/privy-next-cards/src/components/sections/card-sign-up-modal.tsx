"use client";

import dynamic from "next/dynamic";
import { useSignUpForCard } from "@privy-io/react-auth/cards";

import { Modal } from "./modal";

const SignUpForCardView = dynamic(
  () =>
    import("@privy-io/react-auth/cards").then((m) => ({
      default: m.SignUpForCardView,
    })),
  { ssr: false },
);

/**
 * Backdrop and Escape close through the hook's `close`, which settles the pending `signUp` promise
 * the same way the view's own controls do. Most signup steps have no close control of their own.
 */
export const CardSignUpModal = () => {
  const { close } = useSignUpForCard();

  return (
    <Modal onClose={close} label="Sign up for a card">
      <SignUpForCardView />
    </Modal>
  );
};
