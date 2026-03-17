"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Smartphone } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserCard from "@/components/UserCard";
import USSDSimulator from "@/components/USSDSimulator";
import DashboardNav from "@/components/DashboardNav";
import Footer from "@/components/Footer";

export default function FindArtisansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSimulator, setShowSimulator] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // Redirect Artisans away from the global directory
    if (session?.user?.role === "ARTISAN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setUsers(data);
          } else {
            console.error("Users API returned non-array data:", data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchUsers();
  }, [session]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const query = searchQuery.toLowerCase();
      return (
        user.vocalcred_id?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.skill?.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery]);

  if (status === "loading" || !session || session.user.role === "ARTISAN") {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#CC5500] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1e2520] font-sans selection:bg-[#2E8B57]/30">
      
      <DashboardNav 
        user={session?.user} 
        showSimulator={showSimulator} 
        setShowSimulator={setShowSimulator} 
      />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-12 flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
              Find <span className="text-[#CC5500]">Artisans</span>
            </h1>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-[0.2em]">
              Verified Network Directory
            </p>
          </div>

          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID, MSISDN, or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-gray-100 rounded-full py-4 pl-14 pr-6 text-[#1e2520] placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[#CC5500]/10 focus:border-[#CC5500] transition-all text-sm font-bold shadow-sm"
            />
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm self-start">
          <div className="w-2 h-2 rounded-full bg-[#2E8B57] animate-pulse"></div>
          <span className="text-[10px] font-black tracking-widest text-[#1e2520] uppercase">
            {filteredUsers.length} Verified Artisans Discovered
          </span>
        </div>

        {/* Main Grid Area */}
        <section className="flex flex-col lg:flex-row gap-8 items-start relative pb-20">
          <div className="flex-1 w-full min-h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-32 gap-6 bg-white border border-gray-100 rounded-[3rem] shadow-sm">
                <Loader2 className="w-12 h-12 text-[#CC5500] animate-spin" />
                <p className="font-black tracking-widest text-gray-400 uppercase text-sm">Syncing Directory...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-32 border-2 border-gray-200 border-dashed rounded-[3rem] bg-white shadow-sm flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-3xl font-black text-[#1e2520] tracking-tight mb-2">No Matches Found</p>
                <p className="text-gray-500 max-w-md font-bold text-sm">Try searching for a different skill or VocalCred ID.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredUsers.map((user) => (
                    <UserCard key={user.phone} user={user} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showSimulator && (
              <motion.div 
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.98 }}
                className="w-full lg:w-[360px] h-fit sticky top-28 z-40"
              >
                <USSDSimulator />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>
      <Footer />
    </div>
  );
}
