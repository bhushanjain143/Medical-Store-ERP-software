"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { AuthProvider } from "@/lib/use-auth";
import { RoleGate } from "@/components/layout/role-gate";
import { MedicineChatbot } from "@/components/ui/medicine-chatbot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden theme-bg transition-colors duration-300">
          <div className="min-h-full">
            <RoleGate>{children}</RoleGate>
          </div>
        </main>
        <MedicineChatbot />
      </div>
    </AuthProvider>
  );
}
