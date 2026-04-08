"use client";

import { Bell, Search, User, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-3">
        <div className="pl-12 lg:pl-0 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">{title}</h1>
            <Sparkles className="h-4 w-4 text-teal-500 animate-pulse flex-shrink-0 hidden sm:block" />
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="hidden lg:flex items-center bg-slate-50/80 rounded-xl px-3.5 py-2.5 border border-slate-200/60 hover:border-slate-300 transition-colors group">
            <Search className="h-4 w-4 text-slate-400 mr-2 group-hover:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-44"
            />
          </div>

          <button className="relative p-2 sm:p-2.5 rounded-xl hover:bg-slate-100/80 transition-all duration-200 group">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 group-hover:text-slate-700 transition-colors" />
            <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          <div className="flex items-center gap-2 sm:gap-3 pl-0.5 sm:pl-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-sm shadow-teal-500/20">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {user?.name || "Loading..."}
              </p>
              <p className="text-[11px] text-slate-500 capitalize font-medium">
                {user?.role || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
