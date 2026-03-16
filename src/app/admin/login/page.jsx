"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, Loader2, Mail, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyRequest = searchParams.get('verifyRequest');

  const [activeTab, setActiveTab] = useState("email"); // 'email', 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Email State
  const [email, setEmail] = useState("");
  
  // Admin State
  const [password, setPassword] = useState("");

  // ---- Handlers ----
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // NextAuth automatically handles the redirect to ?verifyRequest=1 if successful
    await signIn("email", { email, callbackUrl: '/dashboard' });
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("admin-login", {
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid security token");
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
            <div className="w-16 h-16 bg-[#1e2520] rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-black/20 border border-black/20 mb-6 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-8 h-8 text-[#CC5500]" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#1e2520] mb-2">
              Institution<span className="text-[#CC5500]">Portal</span>
            </h1>
            <p className="text-gray-500 font-bold text-sm">VocalCred Enterprise Access</p>
        </Link>

        {/* Tab Selector */}
        <div className="flex p-1 bg-gray-100 rounded-full mb-6 relative z-10">
          {['email', 'admin'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(""); }}
              className={`flex-1 py-2.5 text-xs font-black tracking-widest uppercase rounded-full transition-all ${
                activeTab === tab 
                  ? 'bg-white text-[#1e2520] shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'email' ? 'Magic Link' : 'Root Access'}
            </button>
          ))}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-500 ${
            activeTab === 'email' ? 'bg-[#3b82f6]' : 'bg-[#CC5500]'
          }`}></div>

          <AnimatePresence mode="wait">
            {/* Email Flow */}
            {activeTab === "email" && (
              <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                {verifyRequest ? (
                  <div className="flex flex-col items-center justify-center text-center py-4">
                    <div className="w-16 h-16 bg-[#3b82f6]/10 rounded-full flex items-center justify-center mb-6">
                      <Mail className="w-8 h-8 text-[#3b82f6]" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight mb-2">Check your email</h2>
                    <p className="text-sm font-bold text-gray-500 leading-relaxed">
                      A magic sign-in link has been sent to your restricted inbox. Click the link to instantly access your institutional dashboard.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-black tracking-tight mb-2">Evaluator Sign In</h2>
                      <p className="text-sm font-bold text-gray-500">Secure access for Judges and Banks.</p>
                    </div>
                    <form onSubmit={handleEmailLogin} className="flex flex-col gap-6">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 pl-2">Institution Email</label>
                        <div className="relative">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 text-[#1e2520] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all text-sm font-bold"
                            placeholder="judge@vocalcred.ai"
                            required
                          />
                        </div>
                      </div>
                      {error && <p className="text-red-500 text-xs font-bold text-center tracking-widest uppercase">{error}</p>}
                      <button type="submit" disabled={loading} className="w-full py-5 rounded-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black text-sm tracking-widest uppercase shadow-lg shadow-[#3b82f6]/20 transition-all flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Magic Link"}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

            {/* Admin Flow */}
            {activeTab === "admin" && (
              <motion.div key="admin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-black tracking-tight mb-2">Admin Gateway</h2>
                  <p className="text-sm font-bold text-gray-500">Access the system management console.</p>
                </div>
                <form onSubmit={handleAdminLogin} className="flex flex-col gap-6">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 pl-2">Security Token</label>
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-14 pr-6 text-[#1e2520] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC5500]/20 focus:border-[#CC5500] transition-all text-sm font-bold"
                        placeholder="Enter password..."
                        required
                      />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-xs font-bold text-center tracking-widest uppercase">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full py-5 rounded-full bg-[#1e2520] hover:bg-black text-white font-black text-sm tracking-widest uppercase shadow-lg transition-all flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Authenticate <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        
        <p className="text-center mt-8 text-xs font-bold text-gray-400 flex flex-col gap-1 items-center">
          <span>VocalCred Admin Access Node</span>
          <span className="text-[#CC5500]">Restricted Zone</span>
        </p>
      </div>
    </div>
  );
}
