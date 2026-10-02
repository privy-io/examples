"use client";

import { useEffect } from "react";

import type { CardContainerMode } from "./card-container-mode";

export const CardSheet = ({
  mode,
  onClose,
  children,
}: {
  mode: Extract<CardContainerMode, "bottom-sheet" | "side-sheet">;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const isBottom = mode === "bottom-sheet";

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        isBottom ? "items-end justify-center" : "justify-end"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Card summary"
        className={
          isBottom
            ? "relative flex max-h-dvh w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl motion-safe:animate-[card-sheet-up_200ms_ease-out] sm:max-w-[640px]"
            : "relative flex h-dvh w-full max-w-[520px] flex-col overflow-hidden bg-white shadow-xl motion-safe:animate-[card-sheet-left_200ms_ease-out]"
        }
      >
        <div
          className={`min-h-0 overflow-y-auto overscroll-contain px-4 ${
            isBottom
              ? "pb-[max(1rem,env(safe-area-inset-bottom))]"
              : "pb-4"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
