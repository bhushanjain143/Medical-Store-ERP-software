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
import { Plus, Package, Trash2, Search } from "lucide-react";
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

interface Supplier {
  id: string;
  name: string;
}

interface Medicine {
  id: string;
  name: string;
}

interface Purchase {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  subtotal: number;
  gstAmount: number;
  paymentStatus: string;
  paidAmount: number;
  createdAt: string;
  supplier: { name: string };
  items: Array<{
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    medicine: { name: string };
    batch: { batchNumber: string };
  }>;
}

const emptyItem: PurchaseItem = {
  medicineId: "",
  batchNumber: "",
  quantity: "",
  purchasePrice: "",
  sellingPrice: "",
  mrp: "",
  mfgDate: "",
  expiryDate: "",
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    supplierId: "",
    invoiceNumber: "",
    paidAmount: "0",
    notes: "",
  });
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    if (!form.supplierId || !form.invoiceNumber) {
      toast.error("Supplier and invoice number are required");
      return;
    }
    if (items.some((i) => !i.medicineId || !i.batchNumber || !i.quantity || !i.purchasePrice || !i.sellingPrice || !i.mrp || !i.expiryDate)) {
      toast.error("Please fill all required fields in items");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
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

  return (
    <div>
      <Header title="Purchases" subtitle="Manage purchase entries from suppliers" />
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by invoice or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            New Purchase
          </Button>
        </div>

        {purchases.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No purchases yet"
            description="Record your first purchase from a supplier to track inventory."
            action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />New Purchase</Button>}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs">Invoice</th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs">Supplier</th>
                      <th className="text-right py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs">Amount</th>
                      <th className="text-right py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs">Paid</th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs">Status</th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs">Items</th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-medium text-slate-900">{p.invoiceNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{p.supplier.name}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(p.totalAmount)}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(p.paidAmount)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={p.paymentStatus === "paid" ? "success" : p.paymentStatus === "partial" ? "warning" : "danger"}>
                            {p.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{p.items.length} items</td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Modal open={showModal} onClose={() => setShowModal(false)} title="New Purchase Entry" size="xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                id="supplierId"
                label="Supplier *"
                options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                value={form.supplierId}
                onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                placeholder="Select supplier"
              />
              <Input
                id="invoiceNumber"
                label="Supplier Invoice No. *"
                value={form.invoiceNumber}
                onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                placeholder="e.g., INV-001"
                required
              />
              <Input
                id="paidAmount"
                label="Amount Paid (₹)"
                type="number"
                min="0"
                step="0.01"
                value={form.paidAmount}
                onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Purchase Items</label>
                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-3 w-3" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {items.map((item, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="py-3 px-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Select
                          options={medicines.map((m) => ({ value: m.id, label: m.name }))}
                          value={item.medicineId}
                          onChange={(e) => updateItem(index, "medicineId", e.target.value)}
                          placeholder="Medicine *"
                        />
                        <Input
                          placeholder="Batch No. *"
                          value={item.batchNumber}
                          onChange={(e) => updateItem(index, "batchNumber", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Qty *"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Purchase Price *"
                          step="0.01"
                          min="0"
                          value={item.purchasePrice}
                          onChange={(e) => updateItem(index, "purchasePrice", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Selling Price *"
                          step="0.01"
                          min="0"
                          value={item.sellingPrice}
                          onChange={(e) => updateItem(index, "sellingPrice", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="MRP *"
                          step="0.01"
                          min="0"
                          value={item.mrp}
                          onChange={(e) => updateItem(index, "mrp", e.target.value)}
                        />
                        <Input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateItem(index, "expiryDate", e.target.value)}
                        />
                        <div className="flex items-center">
                          {items.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Input
              id="notes"
              label="Notes"
              placeholder="Optional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Save Purchase</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
