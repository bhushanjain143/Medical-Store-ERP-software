"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/loading";
import { Save, Store, FileText, Bell, Printer, Database, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          storeName: "MedStore ERP",
          storeAddress: "",
          storePhone: "",
          storeEmail: "",
          storeGstin: "",
          storeDrugLicense: "",
          storePAN: "",
          invoicePrefix: "INV",
          invoiceFooter: "Thank you for your purchase!",
          lowStockThreshold: "10",
          expiryAlertDays: "30",
          currency: "INR",
          receiptCopies: "1",
          enableSMS: "false",
          enableEmail: "false",
          ...data,
        });
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const u = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  if (loading) return <PageLoading />;

  return (
    <div>
      <Header title="Settings" subtitle="Configure your store, billing, alerts & system preferences" />
      <div className="p-4 sm:p-6 max-w-4xl space-y-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Store Information</h3>
                <p className="text-xs text-slate-500">Your pharmacy details — displayed on invoices</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input id="storeName" label="Store / Pharmacy Name" value={settings.storeName || ""} onChange={(e) => u("storeName", e.target.value)} placeholder="Your Medical Store Name" />
            <Input id="storeAddress" label="Full Address" value={settings.storeAddress || ""} onChange={(e) => u("storeAddress", e.target.value)} placeholder="123 Main Road, City, State - PIN" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="storePhone" label="Phone Number" value={settings.storePhone || ""} onChange={(e) => u("storePhone", e.target.value)} placeholder="e.g., +91 98765 43210" />
              <Input id="storeEmail" label="Email Address" value={settings.storeEmail || ""} onChange={(e) => u("storeEmail", e.target.value)} placeholder="e.g., contact@yourstore.com" />
            </div>
          </CardContent>
        </Card>

        {/* Tax & Compliance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tax & Compliance</h3>
                <p className="text-xs text-slate-500">GST, Drug License and regulatory details</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input id="storeGstin" label="GSTIN Number" value={settings.storeGstin || ""} onChange={(e) => u("storeGstin", e.target.value)} placeholder="e.g., 29AABCU9603R1ZM" />
              <Input id="storeDrugLicense" label="Drug License No." value={settings.storeDrugLicense || ""} onChange={(e) => u("storeDrugLicense", e.target.value)} placeholder="e.g., DL-20B-12345" />
              <Input id="storePAN" label="PAN Number" value={settings.storePAN || ""} onChange={(e) => u("storePAN", e.target.value)} placeholder="e.g., AABCU9603R" />
            </div>
          </CardContent>
        </Card>

        {/* Invoice & Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                <Printer className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Invoice & Billing</h3>
                <p className="text-xs text-slate-500">Invoice format, prefix, and receipt settings</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input id="invoicePrefix" label="Invoice Prefix" value={settings.invoicePrefix || ""} onChange={(e) => u("invoicePrefix", e.target.value)} placeholder="e.g., INV" />
              <Input id="currency" label="Currency" value={settings.currency || ""} onChange={(e) => u("currency", e.target.value)} placeholder="INR" />
              <Input id="receiptCopies" label="Receipt Copies" type="number" min="1" max="3" value={settings.receiptCopies || ""} onChange={(e) => u("receiptCopies", e.target.value)} />
            </div>
            <Input id="invoiceFooter" label="Invoice Footer Message" value={settings.invoiceFooter || ""} onChange={(e) => u("invoiceFooter", e.target.value)} placeholder="Thank you for your purchase!" />
          </CardContent>
        </Card>

        {/* Alerts & Thresholds */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Alerts & Thresholds</h3>
                <p className="text-xs text-slate-500">Configure stock and expiry notification settings</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input id="lowStockThreshold" label="Low Stock Alert Threshold" type="number" min="1" value={settings.lowStockThreshold || ""} onChange={(e) => u("lowStockThreshold", e.target.value)} placeholder="10" />
              <Input id="expiryAlertDays" label="Expiry Alert (Days Before)" type="number" min="1" value={settings.expiryAlertDays || ""} onChange={(e) => u("expiryAlertDays", e.target.value)} placeholder="30" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enableSMS"
                    checked={settings.enableSMS === "true"}
                    onChange={(e) => u("enableSMS", e.target.checked ? "true" : "false")}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label htmlFor="enableSMS" className="text-sm text-slate-700 font-medium">Enable SMS Notifications</label>
                </div>
                {(settings.smsPhone || settings.storePhone) && (
                  <p className="text-xs text-slate-500">
                    Configured number: <span className="font-semibold text-slate-700">{settings.smsPhone || settings.storePhone}</span>
                  </p>
                )}
                <Input
                  id="smsPhone"
                  label="SMS Phone Number"
                  placeholder="e.g., +91 98765 43210"
                  value={settings.smsPhone || settings.storePhone || ""}
                  onChange={(e) => u("smsPhone", e.target.value)}
                />
                {settings.enableSMS === "true" && !(settings.smsPhone || settings.storePhone) && (
                  <p className="text-[11px] text-amber-600">Set a phone number above to receive SMS alerts.</p>
                )}
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enableEmail"
                    checked={settings.enableEmail === "true"}
                    onChange={(e) => u("enableEmail", e.target.checked ? "true" : "false")}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label htmlFor="enableEmail" className="text-sm text-slate-700 font-medium">Enable Email Notifications</label>
                </div>
                {(settings.emailAddress || settings.storeEmail) && (
                  <p className="text-xs text-slate-500">
                    Configured email: <span className="font-semibold text-slate-700">{settings.emailAddress || settings.storeEmail}</span>
                  </p>
                )}
                <Input
                  id="emailAddress"
                  label="Notification Email"
                  type="email"
                  placeholder="e.g., alerts@yourstore.com"
                  value={settings.emailAddress || settings.storeEmail || ""}
                  onChange={(e) => u("emailAddress", e.target.value)}
                />
                {settings.enableEmail === "true" && !(settings.emailAddress || settings.storeEmail) && (
                  <p className="text-[11px] text-amber-600">Set an email address above to receive email alerts.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 shadow-sm">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">System Information</h3>
                <p className="text-xs text-slate-500">Application and database details</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Version", value: "2.0.0" },
                { label: "Database", value: "Turso Cloud" },
                { label: "Framework", value: "Next.js 16" },
                { label: "ORM", value: "Prisma 7" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">{item.label}</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-6">
          <Button onClick={handleSave} loading={saving} size="lg" className="px-8">
            <Save className="h-4 w-4" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
