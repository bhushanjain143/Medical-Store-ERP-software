"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:pointer-events-none active:scale-[0.98] cursor-pointer whitespace-nowrap";

    const variants = {
      primary:
        "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 focus-visible:ring-indigo-500/50 shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30",
      secondary:
        "bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] focus-visible:ring-slate-400 border border-[var(--border-default)]",
      danger:
        "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 focus-visible:ring-red-500/50 shadow-md shadow-red-500/20",
      ghost:
        "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]",
      outline:
        "border-2 border-[var(--border-default)] text-[var(--text-secondary)] hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-500/5 focus-visible:ring-indigo-500/50",
      success:
        "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus-visible:ring-emerald-500/50 shadow-md shadow-emerald-500/20",
    };

    const sizes = {
      sm: "text-xs px-4 py-2 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-sm px-7 py-3.5 gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
