"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl border px-3.5 py-2.5 text-sm",
            "bg-[var(--bg-input)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "transition-all duration-200 shadow-sm hover:border-indigo-300/50",
            error && "border-red-400 focus:ring-red-500/30 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
