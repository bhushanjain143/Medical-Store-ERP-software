"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils";
import {
  Plus, Search, Users, Edit, Trash2, Phone, Mail, MapPin,
  IndianRupee, CreditCard, ShoppingCart, UserPlus,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  gender: string | null;
  loyaltyPoints: number;
  creditLimit: number;
  balance: number;
  _count: { sales: number };
}

const emptyForm = {
  name: "", phone: "", email: "", address: "", gstin: "", gender: "", creditLimit: "0",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "due" | "credit">("all");

  const fetchCustomers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/customers?${params}`);
      setCustomers(await res.json());
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Customer updated" : "Customer added");
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchCustomers();
    } catch {
      toast.error("Failed to save customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    try {
      await fetch(`/api/customers/${id}`, { method: "DELETE" });
      toast.success("Customer deleted");
      fetchCustomers();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (c: Customer) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      gstin: c.gstin || "",
      gender: c.gender || "",
      creditLimit: (c.creditLimit || 0).toString(),
    });
    setShowModal(true);
  };

  if (loading) return <PageLoading />;

  const totalDues = customers.reduce((sum, c) => sum + c.balance, 0);
  const dueCustomers = customers.filter((c) => c.balance > 0);
  const totalLoyalty = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);

  const filtered = filter === "all" ? customers
    : filter === "due" ? customers.filter((c) => c.balance > 0)
    : customers.filter((c) => (c.creditLimit || 0) > 0);

  return (
    <div>
      <Header title="Customers" subtitle={`${customers.length} customers registered`} />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats Row */}
        <div className="stat-card-grid">
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <Users className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{customers.length}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Total Customers</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <IndianRupee className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold truncate">{formatCurrency(totalDues)}</p>
            <p className="text-[10px] sm:text-xs text-white/80 truncate">Dues ({dueCustomers.length})</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <CreditCard className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{customers.filter((c) => (c.creditLimit || 0) > 0).length}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Credit Accounts</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <ShoppingCart className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold truncate">{totalLoyalty}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Loyalty Points</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm shadow-sm transition-all bg-[var(--bg-input)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] hover:border-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "due", "credit"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === f ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md" : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-indigo-300/50"
                }`}
              >
                {f === "all" ? "All" : f === "due" ? "With Dues" : "Credit"}
              </button>
            ))}
            <Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}>
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Customer</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Customer Cards */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description="Add customers to track their purchases and pending dues."
            action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />Add Customer</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filtered.map((c) => (
              <Card key={c.id} hover>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm shadow-indigo-500/20">
                        <span className="text-sm font-bold text-white">{c.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{c.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-[var(--text-tertiary)]">{c._count.sales} purchases</span>
                          {c.gender && <Badge size="sm">{c.gender}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-[var(--text-tertiary)]">
                    {c.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3 flex-shrink-0" />{c.phone}</div>}
                    {c.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3 flex-shrink-0" /><span className="truncate">{c.email}</span></div>}
                    {c.address && <div className="flex items-center gap-2"><MapPin className="h-3 w-3 flex-shrink-0" /><span className="truncate">{c.address}</span></div>}
                    {c.gstin && <div className="flex items-center gap-2"><CreditCard className="h-3 w-3 flex-shrink-0" />GSTIN: {c.gstin}</div>}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--border-default)] grid grid-cols-3 gap-1 text-center">
                    <div className="min-w-0">
                      <p className="text-[10px] text-[var(--text-tertiary)]">Balance</p>
                      <p className={`text-[11px] sm:text-xs font-bold truncate ${c.balance > 0 ? "text-red-500" : "text-emerald-500"}`}>
                        {c.balance > 0 ? formatCurrency(c.balance) : "₹0"}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[var(--text-tertiary)]">Credit</p>
                      <p className="text-[11px] sm:text-xs font-bold text-[var(--text-primary)] truncate">{formatCurrency(c.creditLimit || 0)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[var(--text-tertiary)]">Points</p>
                      <p className="text-[11px] sm:text-xs font-bold text-amber-600">{c.loyaltyPoints || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Customer Modal */}
        <Modal open={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? "Edit Customer" : "Add Customer"} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="name" label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Ramesh Kumar" required />
              <Input id="phone" label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g., 9876543210" />
              <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g., ramesh@email.com" />
              <Select
                id="gender"
                label="Gender"
                options={[{ value: "", label: "Select" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" }]}
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              />
            </div>
            <Input id="address" label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g., 123 Main Street, City" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="gstin" label="GSTIN (for B2B)" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} placeholder="e.g., 29AABCU9603R1ZM" />
              <Input id="creditLimit" label="Credit Limit (₹)" type="number" min="0" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} placeholder="0" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editingId ? "Update" : "Add"} Customer</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
