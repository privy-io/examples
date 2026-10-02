import type { CardEnvironment } from "@/chains";

export const CardEnvironmentToggle = ({
  value,
  onChange,
}: {
  value: CardEnvironment;
  onChange: (value: CardEnvironment) => void;
}) => (
  <div className="mb-4 flex items-center gap-3 text-[14px]">
    <span className="font-medium">Environment</span>
    <div className="inline-flex gap-1 rounded-2xl bg-[#E7E7F3] p-1.5">
      {(["sandbox", "production"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={`cursor-pointer rounded-xl px-5 py-2 text-[15px] font-medium capitalize transition-colors duration-150 ${
            value === option
              ? "bg-white text-[#040217] shadow-sm"
              : "bg-transparent text-[#6B6B8C] hover:text-[#040217]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);
