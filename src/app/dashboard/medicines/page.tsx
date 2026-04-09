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
import {
  formatCurrency,
  formatDate,
  getExpiryStatus,
  getDaysUntilExpiry,
} from "@/lib/utils";
import {
  Plus,
  Search,
  Pill,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

interface Batch {
  id: string;
  batchNumber: string;
  mrp: number;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  mfgDate: string | null;
  expiryDate: string;
}

interface Medicine {
  id: string;
  name: string;
  genericName: string | null;
  composition: string | null;
  category: string;
  manufacturer: string | null;
  hsnCode: string | null;
  gstRate: number;
  prescriptionReq: boolean;
  rackLocation: string | null;
  reorderLevel: number;
  batches: Batch[];
  totalStock: number;
  nearestExpiry: string | null;
}

const DEFAULT_CATEGORIES = [
  "Tablet", "Capsule", "Syrup", "Injection", "Ointment",
  "Drops", "Inhaler", "Powder", "Cream", "Gel", "Spray", "Suppository",
];

const GST_RATES = ["0", "5", "12", "18", "28"];

const emptyForm = {
  name: "",
  genericName: "",
  composition: "",
  category: "Tablet",
  manufacturer: "",
  hsnCode: "",
  gstRate: "12",
  prescriptionReq: false,
  rackLocation: "",
  reorderLevel: "10",
};

const emptyBatchForm = {
  medicineId: "",
  batchNumber: "",
  mrp: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
  mfgDate: "",
  expiryDate: "",
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [batchForm, setBatchForm] = useState(emptyBatchForm);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setCategories(data);
    } catch { /* keep defaults */ }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const fetchMedicines = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      const res = await fetch(`/api/medicines?${params}`);
      const data = await res.json();
      setMedicines(data);
    } catch {
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const finalCategory =
        showCustomCategory && customCategory.trim()
          ? customCategory.trim()
          : form.category;

      const url = editingId ? `/api/medicines/${editingId}` : "/api/medicines";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, category: finalCategory }),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? "Medicine updated" : "Medicine added");
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      setCustomCategory("");
      setShowCustomCategory(false);
      fetchMedicines();
      fetchCategories();
    } catch {
      toast.error("Failed to save medicine");
    } finally {
      setSaving(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batchForm),
      });
      if (!res.ok) throw new Error();
      toast.success("Batch added successfully");
      setShowBatchModal(false);
      setBatchForm(emptyBatchForm);
      fetchMedicines();
    } catch {
      toast.error("Failed to add batch");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await fetch(`/api/medicines/${id}`, { method: "DELETE" });
      toast.success("Medicine deleted");
      fetchMedicines();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const openEdit = (med: Medicine) => {
    setEditingId(med.id);
    const isKnown = categories.includes(med.category);
    setForm({
      name: med.name,
      genericName: med.genericName || "",
      composition: med.composition || "",
      category: isKnown ? med.category : "Tablet",
      manufacturer: med.manufacturer || "",
      hsnCode: med.hsnCode || "",
      gstRate: med.gstRate.toString(),
      prescriptionReq: med.prescriptionReq,
      rackLocation: med.rackLocation || "",
      reorderLevel: med.reorderLevel.toString(),
    });
    if (!isKnown) {
      setShowCustomCategory(true);
      setCustomCategory(med.category);
    } else {
      setShowCustomCategory(false);
      setCustomCategory("");
    }
    setShowModal(true);
  };

  const openAddBatch = (medicineId: string) => {
    setBatchForm({ ...emptyBatchForm, medicineId });
    setShowBatchModal(true);
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <Header
        title="Medicines"
        subtitle={`${medicines.length} medicines in inventory`}
      />
      <div className="p-4 sm:p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, generic name, composition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <Select
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-44"
          />
          <Button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setShowModal(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Medicine
          </Button>
        </div>

        {/* Medicine List */}
        {medicines.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No medicines found"
            description="Add your first medicine to get started with inventory management."
            action={
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4" />
                Add Medicine
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {medicines.map((med) => {
              const isExpanded = expandedId === med.id;
              const stockStatus =
                med.totalStock <= 0
                  ? "danger"
                  : med.totalStock <= med.reorderLevel
                  ? "warning"
                  : "success";
              const expiryStatus = med.nearestExpiry
                ? getExpiryStatus(med.nearestExpiry)
                : null;

              return (
                <Card key={med.id} className="overflow-hidden card-hover">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-5 py-3 sm:py-4 gap-2 sm:gap-0">
                    <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100/50 flex-shrink-0">
                        <Pill className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-[120px] sm:max-w-none">
                            {med.name}
                          </h3>
                          <Badge size="sm">{med.category}</Badge>
                          {med.prescriptionReq && (
                            <Badge variant="info" size="sm">Rx</Badge>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
                          {[med.genericName, med.manufacturer]
                            .filter(Boolean)
                            .join(" • ") || "No details"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0 pl-10 sm:pl-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-slate-400" />
                          <span className={`text-sm font-semibold ${
                            stockStatus === "danger"
                              ? "text-red-600"
                              : stockStatus === "warning"
                              ? "text-amber-600"
                              : "text-slate-900"
                          }`}>
                            {med.totalStock}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">In stock</p>
                      </div>

                      {expiryStatus && med.nearestExpiry && (
                        <div className="text-right hidden md:block">
                          <Badge
                            variant={
                              expiryStatus === "expired"
                                ? "danger"
                                : expiryStatus === "critical"
                                ? "danger"
                                : expiryStatus === "warning"
                                ? "warning"
                                : "success"
                            }
                          >
                            {expiryStatus === "expired"
                              ? "Expired"
                              : `${getDaysUntilExpiry(med.nearestExpiry)}d left`}
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openAddBatch(med.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                          title="Add Batch"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(med)}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setExpandedId(isExpanded ? null : med.id)
                          }
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Batch details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-3 sm:px-5 py-3 sm:py-4 animate-fade-in">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 text-xs">
                        <div>
                          <span className="text-slate-500">Composition:</span>
                          <p className="font-medium text-slate-700">
                            {med.composition || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">HSN Code:</span>
                          <p className="font-medium text-slate-700">
                            {med.hsnCode || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">GST Rate:</span>
                          <p className="font-medium text-slate-700">
                            {med.gstRate}%
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Rack Location:</span>
                          <p className="font-medium text-slate-700">
                            {med.rackLocation || "N/A"}
                          </p>
                        </div>
                      </div>
                      {med.batches.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs min-w-[500px]">
                            <thead>
                              <tr className="bg-white">
                                <th className="text-left py-2 px-3 font-medium text-slate-500">
                                  Batch No.
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-slate-500">
                                  MRP
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-slate-500">
                                  Purchase
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-slate-500">
                                  Selling
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-slate-500">
                                  Qty
                                </th>
                                <th className="text-right py-2 px-3 font-medium text-slate-500">
                                  Expiry
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {med.batches.map((batch) => {
                                const bExpiry = getExpiryStatus(
                                  batch.expiryDate
                                );
                                return (
                                  <tr key={batch.id} className="border-t border-slate-100">
                                    <td className="py-2 px-3 font-medium text-slate-700">
                                      {batch.batchNumber}
                                    </td>
                                    <td className="py-2 px-3 text-right text-slate-600">
                                      {formatCurrency(batch.mrp)}
                                    </td>
                                    <td className="py-2 px-3 text-right text-slate-600">
                                      {formatCurrency(batch.purchasePrice)}
                                    </td>
                                    <td className="py-2 px-3 text-right text-slate-600">
                                      {formatCurrency(batch.sellingPrice)}
                                    </td>
                                    <td className="py-2 px-3 text-right font-medium text-slate-700">
                                      {batch.quantity}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      <Badge
                                        variant={
                                          bExpiry === "expired" || bExpiry === "critical"
                                            ? "danger"
                                            : bExpiry === "warning"
                                            ? "warning"
                                            : "success"
                                        }
                                      >
                                        {formatDate(batch.expiryDate)}
                                      </Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-500">
                          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                          No batches. Add stock by clicking the + button.
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Add/Edit Medicine Modal */}
        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingId(null);
          }}
          title={editingId ? "Edit Medicine" : "Add Medicine"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="name"
                label="Medicine Name *"
                placeholder="e.g., Paracetamol 500mg"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                id="genericName"
                label="Generic Name"
                placeholder="e.g., Paracetamol"
                value={form.genericName}
                onChange={(e) =>
                  setForm({ ...form, genericName: e.target.value })
                }
              />
              <Input
                id="composition"
                label="Composition / Salt"
                placeholder="e.g., Paracetamol 500mg"
                value={form.composition}
                onChange={(e) =>
                  setForm({ ...form, composition: e.target.value })
                }
              />
              <div className="space-y-2">
                <Select
                  id="category"
                  label="Category"
                  options={[
                    ...categories.map((c) => ({ value: c, label: c })),
                    { value: "__other__", label: "➕ Other (add new)" },
                  ]}
                  value={showCustomCategory ? "__other__" : form.category}
                  onChange={(e) => {
                    if (e.target.value === "__other__") {
                      setShowCustomCategory(true);
                      setCustomCategory("");
                    } else {
                      setShowCustomCategory(false);
                      setCustomCategory("");
                      setForm({ ...form, category: e.target.value });
                    }
                  }}
                />
                {showCustomCategory && (
                  <Input
                    id="customCategory"
                    label="New Category Name *"
                    placeholder="e.g., Lozenges, Sachets..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    required
                    autoFocus
                  />
                )}
              </div>
              <Input
                id="manufacturer"
                label="Manufacturer"
                placeholder="e.g., Cipla"
                value={form.manufacturer}
                onChange={(e) =>
                  setForm({ ...form, manufacturer: e.target.value })
                }
              />
              <Input
                id="hsnCode"
                label="HSN Code"
                placeholder="e.g., 3004"
                value={form.hsnCode}
                onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
              />
              <Select
                id="gstRate"
                label="GST Rate (%)"
                options={GST_RATES.map((r) => ({ value: r, label: `${r}%` }))}
                value={form.gstRate}
                onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
              />
              <Input
                id="rackLocation"
                label="Rack / Shelf Location"
                placeholder="e.g., A-12"
                value={form.rackLocation}
                onChange={(e) =>
                  setForm({ ...form, rackLocation: e.target.value })
                }
              />
              <Input
                id="reorderLevel"
                label="Reorder Level"
                type="number"
                min="0"
                value={form.reorderLevel}
                onChange={(e) =>
                  setForm({ ...form, reorderLevel: e.target.value })
                }
              />
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="prescriptionReq"
                  checked={form.prescriptionReq}
                  onChange={(e) =>
                    setForm({ ...form, prescriptionReq: e.target.checked })
                  }
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="prescriptionReq"
                  className="text-sm text-slate-700"
                >
                  Prescription Required
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editingId ? "Update" : "Add"} Medicine
              </Button>
            </div>
          </form>
        </Modal>

        {/* Add Batch Modal */}
        <Modal
          open={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          title="Add Batch / Stock"
        >
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="batchNumber"
                label="Batch Number *"
                placeholder="e.g., BT-2024-001"
                value={batchForm.batchNumber}
                onChange={(e) =>
                  setBatchForm({ ...batchForm, batchNumber: e.target.value })
                }
                required
              />
              <Input
                id="quantity"
                label="Quantity *"
                type="number"
                min="1"
                placeholder="e.g., 100"
                value={batchForm.quantity}
                onChange={(e) =>
                  setBatchForm({ ...batchForm, quantity: e.target.value })
                }
                required
              />
              <Input
                id="purchasePrice"
                label="Purchase Price *"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 5.50"
                value={batchForm.purchasePrice}
                onChange={(e) =>
                  setBatchForm({ ...batchForm, purchasePrice: e.target.value })
                }
                required
              />
              <Input
                id="sellingPrice"
                label="Selling Price *"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 8.00"
                value={batchForm.sellingPrice}
                onChange={(e) =>
                  setBatchForm({ ...batchForm, sellingPrice: e.target.value })
                }
                required
              />
              <Input
                id="mrp"
                label="MRP *"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 10.00"
                value={batchForm.mrp}
                onChange={(e) =>
                  setBatchForm({ ...batchForm, mrp: e.target.value })
                }
                required
              />
              <Input
                id="mfgDate"
                label="Manufacturing Date"
                type="date"
                value={batchForm.mfgDate}
                onChange={(e) =>
                  setBatchForm({ ...batchForm, mfgDate: e.target.value })
                }
              />
              <Input
                id="expiryDate"
                label="Expiry Date *"
                type="date"
                value={batchForm.expiryDate}
                onChange={(e) =>
                  setBatchForm({ ...batchForm, expiryDate: e.target.value })
                }
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowBatchModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Add Batch
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
