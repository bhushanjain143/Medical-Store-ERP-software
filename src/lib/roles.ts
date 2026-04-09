export type AccessLevel = "full" | "view" | "none";

export interface RouteAccess {
  path: string;
  admin: AccessLevel;
  salesperson: AccessLevel;
}

export const ROUTE_PERMISSIONS: RouteAccess[] = [
  { path: "/dashboard", admin: "full", salesperson: "view" },
  { path: "/dashboard/billing", admin: "full", salesperson: "full" },
  { path: "/dashboard/medicines", admin: "full", salesperson: "view" },
  { path: "/dashboard/purchases", admin: "full", salesperson: "none" },
  { path: "/dashboard/expiry", admin: "full", salesperson: "view" },
  { path: "/dashboard/customers", admin: "full", salesperson: "full" },
  { path: "/dashboard/suppliers", admin: "full", salesperson: "none" },
  { path: "/dashboard/prescriptions", admin: "full", salesperson: "full" },
  { path: "/dashboard/reports", admin: "full", salesperson: "none" },
  { path: "/dashboard/gst", admin: "full", salesperson: "none" },
  { path: "/dashboard/notifications", admin: "full", salesperson: "view" },
  { path: "/dashboard/users", admin: "full", salesperson: "none" },
  { path: "/dashboard/settings", admin: "full", salesperson: "none" },
];

export function getAccessLevel(pathname: string, role: string): AccessLevel {
  if (role === "admin") return "full";

  const match = ROUTE_PERMISSIONS.find((r) => {
    if (r.path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(r.path);
  });

  if (!match) return "none";
  return role === "salesperson" ? match.salesperson : match.admin;
}

export function canAccess(pathname: string, role: string): boolean {
  return getAccessLevel(pathname, role) !== "none";
}

export function isReadOnly(pathname: string, role: string): boolean {
  return getAccessLevel(pathname, role) === "view";
}
