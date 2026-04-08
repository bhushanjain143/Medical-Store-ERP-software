"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  AlertTriangle,
  Package,
  IndianRupee,
  Clock,
  Bell,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

interface AlertData {
  expiryAlerts: Array<{
    medicineName: string;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
    daysLeft: number;
  }>;
  lowStockAlerts: Array<{
    medicineName: string;
    batchNumber: string;
    currentQty: number;
    reorderLevel: number;
  }>;
  customerDues: Array<{
    name: string;
    balance: number;
    phone: string | null;
  }>;
  supplierDues: Array<{
    name: string;
    balance: number;
    phone: string | null;
  }>;
  expiredCount: number;
  totalExpiryLoss: number;
}

export default function NotificationsPage() {
  const [data, setData] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error("Failed to load alerts"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;
  if (!data) return <div className="p-6">Failed to load notifications</div>;

  const totalAlerts =
    data.expiryAlerts.length +
    data.lowStockAlerts.length +
    data.customerDues.length +
    data.supplierDues.length +
    data.expiredCount;

  return (
    <div>
      <Header
        title="Alerts & Notifications"
        subtitle={`${totalAlerts} active alerts requiring attention`}
      />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Alert Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-2.5 sm:p-3.5 text-white shadow-lg overflow-hidden min-w-0">
            <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/50 mb-1" />
            <p className="text-[10px] sm:text-xs text-white/80">Expired</p>
            <p className="text-lg sm:text-xl font-extrabold">{data.expiredCount}</p>
            <p className="text-[9px] sm:text-[10px] text-white/60 truncate">Loss: {formatCurrency(data.totalExpiryLoss)}</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-2.5 sm:p-3.5 text-white shadow-lg overflow-hidden min-w-0">
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/50 mb-1" />
            <p className="text-[10px] sm:text-xs text-white/80">Expiring Soon</p>
            <p className="text-lg sm:text-xl font-extrabold">{data.expiryAlerts.length}</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 p-2.5 sm:p-3.5 text-white shadow-lg overflow-hidden min-w-0">
            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/50 mb-1" />
            <p className="text-[10px] sm:text-xs text-white/80">Low Stock</p>
            <p className="text-lg sm:text-xl font-extrabold">{data.lowStockAlerts.length}</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 sm:p-3.5 text-white shadow-lg overflow-hidden min-w-0">
            <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/50 mb-1" />
            <p className="text-[10px] sm:text-xs text-white/80">Customer Dues</p>
            <p className="text-lg sm:text-xl font-extrabold">{data.customerDues.length}</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 sm:p-3.5 text-white shadow-lg overflow-hidden min-w-0">
            <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/50 mb-1" />
            <p className="text-[10px] sm:text-xs text-white/80">Supplier Dues</p>
            <p className="text-lg sm:text-xl font-extrabold">{data.supplierDues.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expiry Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Expiry Alerts</h3>
                    <p className="text-xs text-slate-500">Medicines expiring within 30 days</p>
                  </div>
                </div>
                <Link href="/dashboard/expiry" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                  View All →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.expiryAlerts.length > 0 ? (
                <div className="space-y-2">
                  {data.expiryAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-red-50/50 border border-red-100/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{alert.medicineName}</p>
                        <p className="text-xs text-slate-500 truncate">Batch: {alert.batchNumber} • Qty: {alert.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge variant={alert.daysLeft <= 7 ? "danger" : "warning"} size="sm">{alert.daysLeft}d</Badge>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(alert.expiryDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">No expiry alerts</p>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Package className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Low Stock Alerts</h3>
                    <p className="text-xs text-slate-500">Below reorder level</p>
                  </div>
                </div>
                <Link href="/dashboard/medicines" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                  View All →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.lowStockAlerts.length > 0 ? (
                <div className="space-y-2">
                  {data.lowStockAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-amber-50/50 border border-amber-100/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{alert.medicineName}</p>
                        <p className="text-xs text-slate-500 truncate">Batch: {alert.batchNumber}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-red-600">{alert.currentQty}</p>
                        <p className="text-[10px] text-slate-400">Min: {alert.reorderLevel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">All stock levels are healthy</p>
              )}
            </CardContent>
          </Card>

          {/* Customer Dues */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Customer Outstanding</h3>
                  <p className="text-xs text-slate-500">Pending customer payments</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data.customerDues.length > 0 ? (
                <div className="space-y-2">
                  {data.customerDues.map((c, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-blue-50/50 border border-blue-100/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                        <p className="text-xs text-slate-500 truncate">{c.phone || "No phone"}</p>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-red-600 flex-shrink-0 whitespace-nowrap">{formatCurrency(c.balance)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">No pending customer dues</p>
              )}
            </CardContent>
          </Card>

          {/* Supplier Dues */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Supplier Outstanding</h3>
                  <p className="text-xs text-slate-500">Pending supplier payments</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data.supplierDues.length > 0 ? (
                <div className="space-y-2">
                  {data.supplierDues.map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-violet-50/50 border border-violet-100/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{s.name}</p>
                        <p className="text-xs text-slate-500 truncate">{s.phone || "No phone"}</p>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-orange-600 flex-shrink-0 whitespace-nowrap">{formatCurrency(s.balance)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">No pending supplier dues</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
