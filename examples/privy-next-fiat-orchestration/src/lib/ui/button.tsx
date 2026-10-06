import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  [
    "inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-background-interactive text-text-inverse hover:bg-background-interactive-hover",
        secondary:
          "bg-background-elevated text-text hover:bg-background-elevated-hover",
        outline:
          "border border-border bg-background text-text hover:border-border-hover hover:bg-background-hover",
        ghost:
          "text-text-interactive hover:text-text-interactive-hover hover:bg-background-hover",
        danger:
          "border border-border-error bg-background text-text-error hover:bg-background-error",
      },
      size: {
        sm: "px-3 py-1 text-xs",
        default: "px-5 py-2 text-sm",
        lg: "px-6 py-3 text-sm",
        icon: "p-2",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
