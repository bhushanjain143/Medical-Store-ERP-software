"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils";
import {
  Plus, Search, Truck, Edit, Trash2, Phone, Mail, MapPin, FileText,
  IndianRupee, Package, Users, CreditCard,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  drugLicense: string | null;
  balance: number;
  _count: { purchases: number };
}

const emptyForm = { name: "", phone: "", email: "", address: "", gstin: "", drugLicense: "" };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/suppliers?${params}`);
      setSuppliers(await res.json());
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/suppliers/${editingId}` : "/api/suppliers";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Supplier updated" : "Supplier added");
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchSuppliers();
    } catch {
      toast.error("Failed to save supplier");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    try {
      await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
      toast.success("Supplier deleted");
      fetchSuppliers();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (s: Supplier) => {
    setEditingId(s.id);
    setForm({ name: s.name, phone: s.phone || "", email: s.email || "", address: s.address || "", gstin: s.gstin || "", drugLicense: s.drugLicense || "" });
    setShowModal(true);
  };

  if (loading) return <PageLoading />;

  const totalPayable = suppliers.reduce((sum, s) => sum + s.balance, 0);
  const totalPurchases = suppliers.reduce((sum, s) => sum + s._count.purchases, 0);
  const withDues = suppliers.filter((s) => s.balance > 0);

  return (
    <div>
      <Header title="Suppliers" subtitle="Manage distributors and purchase partners" />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats Row */}
        <div className="stat-card-grid">
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <Users className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{suppliers.length}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Total Suppliers</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <Package className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{totalPurchases}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Total Purchases</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <IndianRupee className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold truncate">{formatCurrency(totalPayable)}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Total Payable</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <CreditCard className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{withDues.length}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Pending Dues</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, phone, or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm shadow-sm transition-all bg-[var(--bg-input)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] hover:border-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}>
            <Plus className="h-4 w-4" />
            Add Supplier
          </Button>
        </div>

        {/* Supplier Cards */}
        {suppliers.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No suppliers yet"
            description="Add distributors and suppliers to manage purchases."
            action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />Add Supplier</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {suppliers.map((s) => (
              <Card key={s.id} hover>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-sm shadow-blue-500/20">
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{s.name}</h3>
                        <p className="text-xs text-[var(--text-tertiary)]">{s._count.purchases} purchases</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--text-tertiary)]">
                    {s.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3 flex-shrink-0" />{s.phone}</div>}
                    {s.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3 flex-shrink-0" /><span className="truncate">{s.email}</span></div>}
                    {s.address && <div className="flex items-center gap-2"><MapPin className="h-3 w-3 flex-shrink-0" /><span className="truncate">{s.address}</span></div>}
                    {s.gstin && <div className="flex items-center gap-2"><FileText className="h-3 w-3 flex-shrink-0" />GSTIN: {s.gstin}</div>}
                    {s.drugLicense && <div className="flex items-center gap-2"><FileText className="h-3 w-3 flex-shrink-0" />DL: {s.drugLicense}</div>}
                  </div>
                  {s.balance > 0 ? (
                    <div className="mt-3 pt-3 border-t border-[var(--border-default)] flex items-center justify-between gap-2">
                      <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">Amount Payable</span>
                      <Badge variant="danger"><span className="truncate max-w-[100px] inline-block">{formatCurrency(s.balance)}</span></Badge>
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-[var(--border-default)] flex items-center justify-between gap-2">
                      <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">Payment Status</span>
                      <Badge variant="success" dot>Settled</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Supplier Modal */}
        <Modal open={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? "Edit Supplier" : "Add Supplier"} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="Supplier / Distributor Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., ABC Pharma Distributors" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="phone" label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g., 9876543210" />
              <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g., contact@abc.com" />
            </div>
            <Input id="address" label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g., 456 Trade Center, City" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="gstin" label="GSTIN" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="e.g., 29AABCU9603R1ZM" />
              <Input id="drugLicense" label="Drug License No." value={form.drugLicense} onChange={(e) => setForm({ ...form, drugLicense: e.target.value })} placeholder="e.g., DL-20B-12345" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editingId ? "Update" : "Add"} Supplier</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
