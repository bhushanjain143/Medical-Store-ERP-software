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
  Heart,
  X,
  FileText,
  Bell,
  AlertTriangle,
  Calculator,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex-shrink-0 shadow-lg shadow-teal-600/30">
          <Heart className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-[15px] font-bold text-white leading-tight tracking-tight">
              MedStore
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">ERP System</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div className="px-3 pt-4 pb-1.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{section.label}</p>
              </div>
            )}
            {collapsed && <div className="pt-2" />}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/25"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200",
                      !active && "group-hover:scale-110"
                    )} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
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
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-xl bg-slate-900/90 text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800 transition-colors backdrop-blur-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-[270px] bg-gradient-to-b from-slate-900 to-slate-950 transform transition-transform duration-300 ease-out shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 transition-all duration-300 ease-out flex-shrink-0",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <div className="relative h-full">
          {sidebarContent}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 hover:scale-110 transition-all duration-200"
          >
            <ChevronLeft
              className={cn(
                "h-3.5 w-3.5 text-slate-600 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
