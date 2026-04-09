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
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Shield,
  Edit,
  Trash2,
  User,
  Users,
  ShieldCheck,
  UserCog,
  Stethoscope,
  Wallet,
  Warehouse,
  ShoppingBag,
  Calculator,
  Bike,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  _count: { sales: number };
}

const ROLES = [
  { value: "admin", label: "Admin", icon: ShieldCheck, color: "from-red-400 to-rose-500", badge: "danger" as const, desc: "Full system access" },
  { value: "manager", label: "Store Manager", icon: UserCog, color: "from-violet-400 to-purple-500", badge: "info" as const, desc: "Store operations" },
  { value: "pharmacist", label: "Pharmacist", icon: Stethoscope, color: "from-teal-400 to-emerald-500", badge: "success" as const, desc: "Dispensing & prescriptions" },
  { value: "cashier", label: "Cashier", icon: Wallet, color: "from-amber-400 to-orange-500", badge: "warning" as const, desc: "Billing & payments" },
  { value: "purchase_manager", label: "Purchase Manager", icon: Warehouse, color: "from-blue-400 to-indigo-500", badge: "info" as const, desc: "Purchase & suppliers" },
  { value: "salesperson", label: "Salesperson", icon: ShoppingBag, color: "from-cyan-400 to-blue-500", badge: "primary" as const, desc: "Counter sales" },
  { value: "accountant", label: "Accountant", icon: Calculator, color: "from-emerald-400 to-green-500", badge: "success" as const, desc: "Finance & reports" },
  { value: "delivery", label: "Delivery Boy", icon: Bike, color: "from-pink-400 to-rose-500", badge: "warning" as const, desc: "Delivery orders" },
];

const emptyForm = { name: "", email: "", password: "", role: "salesperson" };

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.status === 403) { toast.error("Admin access required"); return; }
      setUsers(await res.json());
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      toast.success(editingId ? "User updated" : "User created");
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error); }
      toast.success("User deactivated");
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  };

  const openEdit = (u: UserData) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setShowModal(true);
  };

  if (loading) return <PageLoading />;

  const activeCount = users.filter((u) => u.active).length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const getRoleConfig = (role: string) => ROLES.find((r) => r.value === role) || ROLES[5];

  return (
    <div>
      <Header title="User Management" subtitle="Manage staff accounts, roles & permissions" />
      <div className="p-4 sm:p-6 space-y-6">
        {/* Stats Row */}
        <div className="stat-card-grid">
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <Users className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{users.length}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Total Users</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <ShieldCheck className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{activeCount}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Active</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <Shield className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{adminCount}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Admins</p>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 px-4 py-3.5 sm:px-5 sm:py-4 text-white shadow-lg min-h-[88px]">
            <User className="h-4 w-4 text-white/40 mb-1.5" />
            <p className="text-xl sm:text-2xl font-extrabold">{users.length - activeCount}</p>
            <p className="text-[10px] sm:text-xs text-white/80">Inactive</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {users.length === 0 ? (
          <EmptyState icon={Shield} title="No users found" description="You may not have admin access." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {users.map((u) => {
              const role = getRoleConfig(u.role);
              const RoleIcon = role.icon;
              return (
                <Card key={u.id} hover className={!u.active ? "opacity-50 grayscale" : ""}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-sm`}>
                          <RoleIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{u.name}</h3>
                          <p className="text-xs text-[var(--text-tertiary)]">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={role.badge}>{role.label}</Badge>
                      <Badge variant={u.active ? "success" : "danger"} dot>{u.active ? "Active" : "Inactive"}</Badge>
                    </div>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{role.desc}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-3 border-t border-[var(--border-default)]">
                      <span className="font-medium">{u._count.sales} sales</span>
                      <span>Since {formatDate(u.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Modal open={showModal} onClose={() => { setShowModal(false); setEditingId(null); }} title={editingId ? "Edit User" : "Add User"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Ramesh Pharmacist" required />
            <Input id="email" label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g., ramesh@medstore.com" required />
            <Input
              id="password"
              label={editingId ? "New Password (leave blank to keep)" : "Password *"}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Minimum 6 characters"
              required={!editingId}
            />
            <Select
              id="role"
              label="Role & Permissions"
              options={ROLES.map((r) => ({ value: r.value, label: `${r.label} — ${r.desc}` }))}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            {/* Role description */}
            <div className="p-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">{getRoleConfig(form.role).label}:</strong>{" "}
                {form.role === "admin" && "Full access to all modules, settings, and user management."}
                {form.role === "manager" && "Manage inventory, view reports, handle purchases and sales."}
                {form.role === "pharmacist" && "Dispense medicines, manage prescriptions, check interactions."}
                {form.role === "cashier" && "Process billing, handle payments, generate invoices."}
                {form.role === "purchase_manager" && "Create purchase orders, manage suppliers and stock intake."}
                {form.role === "salesperson" && "Counter sales, search medicines, basic billing operations."}
                {form.role === "accountant" && "View all reports, manage finances, GST filings."}
                {form.role === "delivery" && "View delivery orders, update delivery status."}
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editingId ? "Update" : "Create"} User</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
