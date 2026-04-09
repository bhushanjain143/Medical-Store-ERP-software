import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
