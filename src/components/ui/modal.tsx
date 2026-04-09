"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "rounded-2xl shadow-2xl w-full animate-fade-in-scale max-h-[90vh] flex flex-col my-auto",
          "bg-[var(--bg-card)] border border-[var(--border-default)]",
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-start justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--border-default)] flex-shrink-0 bg-[var(--bg-muted)]">
            <div className="min-w-0 flex-1 mr-2">
              <h2 id="modal-title" className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">{title}</h2>
              {subtitle && (
                <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-all duration-200 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
