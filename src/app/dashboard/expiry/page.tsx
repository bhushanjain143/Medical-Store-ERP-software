"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertTriangle, Download, Shield, Clock, XCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface ExpiryBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: string;
  medicine: { id: string; name: string; category: string; manufacturer: string | null };
}

type FilterType = "all" | "expired" | "7days" | "30days" | "90days";

export default function ExpiryTrackerPage() {
  const [batches, setBatches] = useState<ExpiryBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("30days");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?type=expiry`);
      const data = await res.json();
      setBatches(data.data || []);
    } catch {
      toast.error("Failed to load expiry data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const now = new Date();
  const filteredBatches = batches.filter((b) => {
    const exp = new Date(b.expiryDate);
    const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    switch (filter) {
      case "expired": return daysLeft <= 0;
      case "7days": return daysLeft > 0 && daysLeft <= 7;
      case "30days": return daysLeft > 0 && daysLeft <= 30;
      case "90days": return daysLeft > 0 && daysLeft <= 90;
      default: return true;
    }
  });

  const expiredCount = batches.filter((b) => new Date(b.expiryDate) <= now).length;
  const within7 = batches.filter((b) => {
    const d = Math.ceil((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return d > 0 && d <= 7;
  }).length;
  const within30 = batches.filter((b) => {
    const d = Math.ceil((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return d > 0 && d <= 30;
  }).length;
  const within90 = batches.filter((b) => {
    const d = Math.ceil((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return d > 0 && d <= 90;
  }).length;

  const totalLossValue = batches
    .filter((b) => new Date(b.expiryDate) <= now)
    .reduce((s, b) => s + b.purchasePrice * b.quantity, 0);

  const exportCSV = () => {
    if (filteredBatches.length === 0) { toast.error("No data to export"); return; }
    let csv = "Medicine,Category,Manufacturer,Batch,Qty,Purchase Price,Value,Expiry Date,Days Left,Status\n";
    for (const b of filteredBatches) {
      const d = Math.ceil((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      csv += `"${b.medicine.name}","${b.medicine.category}","${b.medicine.manufacturer || ""}","${b.batchNumber}",${b.quantity},${b.purchasePrice},${b.purchasePrice * b.quantity},${formatDate(b.expiryDate)},${d},${d <= 0 ? "Expired" : "Expiring"}\n`;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expiry-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  if (loading) return <PageLoading />;

  const filters: { id: FilterType; label: string; count: number; color: string }[] = [
    { id: "expired", label: "Expired", count: expiredCount, color: "bg-red-500" },
    { id: "7days", label: "7 Days", count: within7, color: "bg-orange-500" },
    { id: "30days", label: "30 Days", count: within30, color: "bg-amber-500" },
    { id: "90days", label: "90 Days", count: within90, color: "bg-blue-500" },
    { id: "all", label: "All", count: batches.length, color: "bg-slate-500" },
  ];

  return (
    <div>
      <Header title="Expiry Tracker" subtitle="Monitor and manage medicine expiry dates" />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="stat-card-grid">
          {[
            { label: "Expired", value: expiredCount, sub: `Loss: ${formatCurrency(totalLossValue)}`, icon: XCircle, gradient: "from-red-500 to-rose-600" },
            { label: "Critical (7d)", value: within7, sub: "Needs immediate action", icon: Clock, gradient: "from-orange-500 to-amber-600" },
            { label: "Warning (30d)", value: within30, sub: "Expiring soon", icon: AlertTriangle, gradient: "from-amber-500 to-yellow-600" },
            { label: "Watchlist (90d)", value: within90, sub: "Monitor closely", icon: Shield, gradient: "from-emerald-500 to-green-600" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`rounded-xl sm:rounded-2xl bg-gradient-to-br ${card.gradient} px-3 py-3 sm:px-4 sm:py-4 text-white shadow-lg min-h-[100px] sm:min-h-[110px] flex flex-col overflow-hidden`}
              >
                <div className="flex items-center gap-2 mb-auto">
                  <div className="p-1.5 rounded-lg bg-white/20 flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-semibold text-white/80 leading-tight truncate flex-1">{card.label}</p>
                </div>
                <div className="mt-2 min-w-0">
                  <p className="text-2xl sm:text-3xl font-extrabold leading-none">{card.value}</p>
                  <p className="text-[9px] sm:text-[10px] text-white/60 font-medium mt-1.5 truncate">{card.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-sm font-semibold transition-all ${
                  filter === f.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-indigo-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${f.color}`} />
                {f.label}
                <span className="text-[10px] sm:text-xs opacity-70">({f.count})</span>
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} className="self-start sm:self-auto">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Batch Table */}
        {filteredBatches.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No batches found"
            description="No medicines match the selected expiry filter."
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="bg-[var(--table-header-bg)] border-b border-[var(--border-default)]">
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Medicine</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Batch</th>
                      <th className="text-right py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Value</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Expiry</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.map((b) => {
                      const daysLeft = Math.ceil((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      const isExpired = daysLeft <= 0;
                      return (
                        <tr key={b.id} className={`border-b border-[var(--border-subtle)] hover:bg-[var(--table-row-hover)] ${isExpired ? "bg-red-500/5" : ""}`}>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[var(--text-primary)]">{b.medicine.name}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)]">{b.medicine.manufacturer}</p>
                          </td>
                          <td className="py-3 px-4"><Badge>{b.medicine.category}</Badge></td>
                          <td className="py-3 px-4 text-[var(--text-secondary)] font-medium">{b.batchNumber}</td>
                          <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)]">{b.quantity}</td>
                          <td className="py-3 px-4 text-right text-[var(--text-secondary)]">{formatCurrency(b.purchasePrice * b.quantity)}</td>
                          <td className="py-3 px-4 text-[var(--text-secondary)]">{formatDate(b.expiryDate)}</td>
                          <td className="py-3 px-4">
                            <Badge variant={isExpired ? "danger" : daysLeft <= 7 ? "danger" : daysLeft <= 30 ? "warning" : "info"}>
                              {isExpired ? "EXPIRED" : `${daysLeft}d left`}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
