import type { CardContainerMode } from "./card-container-mode";

const OPTIONS: { label: string; value: CardContainerMode }[] = [
  { label: "Modal", value: "modal" },
  { label: "Bottom sheet", value: "bottom-sheet" },
  { label: "Side sheet", value: "side-sheet" },
];

export const CardContainerToggle = ({
  value,
  onChange,
}: {
  value: CardContainerMode;
  onChange: (value: CardContainerMode) => void;
}) => (
  <div className="mb-4">
    <p className="mb-2 text-[14px] font-medium">Card summary container</p>
    <div
      role="group"
      aria-label="Card summary container"
      className="inline-flex max-w-full flex-wrap gap-1 rounded-2xl bg-[#E7E7F3] p-1.5"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`cursor-pointer rounded-xl px-4 py-2 text-[14px] font-medium transition-colors duration-150 ${
            value === option.value
              ? "bg-white text-[#040217] shadow-sm"
              : "bg-transparent text-[#6B6B8C] hover:text-[#040217]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);
