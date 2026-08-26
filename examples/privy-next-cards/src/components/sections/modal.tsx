"use client";

import { useEffect } from "react";

/**
 * Centered modal that hosts the card views.
 *
 * The width matches what the card components are designed against, so they render at their
 * intended size rather than stretching. Closes on backdrop click and on Escape.
 *
 * Mount it conditionally — being mounted *is* being open. The card views fetch on mount, so
 * rendering one inside a hidden modal would fire requests for a dialog nobody opened.
 */
export const Modal = ({
  onClose,
  label,
  children,
}: {
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    // The page only hides overflow at `md` and up, so without this the body scrolls behind the
    // modal on mobile.
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative max-h-[90vh] w-[440px] max-w-full overflow-y-auto rounded-2xl bg-white px-4 pb-4 shadow-xl"
      >
        {children}
      </div>
    </div>
  );
};
