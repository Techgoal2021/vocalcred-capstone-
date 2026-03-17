"use client";

import { Bell, LogOut, User as UserIcon, Globe2, LayoutDashboard, Search, Smartphone, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav({ user, showSimulator, setShowSimulator }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isClient = user?.role === "CLIENT" || user?.role === "admin";

  const navItems = [
    { 
      name: "Overview", 
      href: "/dashboard", 
      icon: LayoutDashboard,
      show: true 
    },
    { 
      name: "Find Artisans", 
      href: "/dashboard/find", 
      icon: Search,
      show: isClient 
    }
  ];

  return (
    <nav className="fixed top-0 inset-x-0 w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-[#CC5500] rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-[#CC5500]/20 border border-[#CC5500]/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-2xl leading-none tracking-tighter">V</span>
            </div>
            <span className="font-black text-2xl tracking-tight text-[#1e2520]">
              Vocal<span className="text-[#CC5500]">Cred</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.filter(item => item.show).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? "bg-[#CC5500]/10 text-[#CC5500]" 
                      : "text-gray-500 hover:text-[#1e2520] hover:bg-gray-50"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "text-[#CC5500]" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <button className="text-gray-400 hover:text-[#1e2520] transition-colors relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#2E8B57] rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-gray-200 mx-2"></div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-[#1e2520] leading-none mb-1">
                  {user?.name || (user?.role === "CLIENT" ? "Partner Node" : "Artisan Partner")}
                </span>
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                  {user?.role === "CLIENT" ? "Partner Hub" : "Artisan Hub"}
                </span>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-12 h-12 rounded-[1.25rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all group"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-500 hover:text-[#1e2520]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              {/* Profile in Mobile Menu */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-gray-50 rounded-[1.25rem] flex items-center justify-center border border-gray-100">
                  <UserIcon className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-black text-[#1e2520]">
                    {user?.name || (user?.role === "CLIENT" ? "Partner Node" : "Artisan Partner")}
                  </div>
                  <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                    {user?.role === "CLIENT" ? "Partner Hub" : "Artisan Hub"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {navItems.filter(item => item.show).map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-4 rounded-2xl text-base font-black tracking-widest uppercase transition-all ${
                        isActive 
                          ? "bg-[#CC5500]/10 text-[#CC5500]" 
                          : "text-gray-500 hover:bg-gray-50 hover:text-[#1e2520]"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? "text-[#CC5500]" : "text-gray-400"}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4 pt-6 border-t border-gray-100">
                <button className="flex items-center gap-3 p-4 text-gray-500 font-black tracking-widest uppercase text-left">
                  <Bell className="w-5 h-5 text-gray-400" />
                  Notifications
                </button>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-3 p-4 text-red-500 font-black tracking-widest uppercase text-left bg-red-50 rounded-2xl"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

