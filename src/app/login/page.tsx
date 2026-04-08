"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Shield, BarChart3, Zap, ArrowRight } from "lucide-react";
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
      {/* Left panel - hero area */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        {/* Animated background blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-teal-500/20 blur-[100px] animate-float" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[120px] animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[80px] animate-float" style={{ animationDelay: "3s" }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }} />

        <div className="relative z-10 flex flex-col justify-between px-12 xl:px-16 py-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">MedStore ERP</h1>
              <p className="text-xs text-teal-300/70 font-medium">Pharmacy Management Suite</p>
            </div>
          </div>

          {/* Main content */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs text-white/80 font-medium">All-in-one pharmacy solution</span>
            </div>

            <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-5 tracking-tight">
              Smart pharmacy
              <br />
              <span className="text-gradient bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">management.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
              Track inventory, manage billing, monitor expiry dates, and generate comprehensive reports from one powerful dashboard.
            </p>

            {/* Feature pills */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: "Inventory Control", desc: "Real-time stock tracking" },
                { icon: BarChart3, label: "Smart Reports", desc: "GST-ready analytics" },
              ].map((f) => (
                <div key={f.label} className="group flex items-start gap-3 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] transition-all duration-300">
                  <div className="p-2 rounded-xl bg-teal-500/15 group-hover:bg-teal-500/25 transition-colors">
                    <f.icon className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-8">
            {[
              { value: "500+", label: "Medicines" },
              { value: "24/7", label: "Access" },
              { value: "100%", label: "GST Ready" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[100px]" />

        <div className="w-full max-w-[420px] relative z-10 animate-fade-in-scale">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">MedStore ERP</h1>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 xl:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
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

            <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/50 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-5 h-5 rounded-md bg-teal-100 flex items-center justify-center">
                  <Shield className="h-3 w-3 text-teal-600" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Demo Credentials
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500">
                  Email: <code className="px-1.5 py-0.5 rounded bg-white text-teal-700 font-semibold border border-slate-200/70">admin@medstore.com</code>
                </p>
                <p className="text-xs text-slate-500">
                  Password: <code className="px-1.5 py-0.5 rounded bg-white text-teal-700 font-semibold border border-slate-200/70">admin123</code>
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Medical Store ERP &middot; Secure Access
          </p>
        </div>
      </div>
    </div>
  );
}
