import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "primary";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  dot,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200/50",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    warning: "bg-amber-50 text-amber-700 border-amber-200/50",
    danger: "bg-red-50 text-red-700 border-red-200/50",
    info: "bg-blue-50 text-blue-700 border-blue-200/50",
    primary: "bg-teal-50 text-teal-700 border-teal-200/50",
  };

  const dotColors = {
    default: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    primary: "bg-teal-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
