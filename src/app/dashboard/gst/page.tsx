"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils";
import { Calculator, Download, FileText, IndianRupee } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface GstData {
  summary: { totalTaxable: number; totalGst: number };
  gstSummary: Record<string, { taxable: number; cgst: number; sgst: number; total: number }>;
  hsnSummary: Record<string, { hsnCode: string; taxable: number; cgst: number; sgst: number; total: number; quantity: number }>;
  salesRegister: Array<{
    invoiceNumber: string;
    date: string;
    customerName: string;
    taxable: number;
    cgst: number;
    sgst: number;
    total: number;
    invoiceTotal: number;
  }>;
  purchaseRegister: Array<{
    invoiceNumber: string;
    date: string;
    supplierName: string;
    gstin: string;
    taxable: number;
    cgst: number;
    sgst: number;
    total: number;
    invoiceTotal: number;
  }>;
}

type TabType = "summary" | "sales_register" | "purchase_register" | "hsn";

export default function GSTReportsPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<GstData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabType>("summary");

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: "gst_detailed" });
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      const res = await fetch(`/api/reports?${params}`);
      const result = await res.json();
      setData(result);
    } catch {
      toast.error("Failed to generate GST report");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    let csv = "";
    if (tab === "summary" && data.gstSummary) {
      csv = "GST Rate,Taxable Amount,CGST,SGST,Total GST\n";
      for (const [rate, vals] of Object.entries(data.gstSummary)) {
        csv += `${rate}%,${vals.taxable.toFixed(2)},${vals.cgst.toFixed(2)},${vals.sgst.toFixed(2)},${vals.total.toFixed(2)}\n`;
      }
    } else if (tab === "sales_register" && data.salesRegister) {
      csv = "Invoice,Date,Customer,Taxable,CGST,SGST,Total GST,Invoice Total\n";
      for (const r of data.salesRegister) {
        csv += `${r.invoiceNumber},${r.date},"${r.customerName}",${r.taxable.toFixed(2)},${r.cgst.toFixed(2)},${r.sgst.toFixed(2)},${r.total.toFixed(2)},${r.invoiceTotal.toFixed(2)}\n`;
      }
    } else if (tab === "purchase_register" && data.purchaseRegister) {
      csv = "Invoice,Date,Supplier,GSTIN,Taxable,CGST,SGST,Total GST,Invoice Total\n";
      for (const r of data.purchaseRegister) {
        csv += `${r.invoiceNumber},${r.date},"${r.supplierName}","${r.gstin}",${r.taxable.toFixed(2)},${r.cgst.toFixed(2)},${r.sgst.toFixed(2)},${r.total.toFixed(2)},${r.invoiceTotal.toFixed(2)}\n`;
      }
    }
    if (!csv) { toast.error("No data to export"); return; }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gst-${tab}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "summary", label: "GST Summary" },
    { id: "sales_register", label: "Sales Register" },
    { id: "purchase_register", label: "Purchase Register" },
    { id: "hsn", label: "HSN Summary" },
  ];

  return (
    <div>
      <Header title="GST Reports" subtitle="CGST, SGST, HSN wise tax reports" />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Date Filter */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Input id="from" label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <Input id="to" label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              <div className="flex items-end">
                <Button onClick={fetchReport} loading={loading} className="w-full sm:w-auto">
                  <Calculator className="h-4 w-4" />
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

        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-3 sm:p-4 text-white shadow-lg overflow-hidden">
                <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 text-white/50 mb-1" />
                <p className="text-[11px] sm:text-xs text-white/80">Total Taxable</p>
                <p className="text-lg sm:text-xl font-extrabold truncate">{formatCurrency(data.summary.totalTaxable)}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-3 sm:p-4 text-white shadow-lg overflow-hidden">
                <p className="text-[11px] sm:text-xs text-white/80">CGST</p>
                <p className="text-lg sm:text-xl font-extrabold truncate">{formatCurrency(data.summary.totalGst / 2)}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-3 sm:p-4 text-white shadow-lg overflow-hidden">
                <p className="text-[11px] sm:text-xs text-white/80">SGST</p>
                <p className="text-lg sm:text-xl font-extrabold truncate">{formatCurrency(data.summary.totalGst / 2)}</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-3 sm:p-4 text-white shadow-lg overflow-hidden">
                <p className="text-[11px] sm:text-xs text-white/80">Total GST</p>
                <p className="text-lg sm:text-xl font-extrabold truncate">{formatCurrency(data.summary.totalGst)}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    tab === t.id
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* GST Rate Summary */}
            {tab === "summary" && data.gstSummary && (
              <Card>
                <CardHeader><h3 className="text-sm font-bold text-slate-900">GST Rate Wise Summary</h3></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs">GST Rate</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">Taxable Amount</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">CGST</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">SGST</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">Total GST</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(data.gstSummary).map(([rate, vals]) => (
                          <tr key={rate} className="border-b border-slate-50">
                            <td className="py-3 px-4 font-semibold">{rate}%</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(vals.taxable)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(vals.cgst)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(vals.sgst)}</td>
                            <td className="py-3 px-4 text-right font-semibold">{formatCurrency(vals.total)}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold">
                          <td className="py-3 px-4">Total</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(data.summary.totalTaxable)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(data.summary.totalGst / 2)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(data.summary.totalGst / 2)}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(data.summary.totalGst)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sales Register */}
            {tab === "sales_register" && data.salesRegister && (
              <Card>
                <CardHeader><h3 className="text-sm font-bold text-slate-900">GST Sales Register</h3></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs">Invoice</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs">Customer</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">Taxable</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">CGST</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">SGST</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">Invoice Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.salesRegister.map((r, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-medium">{r.invoiceNumber}</td>
                            <td className="py-3 px-4 text-slate-600 text-xs">{r.date}</td>
                            <td className="py-3 px-4 text-slate-600">{r.customerName}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(r.taxable)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(r.cgst)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(r.sgst)}</td>
                            <td className="py-3 px-4 text-right font-semibold">{formatCurrency(r.invoiceTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Purchase Register */}
            {tab === "purchase_register" && data.purchaseRegister && (
              <Card>
                <CardHeader><h3 className="text-sm font-bold text-slate-900">GST Purchase Register</h3></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs">Invoice</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs">Supplier</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs">GSTIN</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">Taxable</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">CGST</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">SGST</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.purchaseRegister.map((r, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-medium">{r.invoiceNumber}</td>
                            <td className="py-3 px-4 text-slate-600 text-xs">{r.date}</td>
                            <td className="py-3 px-4 text-slate-600">{r.supplierName}</td>
                            <td className="py-3 px-4 text-slate-500 text-xs">{r.gstin || "-"}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(r.taxable)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(r.cgst)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(r.sgst)}</td>
                            <td className="py-3 px-4 text-right font-semibold">{formatCurrency(r.invoiceTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* HSN Summary */}
            {tab === "hsn" && data.hsnSummary && (
              <Card>
                <CardHeader><h3 className="text-sm font-bold text-slate-900">HSN Wise Summary</h3></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="text-left py-3 px-4 font-semibold text-slate-500 text-xs">HSN Code</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">Quantity</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">Taxable</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">CGST</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">SGST</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-500 text-xs">Total Tax</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(data.hsnSummary).map(([hsn, vals]) => (
                          <tr key={hsn} className="border-b border-slate-50">
                            <td className="py-3 px-4 font-medium">{hsn || "N/A"}</td>
                            <td className="py-3 px-4 text-right">{vals.quantity}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(vals.taxable)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(vals.cgst)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(vals.sgst)}</td>
                            <td className="py-3 px-4 text-right font-semibold">{formatCurrency(vals.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!data && !loading && (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50 border border-slate-100 mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">GST Tax Reports</h3>
            <p className="text-sm text-slate-500">Select date range and generate to view CGST/SGST/HSN breakdown</p>
          </div>
        )}
      </div>
    </div>
  );
}
