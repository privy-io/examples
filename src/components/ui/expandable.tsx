"use client";

import { useState, type ReactNode } from "react";

type ExpandableProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function Expandable({
  title,
  children,
  defaultOpen = false,
  className,
}: ExpandableProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <div className={["exp-container", className ?? ""].join(" ")}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={["exp-header"].join(" ")}
      >
        <div className="exp-title">{title}</div>
        <ChevronIcon
          className={["exp-chevron", open ? "rotate-180" : "rotate-0"].join(
            " "
          )}
        />
      </button>

      <div
        className={["exp-content-outer", open ? "exp-open" : "exp-closed"].join(
          " "
        )}
      >
        <div className="exp-content-inner">
          <div className="exp-body">{children}</div>
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
