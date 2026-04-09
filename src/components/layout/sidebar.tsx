"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  Package,
  Users,
  Truck,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  FileText,
  Bell,
  AlertTriangle,
  Calculator,
} from "lucide-react";
import { MedicalLogo } from "@/components/ui/illustrations";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { canAccess } from "@/lib/roles";

const navSections = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/billing", label: "Billing / POS", icon: ShoppingCart },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/dashboard/medicines", label: "Medicines", icon: Pill },
      { href: "/dashboard/purchases", label: "Purchases", icon: Package },
      { href: "/dashboard/expiry", label: "Expiry Tracker", icon: AlertTriangle },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/dashboard/customers", label: "Customers", icon: Users },
      { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck },
      { href: "/dashboard/prescriptions", label: "Prescriptions", icon: FileText },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
      { href: "/dashboard/gst", label: "GST Reports", icon: Calculator },
      { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/dashboard/users", label: "Users", icon: Shield },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = user?.role || "admin";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <MedicalLogo size={38} className="flex-shrink-0" />
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-[15px] font-bold text-white leading-tight tracking-tight">
              MedStore
            </h1>
            <p className="text-[11px] text-indigo-300/50 font-medium">ERP System</p>
          </div>
        )}
      </div>

      <nav aria-label="Main navigation" className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => canAccess(item.href, role));
          if (visibleItems.length === 0) return null;
          return (
          <div key={section.label}>
            {!collapsed && (
              <div className="px-3 pt-5 pb-1.5">
                <p className="text-[10px] font-bold text-indigo-300/40 uppercase tracking-widest">{section.label}</p>
              </div>
            )}
            {collapsed && <div className="pt-2" />}
            <div className="space-y-0.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-[18px] w-[18px] flex-shrink-0 transition-all duration-200",
                      !active && "group-hover:scale-110 group-hover:text-indigo-300"
                    )} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-[#1e1b4b] text-white shadow-lg shadow-indigo-900/30 hover:bg-[#312e81] transition-colors backdrop-blur-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-[270px] bg-gradient-to-b from-[#0f0d2e] via-[#1a1748] to-[#0f0d2e] transform transition-transform duration-300 ease-out shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation menu"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-gradient-to-b from-[#0f0d2e] via-[#1a1748] to-[#0f0d2e] transition-all duration-300 ease-out flex-shrink-0",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <div className="relative h-full">
          {sidebarContent}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] shadow-md flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:scale-110 transition-all duration-200"
          >
            <ChevronLeft
              className={cn(
                "h-3.5 w-3.5 text-[var(--text-secondary)] transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
