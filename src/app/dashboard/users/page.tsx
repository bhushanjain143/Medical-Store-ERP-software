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
import { Plus, Shield, Edit, Trash2, User } from "lucide-react";
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
      if (res.status === 403) {
        toast.error("Admin access required");
        return;
      }
      setUsers(await res.json());
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/users/${editingId}` : "/api/users";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
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
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
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

  const roleColors: Record<string, "info" | "success" | "default"> = {
    admin: "info",
    manager: "success",
    salesperson: "default",
  };

  return (
    <div>
      <Header title="User Management" subtitle="Manage staff accounts and roles" />
      <div className="p-4 sm:p-6">
        <div className="flex justify-end mb-4 sm:mb-6">
          <Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowModal(true); }}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {users.length === 0 ? (
          <EmptyState icon={Shield} title="No users found" description="You may not have admin access." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {users.map((u) => (
              <Card key={u.id} hover className={!u.active ? "opacity-60" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-sm shadow-violet-500/20">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{u.name}</h3>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={roleColors[u.role] || "default"}>{u.role}</Badge>
                    <Badge variant={u.active ? "success" : "danger"}>{u.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{u._count.sales} sales</span>
                    <span>Since {formatDate(u.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={showModal}
          onClose={() => { setShowModal(false); setEditingId(null); }}
          title={editingId ? "Edit User" : "Add User"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input id="email" label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input
              id="password"
              label={editingId ? "New Password (leave blank to keep)" : "Password *"}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editingId}
            />
            <Select
              id="role"
              label="Role"
              options={[
                { value: "admin", label: "Admin" },
                { value: "manager", label: "Manager" },
                { value: "salesperson", label: "Salesperson" },
              ]}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>{editingId ? "Update" : "Create"} User</Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
