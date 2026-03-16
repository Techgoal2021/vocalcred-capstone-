"use client";

import USSDSimulator from "@/components/USSDSimulator";
import AITrustLab from "@/components/AITrustLab";
import { Mic, ShieldCheck, Globe2, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1e2520] font-sans overflow-x-hidden">
      {/* Premium Header */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-[#CC5500] transition-colors" />
          <span className="text-sm font-black tracking-widest uppercase text-gray-400 group-hover:text-[#CC5500]">Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">System Live</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-24">
        
        {/* Hero Section of Demo */}
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              Test the <span className="text-[#CC5500]">Future</span> <br/> of Trust.
            </h1>
            <p className="text-xl text-gray-500 font-medium">
              Everyone in the room can now interact with VocalCred. <br className="hidden md:block"/> 
              Try our two Interactive Stations below.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Station 1: USSD */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#CC5500] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#CC5500]/20">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Station 1: USSD Protocol</h2>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Bilingual & Security Core</p>
              </div>
            </div>
            
            <p className="text-gray-500 font-medium">
              Dial the protocol code below. Explore <span className="text-[#CC5500] font-black">5 Nigerian languages</span> and see the <span className="text-[#2E8B57] font-black">SIM-Swap audit</span> in action during registration.
            </p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center lg:justify-start"
            >
              <USSDSimulator />
            </motion.div>
          </div>

          {/* Station 2: AI Voice */}
          <div className="flex flex-col gap-8">
             <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Station 2: AI Trust Lab</h2>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Powered by Gemini 1.5 Flash</p>
              </div>
            </div>

            <p className="text-gray-500 font-medium">
              Record a 5-second voice sample. Our AI backend will analyze your <span className="text-blue-600 font-black">emotional tone</span> and <span className="text-blue-600 font-black">professional reliability</span> instantly.
            </p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <AITrustLab />
            </motion.div>
          </div>
        </div>

      </main>

      {/* Footer Branding */}
      <footer className="py-12 flex flex-col items-center gap-4">
          <div className="text-gray-300 text-[10px] font-black tracking-[0.4em] uppercase">VocalCred Security Node</div>
          <div className="flex gap-8 opacity-30 grayscale invert">
            {/* Logotypes placeholders */}
            <span className="text-xs font-black">AFRICA'S TALKING</span>
            <span className="text-xs font-black">GOOGLE CLOUD</span>
          </div>
      </footer>
    </div>
  );
}
