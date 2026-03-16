"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Phone } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ArtisanLoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Phone State
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [demoHint, setDemoHint] = useState("");

  // ---- Handlers ----
  const handleSendOTP = async (e) => {
    e.preventDefault();
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
      redirect: false,
    });

    if (res?.error) {
       if (res.error.includes("unregistered_number")) {
         setError("Number not registered. Join as an Artisan via USSD or as a Partner below.");
       } else {
         setError("Invalid or expired code");
       }
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
            <div className="w-16 h-16 bg-[#CC5500] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-[#CC5500]/20 border border-[#CC5500]/20 mb-6 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-3xl leading-none tracking-tighter">V</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#1e2520] mb-2">
              Vocal<span className="text-[#CC5500]">Cred</span>
            </h1>
            <p className="text-gray-500 font-bold text-sm tracking-widest uppercase">Global Network Access</p>
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#2E8B57]"></div>

          <AnimatePresence mode="wait">
            <motion.div key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-black tracking-tight mb-2">SMS Sign In</h2>
                <p className="text-sm font-bold text-gray-500">We will send you a 6-digit confirmation code.</p>
              </div>

              {otpSent && demoHint && (
                <div className="mb-6 p-4 bg-[#2E8B57]/10 border border-[#2E8B57]/20 rounded-2xl text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#2E8B57] mb-1">Demo Mode Active</p>
                  <p className="text-sm font-bold text-[#1e2520]">Verification Code: <span className="text-lg font-black text-[#2E8B57] tracking-widest">{demoHint}</span></p>
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="flex flex-col gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 pl-2">Member Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.trim())}
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 text-[#1e2520] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/20 focus:border-[#2E8B57] transition-all text-sm font-bold"
                        placeholder="e.g. 08012345678"
                        required
                      />
                    </div>
                  </div>
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                      <p className="text-red-600 text-[10px] font-black tracking-widest uppercase mb-2">Access Denied</p>
                      <p className="text-red-900 text-xs font-bold leading-relaxed">
                        {error.includes("unregistered_number") 
                          ? "This number isn't in our network yet. If you are an artisan, please join via USSD first." 
                          : error}
                      </p>
                      {error.includes("unregistered_number") && (
                        <Link href="/demo" className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-[#CC5500] uppercase tracking-widest hover:underline">
                          Go to USSD Simulator →
                        </Link>
                      )}
                    </div>
                  )}
                  <button type="submit" disabled={loading} className="w-full py-5 rounded-full bg-[#1e2520] hover:bg-black text-white font-black text-sm tracking-widest uppercase shadow-lg transition-all flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="flex flex-col gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 pl-2">Security Code</label>
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
                  {error && <p className="text-red-500 text-[10px] font-black text-center tracking-widest uppercase">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full py-5 rounded-full bg-[#CC5500] hover:bg-[#b34a00] text-white font-black text-sm tracking-widest uppercase shadow-lg shadow-[#CC5500]/20 transition-all flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In to Hub"}
                  </button>
                  <button type="button" onClick={() => setOtpSent(false)} className="text-xs font-bold text-gray-400 hover:text-[#1e2520] uppercase tracking-widest text-center mt-2">
                    Use a different number
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
        
        <div className="mt-12 flex flex-col items-center gap-6">
           <div className="grid grid-cols-2 gap-4 w-full">
              <Link href="/demo" className="group flex flex-col p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#CC5500] transition-colors shadow-sm">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">For Artisans</span>
                <span className="text-xs font-black text-[#1e2520] group-hover:text-[#CC5500]">Join via USSD Demo</span>
              </Link>
              <Link href="/register/partner" className="group flex flex-col p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#2E8B57] transition-colors shadow-sm">
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">For Partners</span>
                <span className="text-xs font-black text-[#1e2520] group-hover:text-[#2E8B57]">Register Business</span>
              </Link>
           </div>
           
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">VocalCred Identity Node</p>
        </div>
      </div>
    </div>
  );
}
