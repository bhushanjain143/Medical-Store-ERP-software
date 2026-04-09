"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PharmacyHeroIllustration, MedicalLogo } from "@/components/ui/illustrations";
import { UserPlus, ArrowRight, ShieldCheck, Store, Zap, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (step === "otp") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, storeName }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      if (data.requireOtp) {
        setStep("otp");
        setOtpDigits(["", "", "", "", "", ""]);
        setResendCooldown(30);
        toast.success("OTP sent to your email!");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      digits.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(index + digits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }
    newDigits[index] = value;
    setOtpDigits(newDigits);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose: "register" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Verification failed");
        return;
      }
      toast.success(`Welcome, ${data.user.name}! Your account is verified.`);
      router.push("/dashboard");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [otpDigits, email, router]);

  useEffect(() => {
    if (step === "otp" && otpDigits.every((d) => d !== "")) {
      handleVerifyOtp();
    }
  }, [otpDigits, step, handleVerifyOtp]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "register" }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to resend OTP");
        return;
      }
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setResendCooldown(30);
      toast.success("New OTP sent!");
    } catch {
      toast.error("Network error.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
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
            <PharmacyHeroIllustration className="w-full max-w-[360px] mx-auto mb-6" />

            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-5">
                <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs text-white/80 font-medium">Get started in 30 seconds</span>
              </div>

              <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-[1.15] mb-4 tracking-tight">
                Start managing
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">your pharmacy.</span>
              </h2>
              <p className="text-slate-400 text-base max-w-md leading-relaxed">
                Create your account and set up your medical store in minutes. Full inventory, billing, and reporting at your fingertips.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { icon: Store, label: "Complete Store Setup", desc: "Inventory, billing, purchases, reports" },
                  { icon: ShieldCheck, label: "Secure & Verified", desc: "Email OTP verification, encrypted passwords" },
                  { icon: Zap, label: "Instant Deployment", desc: "Ready to use in minutes" },
                ].map((f) => (
                  <div key={f.label} className="group flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06]">
                    <div className="p-1.5 rounded-lg bg-indigo-500/15 flex-shrink-0">
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
              { value: "Free", label: "No cost" },
              { value: "24/7", label: "Cloud access" },
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

      {/* Right panel - registration form / OTP */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12 bg-[var(--bg-body)] relative overflow-y-auto overflow-x-hidden transition-colors">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.03] blur-[100px]" />

        <div className="w-full max-w-[420px] relative z-10 animate-fade-in-scale">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <MedicalLogo size={40} />
            <h1 className="text-xl font-bold text-[var(--text-primary)]">MedStore ERP</h1>
          </div>

          <div className="bg-[var(--bg-card)] rounded-2xl sm:rounded-3xl shadow-xl border border-[var(--border-default)] p-6 sm:p-8 xl:p-10 transition-colors">
            {step === "form" ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    Create Account
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1.5">
                    Set up your pharmacy management system
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input id="name" label="Full Name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input id="email" label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Input id="storeName" label="Store Name (Optional)" type="text" placeholder="My Medical Store" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                  <Input id="password" label="Password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Input id="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  <Button type="submit" loading={loading} className="w-full py-3 text-sm font-semibold" size="lg">
                    {!loading && "Create Account"}
                    {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setStep("form"); setOtpDigits(["", "", "", "", "", ""]); }}
                  className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to form
                </button>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                    Verify your email
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)] mt-2 leading-relaxed">
                    We sent a 6-digit code to<br />
                    <span className="font-semibold text-[var(--text-primary)]">{email}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-2.5 sm:gap-3 mb-8">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                        if (pasted) handleOtpChange(0, pasted);
                      }}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
                        bg-[var(--bg-input)] text-[var(--text-primary)]
                        ${digit ? "border-indigo-500 shadow-md shadow-indigo-500/10" : "border-[var(--border-default)]"}
                        focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  loading={loading}
                  className="w-full py-3 text-sm font-semibold"
                  size="lg"
                  variant="success"
                >
                  {!loading && "Verify & Create Account"}
                  {!loading && <ShieldCheck className="h-4 w-4 ml-1" />}
                </Button>

                <div className="text-center mt-5">
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Didn&apos;t receive the code?{" "}
                    {resendCooldown > 0 ? (
                      <span className="text-[var(--text-secondary)] font-medium">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        className="text-indigo-500 font-semibold hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Resend OTP
                      </button>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-sm text-[var(--text-tertiary)] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
