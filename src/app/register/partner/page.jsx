"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Phone, Building2, Star, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function PartnerRegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Registration State
  const [step, setStep] = useState(1); // 1: Business Details, 2: OTP
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [demoHint, setDemoHint] = useState("");

  // ---- Handlers ----
  const handleStartOnboarding = async (e) => {
    e.preventDefault();
    if (!businessName || !businessType || !phone) {
        setError("Please provide all details");
        return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      if (data.demoCode) {
        setDemoHint(data.demoCode);
      }
      setStep(2);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("phone-otp", {
      phone,
      code: otpCode,
      role: "CLIENT",
      businessName: businessName,
      businessType: businessType,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid or expired code");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        {/* Logo and Branding Header */}
        <Link href="/" className="flex flex-col items-center mb-8 text-center group cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-16 h-16 bg-[#2E8B57] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-[#2E8B57]/20 border border-[#2E8B57]/20 mb-6 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-3xl leading-none tracking-tighter">V</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#1e2520] mb-2">
              Vocal<span className="text-[#2E8B57]">Cred</span>
            </h1>
            <p className="text-gray-500 font-bold text-sm tracking-widest uppercase">Partner Network Access</p>
        </Link>

        {/* Registration Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2E8B57]"></div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="mb-8">
                  <h2 className="text-2xl font-black tracking-tight mb-2">Partner Onboarding</h2>
                  <p className="text-sm font-bold text-gray-500">Create your business profile to start hiring verified experts.</p>
                </div>

                <form onSubmit={handleStartOnboarding} className="flex flex-col gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 pl-2">Business or Full Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 text-[#1e2520] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all text-sm font-bold"
                        placeholder="e.g. Lagos Construction Ltd"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 pl-2">What do you do?</label>
                    <div className="relative">
                      <Star className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 text-[#1e2520] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all text-sm font-bold"
                        placeholder="e.g. Hiring Experts, Real Estate..."
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 pl-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.trim())}
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 text-[#1e2520] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all text-sm font-bold"
                        placeholder="08012345678"
                        required
                      />
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-xs font-bold text-center tracking-widest uppercase">{error}</p>}
                  
                  <button type="submit" disabled={loading} className="w-full py-5 rounded-full bg-[#1e2520] hover:bg-black text-white font-black text-sm tracking-widest uppercase shadow-lg transition-all flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to Verification"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-black tracking-tight mb-2">Verify Phone</h2>
                  <p className="text-sm font-bold text-gray-500">Enter the 6-digit code sent to {phone}</p>
                </div>

                {demoHint && (
                  <div className="mb-6 p-4 bg-[#2E8B57]/10 border border-[#2E8B57]/20 rounded-2xl text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#2E8B57] mb-1">Demo Mode Active</p>
                    <p className="text-sm font-bold text-[#1e2520]">Verification Code: <span className="text-lg font-black text-[#2E8B57] tracking-widest">{demoHint}</span></p>
                  </div>
                )}

                <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 pl-2">Verification Code</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.trim())}
                      className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 px-6 text-center text-[#1e2520] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all text-lg font-black tracking-[0.5em]"
                      placeholder="••••••"
                      maxLength={6}
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs font-bold text-center tracking-widest uppercase">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full py-5 rounded-full bg-[#2E8B57] hover:bg-[#236e44] text-white font-black text-sm tracking-widest uppercase shadow-lg transition-all flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Complete Profile"}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-gray-500 hover:text-[#1e2520] uppercase tracking-widest text-center mt-2">
                    Edit details
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        
        <p className="text-center mt-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
            Identity Verified • Globally Linked
        </p>
      </div>
    </div>
  );
}
