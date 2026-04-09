"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PharmacyHeroIllustration, MedicalLogo } from "@/components/ui/illustrations";
import { Shield, BarChart3, Zap, ArrowRight, Pill, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        return;
      }
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/dashboard");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - hero */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[120px] animate-float" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[80px] animate-float" style={{ animationDelay: "4s" }} />
        </div>

        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }} />

        <div className="relative z-10 flex flex-col justify-between px-12 xl:px-16 py-10 w-full">
          <div className="flex items-center gap-3">
            <MedicalLogo size={44} />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">MedStore ERP</h1>
              <p className="text-xs text-indigo-300/70 font-medium">Pharmacy Management Suite</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center -mt-8">
            <PharmacyHeroIllustration className="w-full max-w-[380px] mx-auto mb-6" />

            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs text-white/80 font-medium">All-in-one pharmacy solution</span>
              </div>

              <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-[1.15] mb-4 tracking-tight">
                Smart pharmacy
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">management system.</span>
              </h2>
              <p className="text-slate-400 text-base max-w-md leading-relaxed">
                Track inventory, manage billing, monitor expiry dates, and generate reports — all from one powerful dashboard.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: "Inventory Control", desc: "Real-time stock tracking" },
                  { icon: BarChart3, label: "Smart Reports", desc: "GST-ready analytics" },
                  { icon: Pill, label: "Medicine Tracking", desc: "Batch & expiry alerts" },
                  { icon: ClipboardList, label: "Billing & POS", desc: "Fast invoice generation" },
                ].map((f) => (
                  <div key={f.label} className="group flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all duration-300">
                    <div className="p-1.5 rounded-lg bg-indigo-500/15 group-hover:bg-indigo-500/25 transition-colors flex-shrink-0">
                      <f.icon className="h-4 w-4 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{f.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {[
              { value: "500+", label: "Medicines" },
              { value: "24/7", label: "Cloud Access" },
              { value: "100%", label: "GST Ready" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12 bg-[var(--bg-body)] relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.03] blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-violet-500/[0.03] blur-[80px]" />

        <div className="w-full max-w-[420px] relative z-10 animate-fade-in-scale">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <MedicalLogo size={40} />
            <h1 className="text-xl font-bold text-[var(--text-primary)]">MedStore ERP</h1>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl sm:rounded-3xl shadow-xl border border-[var(--border-default)] p-6 sm:p-8 xl:p-10 transition-colors">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-[var(--text-tertiary)] mt-1.5">
                Sign in to your pharmacy dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="admin@medstore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                loading={loading}
                className="w-full py-3 text-sm font-semibold"
                size="lg"
              >
                {!loading && "Sign In"}
                {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </form>

            <div className="mt-8 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-5 h-5 rounded-md bg-indigo-500/10 flex items-center justify-center">
                  <Shield className="h-3 w-3 text-indigo-500" />
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  Demo Credentials
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-[var(--text-tertiary)]">
                  Email: <code className="px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-indigo-500 font-semibold border border-[var(--border-default)]">admin@medstore.com</code>
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Password: <code className="px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-indigo-500 font-semibold border border-[var(--border-default)]">admin123</code>
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-[var(--text-tertiary)] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-500 font-semibold hover:text-indigo-400 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
