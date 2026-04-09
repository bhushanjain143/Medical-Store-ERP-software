"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  IndianRupee,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Users,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

interface DashboardData {
  stats: {
    todaySales: number;
    todaySalesCount: number;
    monthSales: number;
    monthSalesCount: number;
    todayPurchases: number;
    monthPurchases: number;
    monthProfit: number;
    totalMedicines: number;
    lowStockCount: number;
    expiringCount: number;
    totalCustomers: number;
    expiredCount: number;
    critical7d: number;
    warning30d: number;
    watchlist90d: number;
  };
  recentSales: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paymentMode: string;
    status: string;
    createdAt: string;
    customer: { name: string } | null;
    user: { name: string };
    _count: { items: number };
  }>;
  monthlySalesData: Array<{ month: string; sales: number; purchases: number }>;
  topMedicines: Array<{ name: string; quantity: number; revenue: number }>;
  customerDues: Array<{ name: string; balance: number; phone: string | null }>;
  expiryAlerts: Array<{
    medicineName: string;
    category: string;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
    daysLeft: number;
  }>;
  lowStockAlerts: Array<{
    medicineName: string;
    category: string;
    batchNumber: string;
    currentQty: number;
    reorderLevel: number;
  }>;
  supplierDues: Array<{ name: string; balance: number; phone: string | null }>;
}

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

const statCardStyles = [
  { bg: "bg-gradient-to-br from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/20", iconBg: "bg-white/20" },
  { bg: "bg-gradient-to-br from-blue-500 to-cyan-600", shadow: "shadow-blue-500/20", iconBg: "bg-white/20" },
  { bg: "bg-gradient-to-br from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20", iconBg: "bg-white/20" },
  { bg: "bg-gradient-to-br from-violet-500 to-purple-600", shadow: "shadow-violet-500/20", iconBg: "bg-white/20" },
  { bg: "bg-gradient-to-br from-amber-500 to-orange-600", shadow: "shadow-amber-500/20", iconBg: "bg-white/20" },
  { bg: "bg-gradient-to-br from-cyan-500 to-blue-600", shadow: "shadow-cyan-500/20", iconBg: "bg-white/20" },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;
  if (!data) return <div className="p-6 text-[var(--text-secondary)]">Failed to load dashboard</div>;

  const { stats } = data;

  const statCards = [
    {
      label: "Today's Sales",
      value: formatCurrency(stats.todaySales),
      sub: `${stats.todaySalesCount} invoices`,
      icon: IndianRupee,
      trend: "up" as const,
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(stats.monthSales),
      sub: `${stats.monthSalesCount} sales this month`,
      icon: TrendingUp,
      trend: "up" as const,
    },
    {
      label: "Monthly Profit",
      value: formatCurrency(stats.monthProfit),
      sub: `Purchases: ${formatCurrency(stats.monthPurchases)}`,
      icon: IndianRupee,
      trend: (stats.monthProfit >= 0 ? "up" : "down") as "up" | "down",
    },
    {
      label: "Total Medicines",
      value: stats.totalMedicines.toString(),
      sub: `${stats.lowStockCount} low stock`,
      icon: Package,
    },
    {
      label: "Expiring Soon",
      value: stats.expiringCount.toString(),
      sub: "Within 30 days",
      icon: AlertTriangle,
    },
    {
      label: "Customers",
      value: stats.totalCustomers.toString(),
      sub: "Registered customers",
      icon: Users,
    },
  ];

  return (
    <div>
      <Header title="Dashboard" subtitle="Overview of your medical store" />
      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 stagger-children">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            const s = statCardStyles[idx];
            return (
              <div
                key={stat.label}
                className={`rounded-xl sm:rounded-2xl ${s.bg} px-3 py-3 sm:px-4 sm:py-4 text-white shadow-lg ${s.shadow} card-hover min-h-[100px] sm:min-h-[110px] flex flex-col overflow-hidden`}
              >
                <div className="flex items-center gap-2 mb-auto">
                  <div className={`p-1.5 rounded-lg ${s.iconBg} flex-shrink-0`}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-white/80 font-semibold leading-tight truncate flex-1">{stat.label}</p>
                  {stat.trend && (
                    <span className="flex-shrink-0 flex items-center bg-white/20 p-0.5 rounded">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-2.5 w-2.5" />
                      ) : (
                        <ArrowDownRight className="h-2.5 w-2.5" />
                      )}
                    </span>
                  )}
                </div>
                <div className="mt-2 min-w-0">
                  <p className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none truncate">
                    {stat.value}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-white/60 font-medium mt-1.5 truncate">{stat.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expiry Breakdown Cards */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Expired", count: stats.expiredCount, color: "from-red-600 to-rose-700", iconBg: "bg-red-400/20", textBg: "bg-red-500/15", textColor: "text-red-200" },
            { label: "Critical (7d)", count: stats.critical7d, color: "from-orange-500 to-red-600", iconBg: "bg-orange-400/20", textBg: "bg-orange-500/15", textColor: "text-orange-200" },
            { label: "Warning (30d)", count: stats.warning30d, color: "from-amber-500 to-orange-600", iconBg: "bg-amber-400/20", textBg: "bg-amber-500/15", textColor: "text-amber-200" },
            { label: "Watchlist (90d)", count: stats.watchlist90d, color: "from-sky-500 to-blue-600", iconBg: "bg-sky-400/20", textBg: "bg-sky-500/15", textColor: "text-sky-200" },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-xl sm:rounded-2xl bg-gradient-to-br ${card.color} p-3 sm:p-4 text-white shadow-lg card-hover overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${card.iconBg}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-xs text-white/70 font-semibold">{card.label}</p>
                    <p className="text-xl sm:text-2xl font-extrabold tracking-tight">{card.count}</p>
                  </div>
                </div>
                <span className={`${card.textBg} ${card.textColor} text-[10px] font-bold px-2 py-1 rounded-lg`}>
                  {card.count === 0 ? "Clear" : "batches"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Sales & Purchases Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Revenue Overview
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Sales vs Purchases - Last 6 months</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-xs text-[var(--text-tertiary)]">Sales</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span className="text-xs text-[var(--text-tertiary)]">Purchases</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.monthlySalesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="purchasesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} stroke="var(--text-tertiary)" tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} stroke="var(--text-tertiary)" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid var(--border-default)",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#salesGradient)" name="Sales" />
                  <Area type="monotone" dataKey="purchases" stroke="#94a3b8" strokeWidth={2} fill="url(#purchasesGradient)" name="Purchases" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Medicines */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Top Selling Medicines
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">By units sold</p>
            </CardHeader>
            <CardContent>
              {data.topMedicines.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={data.topMedicines}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="quantity"
                        nameKey="name"
                        strokeWidth={3}
                        stroke="var(--bg-card)"
                      >
                        {data.topMedicines.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid var(--border-default)",
                          fontSize: "12px",
                          background: "var(--bg-card)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 mt-4">
                    {data.topMedicines.map((med, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-3 h-3 rounded-md"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-sm text-[var(--text-secondary)] font-medium truncate max-w-[130px]">
                            {med.name}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)] font-semibold bg-[var(--bg-muted)] px-2 py-0.5 rounded-md">
                          {med.quantity} units
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
                  No sales data yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Sales */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Sales</h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Latest transactions</p>
                </div>
                <a
                  href="/dashboard/billing"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-[var(--border-default)] bg-[var(--table-header-bg)]">
                      <th className="text-left py-3 px-3 sm:px-5 font-semibold text-[var(--text-tertiary)] text-xs uppercase tracking-wider">Invoice</th>
                      <th className="text-left py-3 px-3 sm:px-5 font-semibold text-[var(--text-tertiary)] text-xs uppercase tracking-wider">Customer</th>
                      <th className="text-left py-3 px-3 sm:px-5 font-semibold text-[var(--text-tertiary)] text-xs uppercase tracking-wider">Amount</th>
                      <th className="text-left py-3 px-3 sm:px-5 font-semibold text-[var(--text-tertiary)] text-xs uppercase tracking-wider">Payment</th>
                      <th className="text-left py-3 px-3 sm:px-5 font-semibold text-[var(--text-tertiary)] text-xs uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSales.length > 0 ? (
                      data.recentSales.map((sale) => (
                        <tr key={sale.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--table-row-hover)] transition-colors">
                          <td className="py-3 px-3 sm:px-5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-500" />
                              </div>
                              <span className="font-semibold text-[var(--text-primary)] text-xs sm:text-sm">{sale.invoiceNumber}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-5 text-[var(--text-secondary)] text-xs sm:text-sm">{sale.customer?.name || "Walk-in"}</td>
                          <td className="py-3 px-3 sm:px-5 font-bold text-[var(--text-primary)] text-xs sm:text-sm">{formatCurrency(sale.totalAmount)}</td>
                          <td className="py-3 px-3 sm:px-5">
                            <Badge variant={sale.paymentMode === "credit" ? "warning" : "success"} dot>{sale.paymentMode}</Badge>
                          </td>
                          <td className="py-3 px-3 sm:px-5 text-[var(--text-tertiary)] text-xs font-medium">{formatDateTime(sale.createdAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-[var(--text-tertiary)]">
                          No sales yet. Start billing to see data here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Customer Dues */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Pending Dues</h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Outstanding customer balances</p>
            </CardHeader>
            <CardContent>
              {data.customerDues.length > 0 ? (
                <div className="space-y-3">
                  {data.customerDues.map((customer, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-3 sm:p-3.5 bg-[var(--bg-muted)] rounded-xl border border-[var(--border-default)]">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{customer.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)] truncate">{customer.phone || "No phone"}</p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-red-500 bg-red-500/10 px-2 sm:px-2.5 py-1 rounded-lg flex-shrink-0 whitespace-nowrap">
                        {formatCurrency(customer.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--bg-muted)] mb-3">
                    <Clock className="h-6 w-6 text-[var(--text-tertiary)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">No pending dues</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">All accounts are settled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expiry & Low Stock Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Expiry Alerts</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">Medicines expiring within 30 days</p>
                  </div>
                </div>
                <Badge variant="error">{data.expiryAlerts?.length || 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data.expiryAlerts?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-default)] bg-[var(--table-header-bg)]">
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Medicine</th>
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Batch</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Qty</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Days Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.expiryAlerts.map((alert, i) => (
                        <tr key={i} className="border-b border-[var(--border-subtle)] hover:bg-[var(--table-row-hover)]">
                          <td className="py-2.5 px-4">
                            <p className="font-medium text-[var(--text-primary)] text-xs">{alert.medicineName}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)]">{alert.category}</p>
                          </td>
                          <td className="py-2.5 px-4 text-xs text-[var(--text-secondary)]">{alert.batchNumber}</td>
                          <td className="py-2.5 px-4 text-xs text-right font-medium text-[var(--text-primary)]">{alert.quantity}</td>
                          <td className="py-2.5 px-4 text-right">
                            <Badge variant={alert.daysLeft <= 7 ? "error" : "warning"} size="sm">{alert.daysLeft}d</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-[var(--text-tertiary)]">No medicines expiring soon</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Low Stock Alerts</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">Below reorder level</p>
                  </div>
                </div>
                <Badge variant="warning">{data.lowStockAlerts?.length || 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data.lowStockAlerts?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-default)] bg-[var(--table-header-bg)]">
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Medicine</th>
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Batch</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Current</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Reorder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowStockAlerts.map((alert, i) => (
                        <tr key={i} className="border-b border-[var(--border-subtle)] hover:bg-[var(--table-row-hover)]">
                          <td className="py-2.5 px-4">
                            <p className="font-medium text-[var(--text-primary)] text-xs">{alert.medicineName}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)]">{alert.category}</p>
                          </td>
                          <td className="py-2.5 px-4 text-xs text-[var(--text-secondary)]">{alert.batchNumber}</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="text-xs font-bold text-red-500">{alert.currentQty}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs text-[var(--text-tertiary)]">{alert.reorderLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-[var(--text-tertiary)]">All stock levels are healthy</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Supplier Dues */}
        {data.supplierDues?.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Supplier Outstanding</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">Pending supplier payments</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.supplierDues.map((supplier, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-3 sm:p-3.5 bg-[var(--bg-muted)] rounded-xl border border-[var(--border-default)]">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{supplier.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate">{supplier.phone || "No phone"}</p>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-orange-500 bg-orange-500/10 px-2 sm:px-2.5 py-1 rounded-lg flex-shrink-0 whitespace-nowrap">
                      {formatCurrency(supplier.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
