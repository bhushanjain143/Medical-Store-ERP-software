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
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer";

    const variants = {
      primary:
        "bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 focus-visible:ring-teal-500/50 shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30",
      secondary:
        "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400 border border-slate-200/50",
      danger:
        "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 focus-visible:ring-red-500/50 shadow-md shadow-red-500/20",
      ghost:
        "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      outline:
        "border-2 border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/50 focus-visible:ring-teal-500/50",
      success:
        "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 focus-visible:ring-emerald-500/50 shadow-md shadow-emerald-500/20",
    };

    const sizes = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-sm px-5 py-2.5 gap-2",
      lg: "text-sm px-6 py-3 gap-2",
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
