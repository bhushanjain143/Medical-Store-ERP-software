"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart3,
  Download,
  IndianRupee,
  TrendingUp,
  Package,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type ReportType = "sales" | "purchases" | "profit" | "expiry" | "stock" | "gst";

const reportTabs: { id: ReportType; label: string; icon: React.ElementType }[] = [
  { id: "sales", label: "Sales", icon: IndianRupee },
  { id: "purchases", label: "Purchases", icon: Package },
  { id: "profit", label: "Profit & Loss", icon: TrendingUp },
  { id: "expiry", label: "Expiry", icon: AlertTriangle },
  { id: "stock", label: "Stock", icon: BarChart3 },
  { id: "gst", label: "GST", icon: FileText },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>("sales");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: activeTab });
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await fetch(`/api/reports?${params}`);
      const result = await res.json();
      setData(result);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const items = (data.data || []) as Record<string, unknown>[];
    if (items.length === 0) {
      toast.error("No data to export");
      return;
    }

    let csvContent = "";
    switch (activeTab) {
      case "sales":
        csvContent = "Invoice,Customer,Amount,GST,Discount,Payment,Date\n";
        for (const s of items as Array<Record<string, unknown>>) {
          csvContent += `${s.invoiceNumber},"${(s.customer as Record<string, unknown>)?.name || "Walk-in"}",${s.totalAmount},${s.gstAmount},${s.discount},${s.paymentMode},${formatDate(s.createdAt as string)}\n`;
        }
        break;
      case "stock":
        csvContent = "Medicine,Category,Quantity,Stock Value,Retail Value,Low Stock\n";
        for (const m of items as Array<Record<string, unknown>>) {
          csvContent += `"${m.name}",${m.category},${m.totalQty},${m.stockValue},${m.retailValue},${m.isLowStock ? "Yes" : "No"}\n`;
        }
        break;
      case "expiry":
        csvContent = "Medicine,Batch,Quantity,Purchase Price,Expiry Date\n";
        for (const b of items as Array<Record<string, unknown>>) {
          csvContent += `"${(b.medicine as Record<string, unknown>)?.name}",${b.batchNumber},${b.quantity},${b.purchasePrice},${formatDate(b.expiryDate as string)}\n`;
        }
        break;
      default:
        csvContent = JSON.stringify(items, null, 2);
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported!");
  };

  const summary = data?.summary as Record<string, unknown> | undefined;

  return (
    <div>
      <Header title="Reports" subtitle="Generate and export business reports" />
      <div className="p-4 sm:p-6">
        {/* Report Type Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setData(null); }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Date Filter & Generate */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Input
                id="from"
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <Input
                id="to"
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
              <div className="flex items-end">
                <Button onClick={fetchReport} loading={loading} className="w-full sm:w-auto">
                  <BarChart3 className="h-4 w-4" />
                  Generate
                </Button>
              </div>
              {data && (
                <div className="flex items-end">
                  <Button variant="outline" onClick={exportCSV} className="w-full sm:w-auto">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {loading && <PageLoading />}

        {data && summary && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Cards */}
            {activeTab === "sales" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <SummaryCard label="Total Sales" value={formatCurrency(summary.totalRevenue as number)} color="emerald" />
                <SummaryCard label="Invoices" value={(summary.count as number).toString()} color="blue" />
                <SummaryCard label="GST Collected" value={formatCurrency(summary.totalGst as number)} color="purple" />
                <SummaryCard label="Discounts Given" value={formatCurrency(summary.totalDiscount as number)} color="amber" />
              </div>
            )}

            {activeTab === "purchases" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <SummaryCard label="Total Purchases" value={formatCurrency(summary.totalAmount as number)} color="blue" />
                <SummaryCard label="Total Paid" value={formatCurrency(summary.totalPaid as number)} color="emerald" />
                <SummaryCard label="Pending" value={formatCurrency(summary.pending as number)} color="red" />
                <SummaryCard label="Purchase Count" value={(summary.count as number).toString()} color="purple" />
              </div>
            )}

            {activeTab === "profit" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <SummaryCard label="Revenue" value={formatCurrency(summary.revenue as number)} color="emerald" />
                <SummaryCard label="COGS" value={formatCurrency(summary.costOfGoodsSold as number)} color="blue" />
                <SummaryCard label="Gross Profit" value={formatCurrency(summary.grossProfit as number)} color={(summary.grossProfit as number) >= 0 ? "emerald" : "red"} />
                <SummaryCard label="Margin" value={`${summary.grossMargin}%`} color="purple" />
              </div>
            )}

            {activeTab === "expiry" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                <SummaryCard label="Expired" value={(summary.expired as number).toString()} color="red" />
                <SummaryCard label="Expired Value" value={formatCurrency(summary.expiredValue as number)} color="red" />
                <SummaryCard label="30 Days" value={(summary.within30 as number).toString()} color="amber" />
                <SummaryCard label="60 Days" value={(summary.within60 as number).toString()} color="blue" />
                <SummaryCard label="90 Days" value={(summary.within90 as number).toString()} color="emerald" />
              </div>
            )}

            {activeTab === "stock" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <SummaryCard label="Total Items" value={(summary.totalItems as number).toString()} color="blue" />
                <SummaryCard label="Stock Value" value={formatCurrency(summary.totalStockValue as number)} color="purple" />
                <SummaryCard label="Retail Value" value={formatCurrency(summary.totalRetailValue as number)} color="emerald" />
                <SummaryCard label="Low Stock" value={(summary.lowStockCount as number).toString()} color="red" />
              </div>
            )}

            {activeTab === "gst" ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <SummaryCard label="Total Taxable" value={formatCurrency(summary.totalTaxable as number)} color="blue" />
                <SummaryCard label="Total GST" value={formatCurrency(summary.totalGst as number)} color="emerald" />
              </div>
            ) : null}

            {/* Data Table */}
            {activeTab === "gst" && data.gstSummary ? (
              <Card>
                <CardHeader><h3 className="text-sm font-semibold">GST Breakdown by Rate</h3></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead><tr className="bg-slate-50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">GST Rate</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Taxable Amount</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">CGST</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">SGST</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Total GST</th>
                    </tr></thead>
                    <tbody>
                      {Object.entries(data.gstSummary as Record<string, { taxable: number; cgst: number; sgst: number; total: number }>).map(([rate, vals]) => (
                        <tr key={rate} className="border-b border-slate-50">
                          <td className="py-3 px-4 font-medium">{rate}%</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(vals.taxable)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(vals.cgst)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(vals.sgst)}</td>
                          <td className="py-3 px-4 text-right font-medium">{formatCurrency(vals.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {activeTab === "stock" ? (
              <Card>
                <CardHeader><h3 className="text-sm font-semibold">Stock Details</h3></CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead><tr className="bg-slate-50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Medicine</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Category</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Qty</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Stock Value</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Retail Value</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                    </tr></thead>
                    <tbody>
                      {((data.data || []) as Array<Record<string, unknown>>).map((m) => (
                        <tr key={m.id as string} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-slate-900">{m.name as string}</td>
                          <td className="py-3 px-4 text-slate-600">{m.category as string}</td>
                          <td className="py-3 px-4 text-right font-medium">{m.totalQty as number}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(m.stockValue as number)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(m.retailValue as number)}</td>
                          <td className="py-3 px-4">
                            <Badge variant={m.isLowStock ? "danger" : "success"}>
                              {m.isLowStock ? "Low Stock" : "OK"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : null}

            {activeTab === "expiry" ? (
              <Card>
                <CardHeader><h3 className="text-sm font-semibold">Expiring / Expired Medicines</h3></CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead><tr className="bg-slate-50 border-b">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Medicine</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Batch</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Qty</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Value</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Expiry</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                    </tr></thead>
                    <tbody>
                      {((data.data || []) as Array<Record<string, unknown>>).map((b) => {
                        const exp = new Date(b.expiryDate as string);
                        const isExpired = exp <= new Date();
                        const daysLeft = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={b.id as string} className="border-b border-slate-50">
                            <td className="py-3 px-4 font-medium">{(b.medicine as Record<string, unknown>)?.name as string}</td>
                            <td className="py-3 px-4 text-slate-600">{b.batchNumber as string}</td>
                            <td className="py-3 px-4 text-right">{b.quantity as number}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency((b.purchasePrice as number) * (b.quantity as number))}</td>
                            <td className="py-3 px-4">{formatDate(b.expiryDate as string)}</td>
                            <td className="py-3 px-4">
                              <Badge variant={isExpired ? "danger" : daysLeft <= 30 ? "warning" : "info"}>
                                {isExpired ? "Expired" : `${daysLeft}d left`}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : null}

            {(activeTab === "sales" || activeTab === "purchases") ? (
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold">
                    {activeTab === "sales" ? "Sales" : "Purchase"} Records
                  </h3>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Invoice</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500">
                          {activeTab === "sales" ? "Customer" : "Supplier"}
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-slate-500">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {((data.data || []) as Array<Record<string, unknown>>).map((r) => (
                        <tr key={r.id as string} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium">{r.invoiceNumber as string}</td>
                          <td className="py-3 px-4 text-slate-600">
                            {activeTab === "sales"
                              ? (r.customer as Record<string, unknown>)?.name as string || "Walk-in"
                              : (r.supplier as Record<string, unknown>)?.name as string}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">{formatCurrency(r.totalAmount as number)}</td>
                          <td className="py-3 px-4 text-slate-500 text-xs">{formatDate(r.createdAt as string)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}

        {!data && !loading && (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50 border border-slate-100 mb-4">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Generate a Report</h3>
            <p className="text-sm text-slate-500">Select a report type, set date range, and click Generate</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  const configs: Record<string, { gradient: string; shadow: string }> = {
    emerald: { gradient: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/20" },
    blue: { gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
    purple: { gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/20" },
    amber: { gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
    red: { gradient: "from-red-500 to-rose-600", shadow: "shadow-red-500/20" },
  };
  const cfg = configs[color] || configs.blue;
  return (
    <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${cfg.gradient} px-3.5 sm:px-5 py-3.5 sm:py-5 text-white shadow-lg ${cfg.shadow} card-hover`}>
      <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-white/10 -mr-3 sm:-mr-4 -mt-3 sm:-mt-4 blur-sm" />
      <p className="text-xs sm:text-sm font-medium text-white/80 truncate">{label}</p>
      <p className="text-lg sm:text-2xl font-extrabold mt-0.5 sm:mt-1 tracking-tight truncate">{value}</p>
    </div>
  );
}
