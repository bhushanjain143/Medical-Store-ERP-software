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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-slate-900/10 w-full animate-fade-in-scale border border-slate-100 max-h-[90vh] sm:max-h-none",
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-start justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
