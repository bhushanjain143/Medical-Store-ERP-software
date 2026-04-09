"use client";

import { Bell, Search, Sparkles, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { useTheme } from "@/lib/theme";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="backdrop-blur-md border-b px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30 transition-colors duration-300 bg-[var(--bg-header)] border-[var(--border-default)]">
      <div className="flex items-center justify-between gap-3">
        <div className="pl-10 lg:pl-0 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] tracking-tight truncate">{title}</h1>
            <Sparkles className="h-4 w-4 text-indigo-400/70 flex-shrink-0 hidden sm:block" />
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="hidden lg:flex items-center rounded-xl px-3.5 py-2.5 border transition-colors group bg-[var(--bg-muted)] border-[var(--border-default)] hover:border-indigo-300/50">
            <Search className="h-4 w-4 text-[var(--text-tertiary)] mr-2 group-hover:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none w-44"
            />
          </div>

          <button
            onClick={toggleTheme}
            className="relative p-2 sm:p-2.5 rounded-xl hover:bg-indigo-500/10 transition-all duration-200 group"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors" />
            )}
          </button>

          <button aria-label="Notifications" className="relative p-2 sm:p-2.5 rounded-xl hover:bg-indigo-500/10 transition-all duration-200 group">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors" />
            <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--bg-card)]" aria-hidden="true"></span>
          </button>

          <div className="h-5 w-px bg-[var(--border-default)] mx-0.5 hidden sm:block" />

          <div className="flex items-center gap-2 sm:gap-3 pl-0.5 sm:pl-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm shadow-indigo-500/20 text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">
                {user?.name || "Loading..."}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] capitalize font-medium">
                {user?.role || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
