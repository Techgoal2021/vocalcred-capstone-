"use client";

import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1e2520] text-white pt-16 md:pt-24 pb-8 md:pb-12 w-full relative overflow-hidden mt-10">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-12">
          
          {/* Column 1: Brand & Socials */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[#CC5500] rounded-[0.8rem] flex items-center justify-center shadow-lg shadow-[#CC5500]/20">
                <span className="text-white font-black text-xl leading-none tracking-tighter">V</span>
              </div>
              <span className="font-black tracking-tight text-3xl">VocalCred</span>
            </div>
            <p className="text-gray-400 font-bold text-sm max-w-[280px] leading-relaxed">
              Empowering the informal economy with verifiable Trust-as-a-Service. Real reputation, backed by community data.
            </p>
            
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#CC5500] hover:border-[#CC5500] transition-all shadow-lg group shrink-0">
                <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#CC5500] hover:border-[#CC5500] transition-all shadow-lg group shrink-0">
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#CC5500] hover:border-[#CC5500] transition-all shadow-lg group shrink-0">
                <span className="font-extrabold text-sm group-hover:scale-110 transition-transform">X</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#CC5500] hover:border-[#CC5500] transition-all shadow-lg group shrink-0">
                <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Column 2: Products */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-sm font-black text-white mb-2">Products</h4>
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-sm font-bold text-gray-400 hover:text-[#CC5500] transition-colors">SMEs</a>
              <a href="#" className="text-sm font-bold text-gray-400 hover:text-[#CC5500] transition-colors">Enterprise</a>
              <a href="#" className="text-sm font-bold text-gray-400 hover:text-[#CC5500] transition-colors whitespace-nowrap">Paga x PayPal</a>
            </nav>
          </div>

          {/* Column 3: Help & Support */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h4 className="text-sm font-black text-white mb-2">Help & Support</h4>
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-sm font-bold text-gray-400 hover:text-[#CC5500] transition-colors">FAQs</a>
              <a href="#" className="text-sm font-bold text-gray-400 hover:text-[#CC5500] transition-colors whitespace-nowrap">X Support Page</a>
            </nav>
          </div>

          {/* Column 4: Contact Information */}
          <div className="md:col-span-4 flex flex-col gap-5 bg-white/5 p-6 rounded-2xl border border-white/10 w-full h-fit">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#CC5500] mb-2">Contact Us</h4>
            
            <a href="mailto:hello@vocalcred.com" className="flex items-center gap-4 text-sm font-bold text-gray-300 hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#CC5500]/20 text-gray-400 group-hover:text-[#CC5500] transition-all">
                <Mail className="w-3.5 h-3.5" />
              </div>
              hello@vocalcred.com
            </a>
            
            <a href="https://wa.me/234800000000" className="flex items-center gap-4 text-sm font-bold text-gray-300 hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#2E8B57]/20 text-gray-400 group-hover:text-[#2E8B57] transition-all">
                <Phone className="w-3.5 h-3.5" />
              </div>
              +234 (0) 800 VOCALCRED
            </a>
            
            <div className="flex items-center gap-4 text-sm font-bold text-gray-300">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-gray-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span>10 Innovation Drive, Lagos, Nigeria</span>
            </div>
          </div>
          
        </div>
        
        <div className="w-full h-px bg-white/10 mb-8"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} VocalCred Inc.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
