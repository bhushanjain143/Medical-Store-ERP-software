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

const COLORS = ["#0d9488", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444"];

const gradientCards = [
  { from: "from-teal-500", to: "to-emerald-600", shadow: "shadow-teal-600/20", iconBg: "bg-white/20" },
  { from: "from-blue-500", to: "to-indigo-600", shadow: "shadow-blue-600/20", iconBg: "bg-white/20" },
  { from: "from-emerald-500", to: "to-green-600", shadow: "shadow-emerald-600/20", iconBg: "bg-white/20" },
  { from: "from-violet-500", to: "to-purple-600", shadow: "shadow-violet-600/20", iconBg: "bg-white/20" },
  { from: "from-amber-500", to: "to-orange-600", shadow: "shadow-amber-600/20", iconBg: "bg-white/20" },
  { from: "from-cyan-500", to: "to-blue-600", shadow: "shadow-cyan-600/20", iconBg: "bg-white/20" },
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
  if (!data) return <div className="p-6">Failed to load dashboard</div>;

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
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 stagger-children">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            const g = gradientCards[idx];
            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${g.from} ${g.to} p-3 sm:p-5 text-white shadow-lg ${g.shadow} card-hover min-w-0`}
              >
                <div className="absolute top-0 right-0 w-14 sm:w-20 h-14 sm:h-20 rounded-full bg-white/10 -mr-3 sm:-mr-6 -mt-3 sm:-mt-6 blur-sm" />
                <div className="relative min-w-0">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${g.iconBg}`}>
                      <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                    {stat.trend && (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold bg-white/20 px-1.5 py-0.5 rounded-lg">
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-2xl font-extrabold tracking-tight leading-tight truncate">
                    {stat.value}
                  </p>
                  <p className="text-[10px] sm:text-xs text-white/80 font-medium mt-0.5 sm:mt-1 truncate">{stat.label}</p>
                  <p className="text-[9px] sm:text-[11px] text-white/60 mt-0.5 truncate">{stat.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales & Purchases Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Revenue Overview
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sales vs Purchases - Last 6 months</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span className="text-xs text-slate-500">Sales</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-500">Purchases</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.monthlySalesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="purchasesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={2.5} fill="url(#salesGradient)" name="Sales" />
                  <Area type="monotone" dataKey="purchases" stroke="#94a3b8" strokeWidth={2} fill="url(#purchasesGradient)" name="Purchases" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Medicines */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-bold text-slate-900">
                Top Selling Medicines
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">By units sold</p>
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
                        stroke="#fff"
                      >
                        {data.topMedicines.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
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
                          <span className="text-sm text-slate-700 font-medium truncate max-w-[130px]">
                            {med.name}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold bg-slate-50 px-2 py-0.5 rounded-md">
                          {med.quantity} units
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  No sales data yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Sales */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Sales</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Latest transactions</p>
                </div>
                <a
                  href="/dashboard/billing"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-3 sm:px-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="text-left py-3 px-3 sm:px-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="text-left py-3 px-3 sm:px-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left py-3 px-3 sm:px-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="text-left py-3 px-3 sm:px-5 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSales.length > 0 ? (
                      data.recentSales.map((sale) => (
                        <tr key={sale.id} className="border-b border-slate-50 hover:bg-teal-50/30 transition-colors">
                          <td className="py-3 px-3 sm:px-5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                                <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-teal-600" />
                              </div>
                              <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                                {sale.invoiceNumber}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-5 text-slate-600 text-xs sm:text-sm">
                            {sale.customer?.name || "Walk-in"}
                          </td>
                          <td className="py-3 px-3 sm:px-5 font-bold text-slate-900 text-xs sm:text-sm">
                            {formatCurrency(sale.totalAmount)}
                          </td>
                          <td className="py-3 px-3 sm:px-5">
                            <Badge
                              variant={sale.paymentMode === "credit" ? "warning" : "success"}
                              dot
                            >
                              {sale.paymentMode}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 sm:px-5 text-slate-500 text-xs font-medium">
                            {formatDateTime(sale.createdAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-500">
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
              <h3 className="text-sm font-bold text-slate-900">Pending Dues</h3>
              <p className="text-xs text-slate-500 mt-0.5">Outstanding customer balances</p>
            </CardHeader>
            <CardContent>
              {data.customerDues.length > 0 ? (
                <div className="space-y-3">
                  {data.customerDues.map((customer, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-3 sm:p-3.5 bg-gradient-to-r from-slate-50 to-red-50/30 rounded-xl border border-slate-100/80">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{customer.name}</p>
                          <p className="text-xs text-slate-500 truncate">{customer.phone || "No phone"}</p>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-red-600 bg-red-50 px-2 sm:px-2.5 py-1 rounded-lg flex-shrink-0 whitespace-nowrap">
                        {formatCurrency(customer.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 mb-3">
                    <Clock className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No pending dues</p>
                  <p className="text-xs text-slate-400 mt-1">All accounts are settled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expiry & Low Stock Alerts */}
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
                <Badge variant="error">{data.expiryAlerts?.length || 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data.expiryAlerts?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Medicine</th>
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Batch</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Days Left</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.expiryAlerts.map((alert, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-red-50/30">
                          <td className="py-2.5 px-4">
                            <p className="font-medium text-slate-900 text-xs">{alert.medicineName}</p>
                            <p className="text-[10px] text-slate-400">{alert.category}</p>
                          </td>
                          <td className="py-2.5 px-4 text-xs text-slate-600">{alert.batchNumber}</td>
                          <td className="py-2.5 px-4 text-xs text-right font-medium">{alert.quantity}</td>
                          <td className="py-2.5 px-4 text-right">
                            <Badge variant={alert.daysLeft <= 7 ? "error" : "warning"} size="sm">
                              {alert.daysLeft}d
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-slate-500">No medicines expiring soon</p>
                </div>
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
                <Badge variant="warning">{data.lowStockAlerts?.length || 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {data.lowStockAlerts?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Medicine</th>
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Batch</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Current</th>
                        <th className="text-right py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase">Reorder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lowStockAlerts.map((alert, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-amber-50/30">
                          <td className="py-2.5 px-4">
                            <p className="font-medium text-slate-900 text-xs">{alert.medicineName}</p>
                            <p className="text-[10px] text-slate-400">{alert.category}</p>
                          </td>
                          <td className="py-2.5 px-4 text-xs text-slate-600">{alert.batchNumber}</td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="text-xs font-bold text-red-600">{alert.currentQty}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs text-slate-500">{alert.reorderLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-slate-500">All stock levels are healthy</p>
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
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Supplier Outstanding</h3>
                  <p className="text-xs text-slate-500">Pending supplier payments</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.supplierDues.map((supplier, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-3 sm:p-3.5 bg-gradient-to-r from-slate-50 to-orange-50/30 rounded-xl border border-slate-100/80">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{supplier.name}</p>
                      <p className="text-xs text-slate-500 truncate">{supplier.phone || "No phone"}</p>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-orange-600 bg-orange-50 px-2 sm:px-2.5 py-1 rounded-lg flex-shrink-0 whitespace-nowrap">
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
