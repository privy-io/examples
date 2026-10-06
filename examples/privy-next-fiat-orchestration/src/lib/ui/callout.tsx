import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/cn";

const calloutVariants = cva("flex gap-3 rounded-xl border p-3 text-sm", {
  variants: {
    variant: {
      info: "border-border-info bg-background-info text-text",
      success: "border-border-success bg-background-success text-text",
      warning: "border-border-warning bg-background-warning text-text",
      error: "border-border-error bg-background-error text-text",
    },
  },
  defaultVariants: { variant: "info" },
});

const icons = {
  info: <Info className="size-4 text-text-interactive" />,
  success: <CircleCheck className="size-4 text-text-success" />,
  warning: <TriangleAlert className="size-4 text-text-warning" />,
  error: <CircleAlert className="size-4 text-text-error" />,
} as const;

export interface CalloutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof calloutVariants> {
  title?: React.ReactNode;
}

export function Callout({
  className,
  variant,
  title,
  children,
  ...props
}: CalloutProps) {
  return (
    <div
      role={variant === "error" ? "alert" : undefined}
      className={cn(calloutVariants({ variant }), className)}
      {...props}
    >
      <div className="mt-0.5 shrink-0">{icons[variant ?? "info"]}</div>
      <div className="min-w-0 space-y-1 leading-relaxed">
        {title && <div className="font-medium">{title}</div>}
        {children && <div className="text-text-muted">{children}</div>}
      </div>
    </div>
  );
}
