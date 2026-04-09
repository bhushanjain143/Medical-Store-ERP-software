"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus, Package, Trash2, Search, Eye, IndianRupee, Truck, Clock, CheckCircle,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface PurchaseItem {
  medicineId: string;
  batchNumber: string;
  quantity: string;
  purchasePrice: string;
  sellingPrice: string;
  mrp: string;
  mfgDate: string;
  expiryDate: string;
}

interface Supplier { id: string; name: string; }
interface Medicine { id: string; name: string; }

interface Purchase {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  subtotal: number;
  gstAmount: number;
  paymentStatus: string;
  paidAmount: number;
  notes: string | null;
  createdAt: string;
  purchaseDate: string;
  supplier: { name: string };
  items: Array<{
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    gstRate: number;
    gstAmount: number;
    medicine: { name: string };
    batch: { batchNumber: string };
  }>;
}

const emptyItem: PurchaseItem = {
  medicineId: "", batchNumber: "", quantity: "", purchasePrice: "",
  sellingPrice: "", mrp: "", mfgDate: "", expiryDate: "",
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ supplierId: "", invoiceNumber: "", paidAmount: "0", notes: "" });
  const [items, setItems] = useState<PurchaseItem[]>([{ ...emptyItem }]);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const [pRes, sRes, mRes] = await Promise.all([
        fetch(`/api/purchases?${params}`),
        fetch("/api/suppliers"),
        fetch("/api/medicines"),
      ]);
      setPurchases(await pRes.json());
      setSuppliers(await sRes.json());
      const mData = await mRes.json();
      setMedicines(Array.isArray(mData) ? mData : []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };
  const updateItem = (index: number, field: string, value: string) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.supplierId || !form.invoiceNumber) { toast.error("Supplier and invoice number required"); return; }
    if (items.some((i) => !i.medicineId || !i.batchNumber || !i.quantity || !i.purchasePrice || !i.sellingPrice || !i.mrp || !i.expiryDate)) {
      toast.error("Please fill all required fields in items"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/purchases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, items }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      toast.success("Purchase recorded successfully");
      setShowModal(false);
      setForm({ supplierId: "", invoiceNumber: "", paidAmount: "0", notes: "" });
      setItems([{ ...emptyItem }]);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoading />;

  const totalAmount = purchases.reduce((s, p) => s + p.totalAmount, 0);
  const totalPaid = purchases.reduce((s, p) => s + p.paidAmount, 0);
  const pendingCount = purchases.filter((p) => p.paymentStatus === "pending").length;

  return (
    <div>
      <Header title="Purchases" subtitle="Manage purchase entries from suppliers" />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats Row */}
        <div className="stat-card-grid">
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <Package className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{purchases.length}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Total Purchases</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <IndianRupee className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold truncate">{formatCurrency(totalAmount)}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Total Value</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <CheckCircle className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold truncate">{formatCurrency(totalPaid)}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Total Paid</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <Clock className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{pendingCount}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Pending Payments</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by invoice or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm shadow-sm transition-all bg-[var(--bg-input)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] hover:border-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            New Purchase
          </Button>
        </div>

        {/* Purchase List */}
        {purchases.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No purchases yet"
            description="Record your first purchase from a supplier."
            action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />New Purchase</Button>}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[750px]">
                  <thead>
                    <tr className="bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Invoice</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Supplier</th>
                      <th className="text-right py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Amount</th>
                      <th className="text-right py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Paid</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Items</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Date</th>
                      <th className="text-center py-3 px-4 font-semibold text-[var(--text-tertiary)] text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={p.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-muted)] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Package className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <span className="font-semibold text-[var(--text-primary)]">{p.invoiceNumber}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{p.supplier.name}</td>
                        <td className="py-3 px-4 text-right font-semibold text-[var(--text-primary)]">{formatCurrency(p.totalAmount)}</td>
                        <td className="py-3 px-4 text-right text-[var(--text-secondary)]">{formatCurrency(p.paidAmount)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={p.paymentStatus === "paid" ? "success" : p.paymentStatus === "partial" ? "warning" : "danger"} dot>
                            {p.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{p.items.length} items</td>
                        <td className="py-3 px-4 text-[var(--text-tertiary)] text-xs">{formatDate(p.createdAt)}</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => setViewingPurchase(p)} className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Detail Modal */}
        <Modal open={!!viewingPurchase} onClose={() => setViewingPurchase(null)} title={`Purchase: ${viewingPurchase?.invoiceNumber || ""}`} size="lg">
          {viewingPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[var(--bg-muted)] p-4 rounded-xl">
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Supplier</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{viewingPurchase.supplier.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Date</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{formatDate(viewingPurchase.purchaseDate)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Status</p>
                  <Badge variant={viewingPurchase.paymentStatus === "paid" ? "success" : "warning"} dot>
                    {viewingPurchase.paymentStatus}
                  </Badge>
                </div>
              </div>
              <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-indigo-500/10 border-b border-indigo-500/20">
                    <th className="text-left py-2.5 px-3 font-semibold text-indigo-500 text-xs">#</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-indigo-500 text-xs">Medicine</th>
                    <th className="text-left py-2.5 px-3 font-semibold text-indigo-500 text-xs">Batch</th>
                    <th className="text-center py-2.5 px-3 font-semibold text-indigo-500 text-xs">Qty</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-indigo-500 text-xs">Rate</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-indigo-500 text-xs">GST</th>
                    <th className="text-right py-2.5 px-3 font-semibold text-indigo-500 text-xs">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingPurchase.items.map((item, i) => (
                    <tr key={i} className="border-b border-[var(--border-subtle)]">
                      <td className="py-2 px-3 text-[var(--text-tertiary)]">{i + 1}</td>
                      <td className="py-2 px-3 font-medium text-[var(--text-primary)]">{item.medicine.name}</td>
                      <td className="py-2 px-3 text-[var(--text-secondary)]">{item.batch.batchNumber}</td>
                      <td className="py-2 px-3 text-center text-[var(--text-primary)]">{item.quantity}</td>
                      <td className="py-2 px-3 text-right text-[var(--text-secondary)]">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 px-3 text-right text-[var(--text-tertiary)]">{item.gstRate}%</td>
                      <td className="py-2 px-3 text-right font-semibold text-[var(--text-primary)]">{formatCurrency(item.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <div className="bg-[var(--bg-muted)] rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Subtotal</span><span className="text-[var(--text-primary)]">{formatCurrency(viewingPurchase.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">GST</span><span className="text-[var(--text-primary)]">{formatCurrency(viewingPurchase.gstAmount)}</span></div>
                <div className="flex justify-between text-lg font-extrabold pt-2 border-t border-[var(--border-default)]">
                  <span className="text-[var(--text-primary)]">Total</span><span className="text-indigo-500">{formatCurrency(viewingPurchase.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-tertiary)] pt-1">
                  <span>Paid: {formatCurrency(viewingPurchase.paidAmount)}</span>
                  <span>Due: {formatCurrency(viewingPurchase.totalAmount - viewingPurchase.paidAmount)}</span>
                </div>
              </div>
              {viewingPurchase.notes && <p className="text-xs text-[var(--text-tertiary)] italic">Note: {viewingPurchase.notes}</p>}
            </div>
          )}
        </Modal>

        {/* New Purchase Modal */}
        <Modal open={showModal} onClose={() => { setShowModal(false); setForm({ supplierId: "", invoiceNumber: "", paidAmount: "0", notes: "" }); setItems([{ ...emptyItem }]); }} title="New Purchase Entry" subtitle="Record a new purchase from supplier" size="xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select id="supplierId" label="Supplier *" options={[{ value: "", label: "-- Select Supplier --" }, ...suppliers.map((s) => ({ value: s.id, label: s.name }))]} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} />
              <Input id="invoiceNumber" label="Invoice No. *" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="e.g., SUP-INV-001" />
              <Input id="paidAmount" label="Amount Paid (₹)" type="number" min="0" step="0.01" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} />
            </div>

            {suppliers.length === 0 && (
              <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  No suppliers found. Please add a supplier first from the Suppliers page.
                </p>
              </div>
            )}

            {medicines.length === 0 && (
              <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  No medicines found. Please add medicines first from the Medicines page.
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-[var(--text-primary)]">Purchase Items</label>
                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-3 w-3" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {items.map((item, index) => (
                  <div key={index} className="rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)] p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[var(--text-tertiary)]">Item #{index + 1}</span>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <Select id={`medicine-${index}`} label="Medicine *" options={[{ value: "", label: "-- Select --" }, ...medicines.map((m) => ({ value: m.id, label: m.name }))]} value={item.medicineId} onChange={(e) => updateItem(index, "medicineId", e.target.value)} />
                      <Input id={`batch-${index}`} label="Batch No. *" placeholder="BT-2026-001" value={item.batchNumber} onChange={(e) => updateItem(index, "batchNumber", e.target.value)} />
                      <Input id={`qty-${index}`} label="Quantity *" type="number" placeholder="100" min="1" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} />
                      <Input id={`pp-${index}`} label="Purchase ₹ *" type="number" placeholder="5.50" step="0.01" min="0" value={item.purchasePrice} onChange={(e) => updateItem(index, "purchasePrice", e.target.value)} />
                      <Input id={`sp-${index}`} label="Selling ₹ *" type="number" placeholder="8.00" step="0.01" min="0" value={item.sellingPrice} onChange={(e) => updateItem(index, "sellingPrice", e.target.value)} />
                      <Input id={`mrp-${index}`} label="MRP ₹ *" type="number" placeholder="10.00" step="0.01" min="0" value={item.mrp} onChange={(e) => updateItem(index, "mrp", e.target.value)} />
                      <Input id={`exp-${index}`} label="Expiry Date *" type="date" value={item.expiryDate} onChange={(e) => updateItem(index, "expiryDate", e.target.value)} />
                      <Input id={`mfg-${index}`} label="Mfg Date" type="date" value={item.mfgDate} onChange={(e) => updateItem(index, "mfgDate", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Input id="notes" label="Notes (optional)" placeholder="Notes about this purchase..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setForm({ supplierId: "", invoiceNumber: "", paidAmount: "0", notes: "" }); setItems([{ ...emptyItem }]); }}>Cancel</Button>
              <Button type="submit" loading={saving} disabled={saving || !form.supplierId || !form.invoiceNumber || suppliers.length === 0 || medicines.length === 0}>
                <Package className="h-4 w-4" />
                Save Purchase
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
