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
import { Plus, Search, Users, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  balance: number;
  _count: { sales: number };
}

const emptyForm = { name: "", phone: "", email: "", address: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
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
    });
    setShowModal(true);
  };

  if (loading) return <PageLoading />;

  const totalDues = customers.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div>
      <Header title="Customers" subtitle={`${customers.length} customers • Pending dues: ${formatCurrency(totalDues)}`} />
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
          </div>
          <Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}>
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add customers to track their purchases and pending dues."
            action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />Add Customer</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {customers.map((c) => (
              <Card key={c.id} hover>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-sm shadow-teal-500/20">
                        <span className="text-sm font-bold text-white">{c.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{c.name}</h3>
                        <p className="text-xs text-slate-500">{c._count.sales} purchases</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-500">
                    {c.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{c.phone}</div>}
                    {c.email && <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{c.email}</div>}
                    {c.address && <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{c.address}</div>}
                  </div>
                  {c.balance > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Pending Dues</span>
                      <Badge variant="danger">{formatCurrency(c.balance)}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={showModal}
          onClose={() => { setShowModal(false); setEditingId(null); }}
          title={editingId ? "Edit Customer" : "Add Customer"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Ramesh Kumar" required />
            <Input id="phone" label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g., 9876543210" />
            <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g., ramesh@email.com" />
            <Input id="address" label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g., 123 Main Street, City" />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editingId ? "Update" : "Add"} Customer</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
