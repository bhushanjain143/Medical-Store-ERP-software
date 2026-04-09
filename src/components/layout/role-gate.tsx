"use client";

import { useAuth } from "@/lib/use-auth";
import { canAccess, isReadOnly } from "@/lib/roles";
import { usePathname } from "next/navigation";
import { ShieldOff } from "lucide-react";

export function RoleGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user) return <>{children}</>;

  if (!canAccess(pathname, user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <ShieldOff className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Access Denied</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm">
          You don&apos;t have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-3">
          Signed in as <span className="font-semibold capitalize">{user.role}</span>
        </p>
      </div>
    );
  }

  const readOnly = isReadOnly(pathname, user.role);

  if (readOnly) {
    return (
      <>
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            View-only mode — You have read access to this page. Editing is restricted to admins.
          </p>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
}
