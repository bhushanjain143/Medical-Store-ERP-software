"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Printer,
  Receipt,
  X,
  Eye,
  Download,
} from "lucide-react";
import { generateInvoicePDF } from "@/lib/generate-invoice-pdf";
import { useEffect, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";

interface Batch {
  id: string;
  batchNumber: string;
  sellingPrice: number;
  mrp: number;
  quantity: number;
  expiryDate: string;
}

interface Medicine {
  id: string;
  name: string;
  genericName: string | null;
  category: string;
  gstRate: number;
  batches: Batch[];
}

interface CartItem {
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  maxQuantity: number;
  unitPrice: number;
  mrp: number;
  gstRate: number;
  discount: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

interface SaleRecord {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paymentMode: string;
  status: string;
  discount: number;
  gstAmount: number;
  subtotal: number;
  createdAt: string;
  notes: string | null;
  customer: { name: string; phone: string | null } | null;
  user: { name: string };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    gstRate: number;
    gstAmount: number;
    discount: number;
    medicine: { name: string };
    batch: { batchNumber: string };
  }>;
}

export default function BillingPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [showSales, setShowSales] = useState(false);
  const [viewingSale, setViewingSale] = useState<SaleRecord | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [showSearch, setShowSearch] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [medRes, custRes] = await Promise.all([
        fetch("/api/medicines"),
        fetch("/api/customers"),
      ]);
      const medData = await medRes.json();
      const custData = await custRes.json();
      setMedicines(Array.isArray(medData) ? medData : []);
      setCustomers(Array.isArray(custData) ? custData : []);
    } catch {
      toast.error("Failed to load data");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadSales = async () => {
    try {
      const res = await fetch("/api/sales?limit=50");
      const data = await res.json();
      setSales(data.sales || []);
      setSalesTotal(data.total || 0);
    } catch {
      toast.error("Failed to load sales");
    }
  };

  useEffect(() => {
    if (showSales) loadSales();
  }, [showSales]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    const q = query.toLowerCase();
    const results = medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.genericName?.toLowerCase().includes(q) ||
        m.batches.some((b) => b.batchNumber.toLowerCase().includes(q))
    );
    setSearchResults(results.slice(0, 10));
    setShowSearch(true);
  };

  const addToCart = (medicine: Medicine, batch: Batch) => {
    if (batch.quantity <= 0) {
      toast.error("Out of stock");
      return;
    }
    const existing = cart.find((item) => item.batchId === batch.id);
    if (existing) {
      if (existing.quantity >= batch.quantity) {
        toast.error("Maximum stock reached");
        return;
      }
      setCart(
        cart.map((item) =>
          item.batchId === batch.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          medicineId: medicine.id,
          medicineName: medicine.name,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          quantity: 1,
          maxQuantity: batch.quantity,
          unitPrice: batch.sellingPrice,
          mrp: batch.mrp,
          gstRate: medicine.gstRate,
          discount: 0,
        },
      ]);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  const updateQuantity = (batchId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.batchId !== batchId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.maxQuantity) {
            toast.error("Maximum stock reached");
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (batchId: string) => {
    setCart(cart.filter((item) => item.batchId !== batchId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice - item.discount,
    0
  );
  const gstAmount = cart.reduce(
    (sum, item) =>
      sum +
      ((item.quantity * item.unitPrice - item.discount) * item.gstRate) /
        (100 + item.gstRate),
    0
  );
  const totalDiscount = parseFloat(discount) || 0;
  const grandTotal = subtotal - totalDiscount;

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            batchId: item.batchId,
            quantity: item.quantity,
            discount: item.discount,
          })),
          customerId: selectedCustomer || null,
          paymentMode,
          discount,
          notes: notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Invoice ${data.invoiceNumber} created!`);
      setViewingSale(data);
      setCart([]);
      setDiscount("0");
      setNotes("");
      setSelectedCustomer("");
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create sale");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (saleId: string) => {
    if (!confirm("Are you sure you want to return this sale? Stock will be restored.")) return;
    try {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "returned" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Sale returned successfully");
      loadSales();
    } catch {
      toast.error("Failed to return sale");
    }
  };

  return (
    <div>
      <Header title="Billing / POS" subtitle="Create invoices and manage sales" />
      <div className="p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-0.5">
          <Button
            variant={!showSales ? "primary" : "outline"}
            onClick={() => {
              setShowSales(false);
              setCart([]);
              setDiscount("0");
              setNotes("");
              setSelectedCustomer("");
              setPaymentMode("cash");
              setSearchQuery("");
              setSearchResults([]);
              setShowSearch(false);
              setViewingSale(null);
              loadData();
              setTimeout(() => searchRef.current?.focus(), 100);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            New Bill
          </Button>
          <Button
            variant={showSales ? "primary" : "outline"}
            onClick={() => {
              setShowSales(true);
              loadSales();
            }}
          >
            <Receipt className="h-4 w-4" />
            Sales History ({salesTotal})
          </Button>
        </div>

        {!showSales ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-3 sm:space-y-4 min-w-0">
              <Card>
                <CardContent className="py-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search medicines by name, generic name, or batch number..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm shadow-sm transition-all bg-[var(--bg-input)] border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] hover:border-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      autoFocus
                    />
                    {showSearch && searchResults.length > 0 && (
                      <div className="absolute z-10 top-full left-0 right-0 mt-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl shadow-xl max-h-80 overflow-y-auto">
                        {searchResults.map((med) =>
                          med.batches
                            .filter((b) => b.quantity > 0)
                            .map((batch) => (
                              <button
                                key={batch.id}
                                onClick={() => addToCart(med, batch)}
                                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-muted)] border-b border-[var(--border-subtle)] last:border-0 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">
                                      {med.name}
                                    </p>
                                    <p className="text-xs text-[var(--text-tertiary)]">
                                      Batch: {batch.batchNumber} &bull; Stock:{" "}
                                      {batch.quantity} &bull; Exp:{" "}
                                      {formatDate(batch.expiryDate)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-indigo-500">
                                      {formatCurrency(batch.sellingPrice)}
                                    </p>
                                    <p className="text-[11px] text-[var(--text-tertiary)]">
                                      MRP: {formatCurrency(batch.mrp)}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      Cart ({cart.length} items)
                    </h3>
                    {cart.length > 0 && (
                      <button
                        onClick={() => setCart([])}
                        className="text-xs text-red-500 hover:text-red-400 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {cart.length === 0 ? (
                    <div className="py-12 text-center">
                      <ShoppingCart className="h-10 w-10 text-[var(--text-tertiary)] mx-auto mb-3 opacity-40" />
                      <p className="text-sm text-[var(--text-tertiary)]">
                        Search and add medicines to start billing
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[500px]">
                        <thead>
                          <tr className="bg-[var(--table-header-bg)] border-b border-[var(--border-default)]">
                            <th className="text-left py-3 px-4 font-medium text-[var(--text-tertiary)]">
                              Medicine
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-[var(--text-tertiary)]">
                              Qty
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-[var(--text-tertiary)]">
                              Price
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-[var(--text-tertiary)]">
                              Total
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-[var(--text-tertiary)] w-12"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item) => (
                            <tr key={item.batchId} className="border-b border-[var(--border-subtle)]">
                              <td className="py-3 px-4">
                                <p className="font-medium text-[var(--text-primary)]">
                                  {item.medicineName}
                                </p>
                                <p className="text-xs text-[var(--text-tertiary)]">
                                  Batch: {item.batchNumber} &bull; GST: {item.gstRate}%
                                </p>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => updateQuantity(item.batchId, -1)}
                                    className="p-1 rounded bg-[var(--bg-muted)] hover:bg-indigo-500/10 transition-colors"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="w-8 text-center font-medium text-[var(--text-primary)]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.batchId, 1)}
                                    className="p-1 rounded bg-[var(--bg-muted)] hover:bg-indigo-500/10 transition-colors"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right text-[var(--text-secondary)]">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)]">
                                {formatCurrency(item.quantity * item.unitPrice)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => removeFromCart(item.batchId)}
                                  className="p-1 rounded text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 min-w-0">
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Bill Summary
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    id="customer"
                    label="Customer"
                    options={[
                      { value: "", label: "Walk-in Customer" },
                      ...customers.map((c) => ({
                        value: c.id,
                        label: `${c.name}${c.phone ? ` (${c.phone})` : ""}`,
                      })),
                    ]}
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  />
                  <Select
                    id="paymentMode"
                    label="Payment Mode"
                    options={[
                      { value: "cash", label: "Cash" },
                      { value: "upi", label: "UPI" },
                      { value: "card", label: "Debit/Credit Card" },
                      { value: "net_banking", label: "Net Banking" },
                      { value: "wallet", label: "Wallet" },
                      { value: "credit", label: "Credit (Udhar)" },
                    ]}
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  />
                  <Input
                    id="discount"
                    label="Discount (₹)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                  <Input
                    id="notes"
                    label="Notes"
                    placeholder="Optional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />

                  <div className="border-t border-[var(--border-default)] pt-4 space-y-2">
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-[var(--text-tertiary)] flex-shrink-0">Subtotal</span>
                      <span className="text-[var(--text-secondary)] truncate text-right">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-[var(--text-tertiary)] flex-shrink-0">CGST</span>
                      <span className="text-[var(--text-secondary)] truncate text-right">{formatCurrency(gstAmount / 2)}</span>
                    </div>
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-[var(--text-tertiary)] flex-shrink-0">SGST</span>
                      <span className="text-[var(--text-secondary)] truncate text-right">{formatCurrency(gstAmount / 2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-tertiary)] gap-2">
                      <span className="flex-shrink-0">Total GST (incl.)</span>
                      <span className="truncate text-right">{formatCurrency(gstAmount)}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-sm gap-2">
                        <span className="text-[var(--text-tertiary)] flex-shrink-0">Discount</span>
                        <span className="text-red-500 truncate text-right">-{formatCurrency(totalDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base sm:text-lg font-extrabold border-t border-[var(--border-default)] pt-3 gap-2">
                      <span className="text-[var(--text-primary)] flex-shrink-0">Total</span>
                      <span className="text-gradient truncate text-right">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full py-3.5"
                    size="lg"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={loading || cart.length === 0}
                  >
                    <Receipt className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {loading
                        ? "Processing..."
                        : cart.length === 0
                        ? "Add Items to Generate Invoice"
                        : `Generate Invoice — ${formatCurrency(grandTotal)}`}
                    </span>
                  </Button>
                  {cart.length === 0 && (
                    <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Search and add medicines to the cart above, then click Generate Invoice to create the bill.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="bg-[var(--table-header-bg)] border-b border-[var(--border-default)]">
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-[var(--text-tertiary)] text-xs">Invoice</th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-[var(--text-tertiary)] text-xs">Customer</th>
                      <th className="text-right py-3 px-3 sm:px-4 font-medium text-[var(--text-tertiary)] text-xs">Amount</th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-[var(--text-tertiary)] text-xs">Payment</th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-[var(--text-tertiary)] text-xs">Status</th>
                      <th className="text-left py-3 px-3 sm:px-4 font-medium text-[var(--text-tertiary)] text-xs">Date</th>
                      <th className="text-center py-3 px-3 sm:px-4 font-medium text-[var(--text-tertiary)] text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--table-row-hover)] transition-colors">
                        <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                          {sale.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">
                          {sale.customer?.name || "Walk-in"}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-[var(--text-primary)]">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={sale.paymentMode === "credit" ? "warning" : "success"}>
                            {sale.paymentMode}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={sale.status === "completed" ? "success" : "danger"}>
                            {sale.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-tertiary)] text-xs">
                          {formatDateTime(sale.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingSale(sale)}
                              className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => generateInvoicePDF(sale)}
                              className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            {sale.status === "completed" && (
                              <button
                                onClick={() => handleReturn(sale.id)}
                                className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Return"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {sales.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[var(--text-tertiary)]">
                          No sales found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice View Modal */}
        <Modal
          open={!!viewingSale}
          onClose={() => setViewingSale(null)}
          title={`Invoice: ${viewingSale?.invoiceNumber || ""}`}
          size="lg"
        >
          {viewingSale && (
            <div id="invoice-print">
              <div className="text-center mb-6 border-b-2 border-indigo-500 pb-4">
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">MedStore ERP</h2>
                <p className="text-sm text-[var(--text-tertiary)]">Medical Store - GST Tax Invoice</p>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-2 text-xs text-[var(--text-tertiary)]">
                  <span>Invoice: <strong className="text-[var(--text-secondary)]">{viewingSale.invoiceNumber}</strong></span>
                  <span>Date: <strong className="text-[var(--text-secondary)]">{formatDateTime(viewingSale.createdAt)}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-sm bg-[var(--bg-muted)] rounded-lg p-3">
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold mb-0.5">Bill To</p>
                  <p className="font-semibold text-[var(--text-primary)]">{viewingSale.customer?.name || "Walk-in Customer"}</p>
                  {viewingSale.customer?.phone && (
                    <p className="text-xs text-[var(--text-tertiary)]">Ph: {viewingSale.customer.phone}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[var(--text-tertiary)] uppercase font-semibold mb-0.5">Billed By</p>
                  <p className="font-semibold text-[var(--text-primary)]">{viewingSale.user.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Payment: {viewingSale.paymentMode.toUpperCase()}</p>
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <table className="w-full text-sm mb-4 min-w-[600px]">
                <thead>
                  <tr className="bg-indigo-500/10 border-b border-indigo-500/20">
                    <th className="text-left py-2.5 px-2 sm:px-3 font-semibold text-indigo-500 text-xs">#</th>
                    <th className="text-left py-2.5 px-2 sm:px-3 font-semibold text-indigo-500 text-xs">Medicine</th>
                    <th className="text-center py-2.5 px-2 sm:px-3 font-semibold text-indigo-500 text-xs">Qty</th>
                    <th className="text-right py-2.5 px-2 sm:px-3 font-semibold text-indigo-500 text-xs">Rate</th>
                    <th className="text-right py-2.5 px-2 sm:px-3 font-semibold text-indigo-500 text-xs">GST%</th>
                    <th className="text-right py-2.5 px-2 sm:px-3 font-semibold text-indigo-500 text-xs">CGST</th>
                    <th className="text-right py-2.5 px-2 sm:px-3 font-semibold text-indigo-500 text-xs">SGST</th>
                    <th className="text-right py-2.5 px-2 sm:px-3 font-semibold text-indigo-500 text-xs">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingSale.items.map((item, i) => {
                    const itemGst = (item.totalAmount * item.gstRate) / (100 + item.gstRate);
                    return (
                      <tr key={item.id} className="border-b border-[var(--border-subtle)]">
                        <td className="py-2 px-2 sm:px-3 text-[var(--text-tertiary)]">{i + 1}</td>
                        <td className="py-2 px-2 sm:px-3">
                          <p className="font-medium text-[var(--text-primary)]">{item.medicine.name}</p>
                          <p className="text-[10px] text-[var(--text-tertiary)]">Batch: {item.batch.batchNumber}</p>
                        </td>
                        <td className="py-2 px-2 sm:px-3 text-center text-[var(--text-primary)]">{item.quantity}</td>
                        <td className="py-2 px-2 sm:px-3 text-right text-[var(--text-secondary)]">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2 px-2 sm:px-3 text-right text-[var(--text-tertiary)]">{item.gstRate}%</td>
                        <td className="py-2 px-2 sm:px-3 text-right text-[var(--text-tertiary)]">{formatCurrency(itemGst / 2)}</td>
                        <td className="py-2 px-2 sm:px-3 text-right text-[var(--text-tertiary)]">{formatCurrency(itemGst / 2)}</td>
                        <td className="py-2 px-2 sm:px-3 text-right font-semibold text-[var(--text-primary)]">{formatCurrency(item.totalAmount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>

              <div className="bg-[var(--bg-muted)] rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Subtotal (before tax)</span>
                  <span className="text-[var(--text-primary)]">{formatCurrency(viewingSale.subtotal - viewingSale.gstAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">CGST</span>
                  <span className="text-[var(--text-primary)]">{formatCurrency(viewingSale.gstAmount / 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">SGST</span>
                  <span className="text-[var(--text-primary)]">{formatCurrency(viewingSale.gstAmount / 2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
                  <span>Total GST</span>
                  <span>{formatCurrency(viewingSale.gstAmount)}</span>
                </div>
                {viewingSale.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Discount</span>
                    <span className="text-red-500">-{formatCurrency(viewingSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-extrabold pt-2 border-t border-[var(--border-default)]">
                  <span className="text-[var(--text-primary)]">Grand Total</span>
                  <span className="text-indigo-500">{formatCurrency(viewingSale.totalAmount)}</span>
                </div>
              </div>

              {viewingSale.notes && (
                <p className="text-xs text-[var(--text-tertiary)] mt-3 italic">Note: {viewingSale.notes}</p>
              )}

              <div className="flex flex-wrap justify-end gap-2 sm:gap-3 mt-6 pt-4 border-t border-[var(--border-default)] no-print">
                <Button variant="outline" onClick={() => generateInvoicePDF(viewingSale)}>
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button onClick={() => setViewingSale(null)}>Close</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
