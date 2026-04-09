"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AuthProvider } from "@/lib/use-auth";
import { RoleGate } from "@/components/layout/role-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-[#f8fafc]">
          <div className="min-h-full">
            <RoleGate>{children}</RoleGate>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
