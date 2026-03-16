"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Phone, Star, CheckCircle, Activity, Globe2, Shield, X, QrCode, UserPlus, Building2, Briefcase, Wallet, Code } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function LandingPage() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Demo", href: "/demo" },
    { name: "Sign In", href: "/login" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1e2520] font-sans selection:bg-[#2E8B57]/30 overflow-x-hidden relative">
      
      {/* Fixed Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#CC5500] rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-[#CC5500]/20 border border-[#CC5500]/20">
              <span className="text-white font-black text-2xl leading-none tracking-tighter">V</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-[#1e2520]">
              Vocal<span className="text-[#CC5500]">Cred</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login"
              className="px-6 py-2.5 rounded-full font-black text-sm tracking-widest uppercase text-[#1e2520] hover:text-[#CC5500] transition-colors"
            >
              Sign In
            </Link>
            <button 
              onClick={() => setIsJoinModalOpen(true)}
              className="px-6 py-2.5 rounded-full bg-[#CC5500] hover:bg-[#b34a00] text-white font-black text-sm tracking-widest uppercase shadow-lg shadow-[#CC5500]/20 transition-transform hover:scale-105"
            >
              Join Network
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-[#1e2520]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <div className="flex flex-col gap-1.5"><div className="w-6 h-0.5 bg-[#1e2520]"></div><div className="w-6 h-0.5 bg-[#1e2520]"></div><div className="w-6 h-0.5 bg-[#1e2520]"></div></div>}
          </button>
        </div>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-6">
                {menuItems.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className="text-lg font-black uppercase tracking-widest text-[#1e2520]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsJoinModalOpen(true);
                  }}
                  className="w-full py-4 rounded-full bg-[#CC5500] text-white font-black text-sm tracking-widest uppercase shadow-lg"
                >
                  Join Network
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-36 pb-20 md:pb-32 overflow-hidden">
        {/* Decorative Gradients - Enhanced Burnt Orange */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#CC5500]/15 to-[#2E8B57]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#CC5500]/10 to-transparent rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CC5500]/10 border border-[#CC5500]/20 w-fit">
              <ShieldCheck className="w-4 h-4 text-[#CC5500]" />
              <span className="text-xs font-black tracking-widest uppercase text-[#CC5500]">Trust-as-a-Service</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] text-[#1e2520]">
              Reputation as <br/>
              <span className="text-[#CC5500]">Collateral.</span>
            </h1>
            
            <p className="text-xl text-gray-500 font-bold max-w-lg leading-relaxed">
              VocalCred is building the verifiable trust layer for the informal economy using USSD, precise AI Voice matching, and community-driven rating protocols.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <Link 
                href="/demo"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#CC5500] hover:bg-[#b34a00] text-white font-black text-sm tracking-widest uppercase shadow-xl shadow-[#CC5500]/20 transition-all flex items-center justify-center gap-2 group transform hover:scale-105"
              >
                Try Interactive Demo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
              <Globe2 className="w-4 h-4 text-[#CC5500]" /> Available via USSD (*384*43029#)
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[600px] w-full"
          >
            {/* The "Bank View" Mockup Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 z-20">
               <div className="flex items-start justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <img src="/artisan_elec.png" alt="Leon - Electrician" className="w-16 h-16 rounded-2xl bg-gray-50 object-cover border-2 border-[#CC5500]/20 shadow-md" />
                    <div>
                      <h3 className="text-xl font-black">Leon (VC-408)</h3>
                      <p className="text-sm font-bold text-[#CC5500]">Master Electrician</p>
                    </div>
                 </div>
                 <div className="px-3 py-1 rounded-full bg-[#CC5500]/10 text-[#CC5500] text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                   <CheckCircle className="w-3 h-3" /> Verified
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-gray-50 rounded-[1.5rem] p-4 border border-gray-100/50">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Avg Rating</div>
                    <div className="flex items-center gap-1 text-2xl font-black text-[#1e2520]">
                      4.9 <Star className="w-5 h-5 text-[#CC5500] fill-current" />
                    </div>
                 </div>
                 <div className="bg-gray-50 rounded-[1.5rem] p-4 border border-gray-100/50">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Jobs Done</div>
                    <div className="text-2xl font-black">342</div>
                 </div>
               </div>

               <div className="flex flex-col gap-2">
                 <p className="text-xs font-bold uppercase tracking-widest text-[#2E8B57]">Bankable Metrics</p>
                 <div className="w-full bg-[#2E8B57]/10 rounded-full h-3 overflow-hidden">
                   <div className="bg-[#2E8B57] h-full w-[85%] rounded-full"></div>
                 </div>
                 <div className="flex justify-between text-sm font-bold mt-1">
                   <span className="text-gray-400">Low Risk</span>
                   <span className="text-[#1e2520]">VocalCred Score: 785</span>
                 </div>
               </div>
            </div>

            {/* Background floating elements supporting the mockup */}
            <div className="absolute top-10 right-0 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 rotate-6 z-10 flex gap-3 items-center">
              <Activity className="w-8 h-8 text-[#CC5500]" />
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time Validation</div>
                <div className="text-lg font-black text-[#1e2520]">Immutable Ratings</div>
              </div>
            </div>

            <div className="absolute bottom-10 left-0 p-4 bg-[#CC5500] rounded-2xl shadow-2xl -rotate-6 z-30 flex gap-3 items-center text-white">
              <Phone className="w-8 h-8 text-white" />
              <div>
                <div className="text-[10px] font-black text-white/70 uppercase tracking-widest">USSD Offline Native</div>
                <div className="text-lg font-black">No App Required</div>
              </div>
            </div>
            
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-white py-32 border-t border-gray-100 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-[#1e2520]">How VocalCred Works</h2>
            <p className="text-lg font-bold text-gray-500 max-w-2xl mx-auto">
              A frictionless trust loop designed exclusively for the informal sector. Rated by the community, verified by AI, backed by real-world history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-[0_20px_40px_rgba(204,85,0,0.1)] hover:border-[#CC5500]/20 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8 text-[#CC5500]" />
              </div>
              <h3 className="text-2xl font-black mb-4">1. USSD Onboarding</h3>
              <p className="text-gray-500 font-bold leading-relaxed">
                Artisans dial *384*43029# to join. No smartphones, emails, or expensive data plans required. We create their digital identity instantly via MSISDN.
              </p>
            </div>

            <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-[0_20px_40px_rgba(46,139,87,0.1)] hover:border-[#2E8B57]/20 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-[#2E8B57]" />
              </div>
              <h3 className="text-2xl font-black mb-4">2. Trust Capture</h3>
              <p className="text-gray-500 font-bold leading-relaxed">
                After completing a job, the artisan initiates a rating request. The client receives an SMS and rates their experience 1-5 via text or Voice IVR.
              </p>
            </div>

            <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-[0_20px_40px_rgba(204,85,0,0.1)] hover:border-[#CC5500]/20 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-[#CC5500]" />
              </div>
              <h3 className="text-2xl font-black mb-4">3. Reputation Analytics</h3>
              <p className="text-gray-500 font-bold leading-relaxed">
                Our AI consolidates ratings, voice biometrics, and repeat businesses into a definitive "VocalCred Score." A perfect proxy for financial credit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products & Solutions Section */}
      <section className="py-24 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2E8B57]/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CC5500]/10 border border-[#CC5500]/20 text-[#CC5500] text-[10px] font-black tracking-widest uppercase mb-4">
                <Globe2 className="w-3 h-3" />
                VocalCred Ecosystem
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-[#1e2520] tracking-tight mb-4">
                Trust infrastructure for the <span className="text-[#2E8B57]">informal economy.</span>
              </h2>
            </div>
            <p className="text-gray-500 font-bold max-w-sm md:text-right">
              Scalable, inclusive tools designed to turn street reputation into bankable data for individuals, businesses, and institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product 1: Core Consumer App */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all group">
              <div className="w-14 h-14 bg-[#2E8B57]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-[#2E8B57]" />
              </div>
              <h3 className="text-xl font-black text-[#1e2520] mb-3">VocalCred Verify</h3>
              <p className="text-sm font-bold text-gray-500 leading-relaxed mb-6">
                The public directory where users search for artisans, see their Trust Score, and listen to authentic audio reviews. Free to search, premium for guaranteed bookings.
              </p>
              <div className="text-xs font-black uppercase tracking-widest text-[#2E8B57]">For Individuals & SMEs</div>
            </div>

            {/* Product 2: Escrow */}
            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-[#CC5500]"></div>
              <div className="w-14 h-14 bg-[#CC5500]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-[#CC5500]" />
              </div>
              <h3 className="text-xl font-black text-[#1e2520] mb-3 flex items-center gap-2">
                Paga x PayPal
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[9px] rounded-full uppercase tracking-wider">Escrow</span>
              </h3>
              <p className="text-sm font-bold text-gray-500 leading-relaxed mb-6">
                A secure milestone payment gateway built directly into verbal agreements. We hold funds in escrow until the artisan finishes the job, protecting both parties.
              </p>
              <div className="text-xs font-black uppercase tracking-widest text-[#CC5500]">Secure Payments</div>
            </div>

            {/* Product 3: Enterprise API */}
            <div className="bg-[#1e2520] rounded-[2rem] p-8 shadow-xl hover:-translate-y-2 transition-all group overflow-hidden relative">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">Trust-as-a-Service API</h3>
              <p className="text-sm font-bold text-gray-400 leading-relaxed mb-6">
                A robust programmatic API for gig-economy startups and massive tech enterprises to query an informal worker's real-world behavioral reliability score instantly.
              </p>
              <div className="text-xs font-black uppercase tracking-widest text-white/50">For Enterprise & Fintech</div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Join Network Modal */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsJoinModalOpen(false)}
            />
                        <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setIsJoinModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Side: Artisan */}
              <div className="flex-1 p-8 border-r border-gray-100 flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-[#CC5500]/10 rounded-2xl flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-[#CC5500]" />
                </div>
                <div>
                  <h3 className="text-xl font-black mb-1">I am an Artisan</h3>
                  <p className="text-xs font-bold text-gray-500">I want to build my reputation and find work.</p>
                </div>
                <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 relative">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 mt-1">Dial USSD Code:</div>
                  <div className="text-2xl font-black text-[#1e2520] tracking-widest">*384*43029#</div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">No internet or smartphone required.</p>
              </div>

              {/* Right Side: Partner */}
              <div className="flex-1 p-8 bg-gray-50 flex flex-col items-center text-center gap-6">
                <div className="w-16 h-16 bg-[#2E8B57]/10 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-[#2E8B57]" />
                </div>
                <div>
                  <h3 className="text-xl font-black mb-1">I am a Partner</h3>
                  <p className="text-xs font-bold text-gray-500">I want to hire verified experts for my projects.</p>
                </div>
                <Link 
                  href="/register/partner"
                  className="w-full py-4 rounded-2xl bg-[#1e2520] hover:bg-black text-white font-black text-xs tracking-widest uppercase shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Create Partner Account <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[10px] font-black uppercase text-gray-400">Trusted By</div>
                  <div className="flex gap-4 grayscale opacity-40 invert scale-75">
                    <span className="font-black text-[8px]">AFRICA'S TALKING</span>
                    <span className="font-black text-[8px]">GOOGLE CLOUD</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
