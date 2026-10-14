import {
  CARD_FUNDING_ASSETS,
  type CardFundingAsset,
} from "@/chains";

const OPTIONS: CardFundingAsset[] = ["pathusd", "ousd"];

export const CardFundingAssetToggle = ({
  value,
  onChange,
}: {
  value: CardFundingAsset;
  onChange: (value: CardFundingAsset) => void;
}) => (
  <div className="mb-4 flex items-center gap-3 text-[14px]">
    <span className="font-medium">Funding token</span>
    <div
      role="group"
      aria-label="Funding token"
      className="inline-flex gap-1 rounded-2xl bg-[#E7E7F3] p-1.5"
    >
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={`cursor-pointer rounded-xl px-5 py-2 text-[15px] font-medium transition-colors duration-150 ${
            value === option
              ? "bg-white text-[#040217] shadow-sm"
              : "bg-transparent text-[#6B6B8C] hover:text-[#040217]"
          }`}
        >
          {CARD_FUNDING_ASSETS[option].label}
        </button>
      ))}
    </div>
  </div>
);
