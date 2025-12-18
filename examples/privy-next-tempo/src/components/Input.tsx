interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
}

export function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  onEnter,
}: InputProps) {
  return (
    <div>
      <label
        className="text-xs tracking-widest uppercase mb-3 block"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        placeholder={placeholder}
        className="w-full backdrop-blur-xl rounded-md px-4 py-3 text-sm font-mono transition-all outline-none"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "var(--glass-border-hover)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "var(--glass-border)")
        }
      />
    </div>
  );
}
