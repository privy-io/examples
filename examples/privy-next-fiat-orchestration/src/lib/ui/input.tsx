import * as React from "react";
import { cn } from "@/lib/cn";

const fieldClasses =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-subtle transition-colors hover:border-border-hover focus:border-border-focus focus:outline-hidden disabled:cursor-not-allowed disabled:bg-background-elevated disabled:text-text-muted";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClasses, className)} {...props} />;
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldClasses, "cursor-pointer", className)} {...props} />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium text-text-muted", className)}
      {...props}
    />
  );
}
