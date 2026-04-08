"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageLoading } from "@/components/ui/loading";
import { Save, Store, FileText, Bell } from "lucide-react";
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
          invoicePrefix: "INV",
          lowStockThreshold: "10",
          expiryAlertDays: "30",
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

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <Header title="Settings" subtitle="Configure your store settings" />
      <div className="p-4 sm:p-6 max-w-3xl space-y-4 sm:space-y-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100/50">
                <Store className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Store Information</h3>
                <p className="text-xs text-slate-500">Your store details for invoices</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="storeName"
              label="Store Name"
              value={settings.storeName || ""}
              onChange={(e) => updateSetting("storeName", e.target.value)}
              placeholder="Your Medical Store Name"
            />
            <Input
              id="storeAddress"
              label="Address"
              value={settings.storeAddress || ""}
              onChange={(e) => updateSetting("storeAddress", e.target.value)}
              placeholder="Full store address"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="storePhone"
                label="Phone"
                value={settings.storePhone || ""}
                onChange={(e) => updateSetting("storePhone", e.target.value)}
                placeholder="Store phone number"
              />
              <Input
                id="storeEmail"
                label="Email"
                value={settings.storeEmail || ""}
                onChange={(e) => updateSetting("storeEmail", e.target.value)}
                placeholder="Store email"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tax & Compliance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tax & Compliance</h3>
                <p className="text-xs text-slate-500">GST and regulatory details</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="storeGstin"
                label="GSTIN"
                value={settings.storeGstin || ""}
                onChange={(e) => updateSetting("storeGstin", e.target.value)}
                placeholder="e.g., 29AABCU9603R1ZM"
              />
              <Input
                id="storeDrugLicense"
                label="Drug License No."
                value={settings.storeDrugLicense || ""}
                onChange={(e) => updateSetting("storeDrugLicense", e.target.value)}
                placeholder="e.g., DL-20B-12345"
              />
            </div>
            <Input
              id="invoicePrefix"
              label="Invoice Prefix"
              value={settings.invoicePrefix || ""}
              onChange={(e) => updateSetting("invoicePrefix", e.target.value)}
              placeholder="e.g., INV"
              hint="Used as prefix for invoice numbers"
            />
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Alerts & Thresholds</h3>
                <p className="text-xs text-slate-500">Stock and expiry notifications</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="lowStockThreshold"
                label="Low Stock Alert Threshold"
                type="number"
                min="1"
                value={settings.lowStockThreshold || ""}
                onChange={(e) => updateSetting("lowStockThreshold", e.target.value)}
                hint="Alert when stock drops below this level"
              />
              <Input
                id="expiryAlertDays"
                label="Expiry Alert (Days)"
                type="number"
                min="1"
                value={settings.expiryAlertDays || ""}
                onChange={(e) => updateSetting("expiryAlertDays", e.target.value)}
                hint="Alert before medicines expire"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} size="lg">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
