"use client";

import dynamic from "next/dynamic";

import { Modal } from "./modal";

const SignUpForCardView = dynamic(
  () =>
    import("@privy-io/react-auth/cards").then((m) => ({
      default: m.SignUpForCardView,
    })),
  { ssr: false },
);

export const CardSignUpModal = ({ onClose }: { onClose: () => void }) => (
  <Modal onClose={onClose} label="Sign up for a card" dismissible={false}>
    <SignUpForCardView />
  </Modal>
);
