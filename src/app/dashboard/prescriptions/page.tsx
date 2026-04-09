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
import { formatDateTime } from "@/lib/utils";
import { Plus, Search, FileText, Eye, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string | null;
  doctorPhone: string | null;
  diagnosis: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  customer: { id: string; name: string } | null;
  sale: { invoiceNumber: string } | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

const emptyForm = {
  patientName: "",
  doctorName: "",
  doctorPhone: "",
  diagnosis: "",
  notes: "",
  prescriptionImageUrl: "",
  customerId: "",
  status: "pending",
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewingRx, setViewingRx] = useState<Prescription | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const [rxRes, custRes] = await Promise.all([
        fetch(`/api/prescriptions?${params}`),
        fetch("/api/customers"),
      ]);
      const rxData = await rxRes.json();
      const custData = await custRes.json();
      setPrescriptions(Array.isArray(rxData) ? rxData : []);
      setCustomers(Array.isArray(custData) ? custData : []);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName) { toast.error("Patient name required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Prescription added");
      setShowModal(false);
      setForm(emptyForm);
      fetchData();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/prescriptions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Prescription ${status}`);
      fetchData();
    } catch {
      toast.error("Failed to update");
    }
  };

  if (loading) return <PageLoading />;

  const pendingCount = prescriptions.filter((p) => p.status === "pending").length;
  const dispensedCount = prescriptions.filter((p) => p.status === "dispensed").length;

  return (
    <div>
      <Header title="Prescriptions" subtitle={`${prescriptions.length} total • ${pendingCount} pending • ${dispensedCount} dispensed`} />
      <div className="p-4 sm:p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by patient or doctor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm shadow-sm transition-all bg-[var(--bg-input)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] hover:border-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <Select
            options={[
              { value: "", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "dispensed", label: "Dispensed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40"
          />
          <Button onClick={() => { setForm(emptyForm); setShowModal(true); }}>
            <Plus className="h-4 w-4" />
            New Prescription
          </Button>
        </div>

        {/* Prescription List */}
        {prescriptions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No prescriptions"
            description="Add doctor prescriptions to track patient medication history."
            action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />Add Prescription</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prescriptions.map((rx) => (
              <Card key={rx.id} hover>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        rx.status === "pending" ? "bg-amber-500/10" : rx.status === "dispensed" ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}>
                        <FileText className={`h-5 w-5 ${
                          rx.status === "pending" ? "text-amber-500" : rx.status === "dispensed" ? "text-emerald-500" : "text-red-500"
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{rx.patientName}</h3>
                        <p className="text-xs text-[var(--text-tertiary)]">{rx.doctorName ? `Dr. ${rx.doctorName}` : "No doctor info"}</p>
                      </div>
                    </div>
                    <Badge variant={rx.status === "pending" ? "warning" : rx.status === "dispensed" ? "success" : "danger"}>
                      {rx.status}
                    </Badge>
                  </div>

                  {rx.diagnosis && (
                    <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-2 bg-[var(--bg-muted)] p-2 rounded-lg">{rx.diagnosis}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-2 border-t border-[var(--border-default)]">
                    <span>{formatDateTime(rx.createdAt)}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setViewingRx(rx)} className="p-1.5 rounded hover:bg-blue-500/10 hover:text-blue-500 transition-colors">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {rx.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(rx.id, "dispensed")} className="p-1.5 rounded hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => updateStatus(rx.id, "cancelled")} className="p-1.5 rounded hover:bg-red-500/10 hover:text-red-500 transition-colors">
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Prescription Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title="New Prescription" size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="patientName" label="Patient Name *" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="Patient full name" required />
              <Select
                id="customerId"
                label="Link to Customer"
                options={[{ value: "", label: "None" }, ...customers.map((c) => ({ value: c.id, label: `${c.name}${c.phone ? ` (${c.phone})` : ""}` }))]}
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              />
              <Input id="doctorName" label="Doctor Name" value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} placeholder="Dr. Name" />
              <Input id="doctorPhone" label="Doctor Phone" value={form.doctorPhone} onChange={(e) => setForm({ ...form, doctorPhone: e.target.value })} placeholder="Phone number" />
            </div>
            <Input id="diagnosis" label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Brief diagnosis or condition" />
            <Input
              id="prescriptionImageUrl"
              label="Prescription Image URL"
              value={form.prescriptionImageUrl}
              onChange={(e) => setForm({ ...form, prescriptionImageUrl: e.target.value })}
              placeholder="https://example.com/prescription.jpg"
              hint="Paste a link to the scanned prescription image (optional)"
            />
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Prescription Notes / Medicines</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="List prescribed medicines, dosage, frequency..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border text-sm transition-all resize-none bg-[var(--bg-input)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={saving}>Save Prescription</Button>
            </div>
          </form>
        </Modal>

        {/* View Prescription Modal */}
        <Modal open={!!viewingRx} onClose={() => setViewingRx(null)} title="Prescription Details">
          {viewingRx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Patient</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{viewingRx.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Status</p>
                  <Badge variant={viewingRx.status === "pending" ? "warning" : viewingRx.status === "dispensed" ? "success" : "danger"}>
                    {viewingRx.status}
                  </Badge>
                </div>
                {viewingRx.doctorName && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Doctor</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Dr. {viewingRx.doctorName}</p>
                  </div>
                )}
                {viewingRx.doctorPhone && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Doctor Phone</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{viewingRx.doctorPhone}</p>
                  </div>
                )}
                {viewingRx.customer && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Linked Customer</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{viewingRx.customer.name}</p>
                  </div>
                )}
                {viewingRx.sale && (
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Linked Invoice</p>
                    <p className="text-sm font-medium text-indigo-600">{viewingRx.sale.invoiceNumber}</p>
                  </div>
                )}
              </div>
              {viewingRx.diagnosis && (
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Diagnosis</p>
                  <p className="text-sm bg-[var(--bg-muted)] p-3 rounded-lg text-[var(--text-primary)]">{viewingRx.diagnosis}</p>
                </div>
              )}
              {viewingRx.notes && (
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Prescription Notes</p>
                  <p className="text-sm bg-[var(--bg-muted)] p-3 rounded-lg whitespace-pre-wrap text-[var(--text-primary)]">{viewingRx.notes}</p>
                </div>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Created: {formatDateTime(viewingRx.createdAt)}</p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
