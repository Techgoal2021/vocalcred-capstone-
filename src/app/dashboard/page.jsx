"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Bell, User as UserIcon, Smartphone, LogOut, Briefcase, Star, ShieldAlert, Activity, QrCode, Share2, TrendingUp, Award, CheckCircle, Edit3, X, Camera, Instagram, Twitter, Globe, Image as ImageIcon, Plus, Trash2, ChevronRight, MessageSquare } from "lucide-react";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UserCard from "@/components/UserCard";
import USSDSimulator from "@/components/USSDSimulator";
import DashboardNav from "@/components/DashboardNav";
import Footer from "@/components/Footer";

function StatCard({ title, value, icon: Icon, colorClass, borderClass }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border-2 ${borderClass} group hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex flex-col gap-1">
          <span className="text-gray-500 text-xs font-black uppercase tracking-widest">{title}</span>
          <span className={`text-4xl font-black ${colorClass}`}>{value}</span>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: session, status } = useSession();
  const router = useRouter();

  const currentUser = useMemo(() => {
    return users.find((u) => u.phone === session?.user?.phone);
  }, [users, session]);

  const filteredUsers = users.filter((u) => 
    u.phone.includes(searchQuery) || (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) || (u.vocalcred_id && u.vocalcred_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Edit Profile State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    skill: "",
    bio: "",
    instagram: "",
    twitter: "",
    website: ""
  });

  useEffect(() => {
     if (currentUser) {
        setEditForm({
           name: currentUser.name || "",
           skill: currentUser.skill || "",
           bio: currentUser.bio || "",
           instagram: currentUser.instagram || "",
           twitter: currentUser.twitter || "",
           website: currentUser.website || ""
        });
     }
  }, [currentUser]);

  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [showSocialLinks, setShowSocialLinks] = useState(false);

  const handlePortfolioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPortfolioLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", prompt("Enter a caption for this work (e.g., 'Custom Oak Cabinet')") || "");
    formData.append("type", "PRODUCT");

    try {
      const res = await fetch("/api/upload-portfolio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      window.location.reload();
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Failed to upload portfolio item.");
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Update failed");
      
      setIsEditModalOpen(false);
      window.location.reload(); 
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update profile.");
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const [showSimulator, setShowSimulator] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (status !== "authenticated") return;
      try {
        const res = await fetch(`/api/users`);
        if (res.status === 401) {
          signOut({ callbackUrl: '/login' });
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Users API returned non-array data:", data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, [status]);



  const stats = useMemo(() => {
    if (users.length === 0) return { total: 0, avgRating: 0, avgScore: 0, unverified: 0 };
    let totalRating = 0, totalScore = 0, unverified = 0;
    
    // Filter out users who haven't completed registration (no vocalcred_id)
    const validUsers = users.filter(u => u.vocalcred_id);
    
    validUsers.forEach(u => {
      totalRating += (u.avg_rating || 0);
      totalScore += (u.reputation || 0);
      if (!u.has_voice) unverified++;
    });
    
    const count = validUsers.length || 1; // prevent div by 0
    
    return {
      total: validUsers.length,
      avgRating: (totalRating / count).toFixed(1),
      avgScore: Math.round(totalScore / count),
      unverified
    };
  }, [users]);

  if (status === "loading" || status === "unauthenticated") {
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

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-12 flex flex-col gap-6 md:gap-10">
        
        {/* Role-Specific Hero Section */}
        {session?.user?.role === "ARTISAN" ? (
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            <div className="flex-1 bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between min-h-fit md:min-h-[500px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#CC5500]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CC5500]/10 border border-[#CC5500]/20 text-[#CC5500] text-[10px] font-black tracking-widest uppercase">
                    <Award className="w-3 h-3" />
                    Verified Identity Network
                  </div>
                  <div className="flex gap-2">
                    {currentUser?.instagram && (
                      <a href={currentUser.instagram.startsWith('http') ? currentUser.instagram : `https://instagram.com/${currentUser.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl hover:text-[#CC5500] transition-colors">
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {currentUser?.twitter && (
                      <a href={currentUser.twitter.startsWith('http') ? currentUser.twitter : `https://twitter.com/${currentUser.twitter}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl hover:text-[#CC5500] transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {currentUser?.website && (
                      <a href={currentUser.website.startsWith('http') ? currentUser.website : `https://${currentUser.website}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-xl hover:text-[#CC5500] transition-colors">
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-[#1e2520] mb-4 uppercase">
                  Hello, <span className="text-[#CC5500]">{session?.user?.name?.split(' ')[0]}</span>
                </h2>
                
                <div className="flex flex-col gap-4 max-w-xl">
                  <p className="text-xl font-black text-[#1e2520] leading-tight">
                    {currentUser?.skill || "Professional Artisan"}
                  </p>
                  <p className="text-base font-bold text-gray-500 leading-relaxed italic">
                    {currentUser?.bio || "I am a verified artisan on VocalCred. Hire me for reliable and quality service."}
                  </p>
                </div>
                
                <div className="mt-8 flex flex-wrap gap-4">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1e2520] text-white hover:bg-black transition-all text-xs font-black tracking-widest uppercase shadow-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit My Profile
                  </button>
                  
                  {/* Digital Identity QR / Share remains for Partners to verify */}
                  <button 
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 text-[#1e2520] hover:border-[#CC5500] hover:text-[#CC5500] transition-all text-xs font-black tracking-widest uppercase shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share My ID Card
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 z-10 pt-8 border-t border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">VocalCred ID</span>
                  <span className="text-xl font-black text-[#1e2520]">{currentUser?.vocalcred_id || "NOT SET"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trust Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-[#2E8B57]">{currentUser?.reputation || 0}</span>
                    <TrendingUp className="w-4 h-4 text-[#2E8B57]" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-[#fbbf24]">{currentUser?.avg_rating?.toFixed(1) || "0.0"}</span>
                    <Star className="w-4 h-4 text-[#fbbf24] fill-current" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Jobs Done</span>
                  <span className="text-xl font-black text-[#1e2520]">{currentUser?.jobs_completed || 0}</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[360px] bg-[#1e2520] rounded-[2rem] md:rounded-[3rem] p-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
               <div className="relative z-10 flex flex-col h-full items-center text-center justify-between">
                  <div>
                    <h3 className="text-xl font-black mb-2">My Profile</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Share your reputation</p>
                  </div>

                  <div className="my-8 w-48 h-48 bg-white rounded-3xl p-4 flex items-center justify-center shadow-2xl relative">
                    <QrCode className="w-full h-full text-[#1e2520]" />
                    <div className="absolute inset-0 flex items-center justify-center bg-[#CC5500]/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer">
                      <Share2 className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#2E8B57] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Encrypted
                      </span>
                    </div>
                    <button className="w-full py-4 bg-white text-[#1e2520] rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-gray-200 transition-colors shadow-lg">
                      Copy Profile Link
                    </button>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard title="Total Artisans" value={stats.total} icon={Briefcase} colorClass="text-[#1e2520]" borderClass="border-gray-100" />
            <StatCard title="Avg Network Rating" value={stats.avgRating} icon={Star} colorClass="text-[#fbbf24]" borderClass="border-[#fbbf24]/20" />
            <StatCard title="Avg VocalCred Score" value={stats.avgScore} icon={Activity} colorClass="text-[#2E8B57]" borderClass="border-[#2E8B57]/20" />
            <StatCard title={session?.user?.role === "CLIENT" ? "Verified Status" : "Missing Voice Profile"} value={session?.user?.role === "CLIENT" ? "TIER 1" : stats.unverified} icon={ShieldAlert} colorClass="text-[#CC5500]" borderClass="border-[#CC5500]/20" />
          </div>
        )}

        {/* Content Section: Dashboard Overviews */}
        <section className="flex flex-col lg:flex-row gap-8 items-start relative pb-20">
          <div className="flex-1 w-full min-h-[400px]">
            {session?.user?.role === "CLIENT" ? (
              /* Partner Welcome & Call to Action */
              <div className="flex flex-col gap-8">
                <div className="bg-white border border-gray-100 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-10">
                   <div className="w-20 h-20 md:w-32 md:h-32 bg-[#CC5500]/5 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center flex-shrink-0 border border-[#CC5500]/10">
                      <Search className="w-8 h-8 md:w-12 md:h-12 text-[#CC5500]" />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-4 text-[#1e2520]">Ready to hire?</h2>
                      <p className="text-gray-500 font-medium mb-6 md:mb-8 max-w-xl text-sm md:text-base">
                        Explore our verified community. Filter by skill, reputation score, and real-time reliability metrics to find the perfect expert for your project.
                      </p>
                      <button 
                        onClick={() => router.push('/dashboard/find')}
                        className="w-full md:w-auto px-8 py-4 bg-[#CC5500] text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-[#b34a00] transition-all shadow-lg hover:scale-105 active:scale-95"
                      >
                        Enter Artisan Directory
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Smartphone className="w-5 h-5" /></div>
                      <h3 className="font-black text-sm mb-2">Request Ratings</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Dial USSD to verify work</p>
                   </div>
                   <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm opacity-50">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4"><Star className="w-5 h-5" /></div>
                      <h3 className="font-black text-sm mb-2">Project History</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Coming soon in TIER 2</p>
                   </div>
                   <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm opacity-50">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4"><Briefcase className="w-5 h-5" /></div>
                      <h3 className="font-black text-sm mb-2">Payer Profile</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Earn your rating today</p>
                   </div>
                </div>
              </div>
            ) : (
              /* Artisan Dashboard View - Digital Storefront */
               <div className="flex flex-col gap-10">
                  {/* Portfolio Section */}
                  <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-12 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight text-[#1e2520]">Photos of My Work</h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Pictures for my customers</p>
                      </div>
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-[#CC5500] transition-colors shadow-sm"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {currentUser?.portfolio?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentUser.portfolio.map((item, idx) => (
                          <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative aspect-square rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm"
                          >
                            <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                              <p className="text-white text-sm font-bold">{item.caption}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                          <Plus className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="font-black text-[#1e2520]">Show proof of your work</h4>
                        <p className="text-xs font-bold text-gray-400 mt-2 max-w-xs">Upload pictures of things you have made or fixed. Customers trust what they can see!</p>
                        <button 
                          onClick={() => setIsEditModalOpen(true)}
                          className="mt-6 px-6 py-3 rounded-xl bg-gray-50 text-gray-400 font-black text-[10px] tracking-widest uppercase hover:text-[#CC5500] transition-all"
                        >
                          Add My First Photo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Achievements and Trust Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Achievements */}
                    <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-10 shadow-sm">
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#CC5500]" />
                        My Achievements
                      </h3>
                      <div className="flex flex-col gap-6">
                        {currentUser?.achievements?.length > 0 ? (
                          currentUser.achievements.map((ach) => (
                            <div key={ach.id} className="flex gap-4 items-start">
                              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-[#2E8B57]" />
                              </div>
                              <div>
                                <p className="font-black text-sm text-[#1e2520]">{ach.title}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                  {ach.date ? new Date(ach.date).toLocaleDateString() : 'Verified on Network'}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center py-10 opacity-40">
                            <ShieldAlert className="w-8 h-8 mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Verifiable Awards Yet</p>
                          </div>
                        )}
                        <button className="mt-2 w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-[#CC5500]/20 hover:text-[#CC5500] transition-all">
                          Submit Certification
                        </button>
                      </div>
                    </div>

                    {/* Customer Stories / Reviews */}
                    <div className="bg-[#1e2520] rounded-[3rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#CC5500]" />
                        Latest Client Story
                      </h3>
                      
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 italic relative">
                         <Star className="absolute top-4 right-4 w-4 h-4 text-[#fbbf24] fill-current" />
                         <p className="text-sm font-bold text-gray-300 leading-relaxed">
                           "The quality of the cabinet work exceeded my expectations. Leon was professional, on time, and the voice-verified contract gave me total peace of mind."
                         </p>
                         <div className="mt-4 flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-[#CC5500] flex items-center justify-center font-black text-[10px]">JD</div>
                           <div>
                             <p className="text-[10px] font-black tracking-widest uppercase">Jane Doe</p>
                             <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Verified Multi-Buyer</p>
                           </div>
                         </div>
                      </div>

                      <button className="w-full mt-8 py-4 bg-[#CC5500] text-white rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-[#b34a00] transition-all shadow-lg flex items-center justify-center gap-2">
                        View All 12 Reviews <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto flex flex-col gap-8 custom-scrollbar"
            >
              <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-4 border-b border-gray-50">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Edit My Profile</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Set up your business card</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-8">
                {/* Core Identity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">My Full Name</label>
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="Your name"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#CC5500] focus:bg-white transition-all outline-none font-bold text-sm"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">My Skill / Work Type</label>
                    <input 
                      type="text" 
                      value={editForm.skill}
                      onChange={(e) => setEditForm({...editForm, skill: e.target.value})}
                      placeholder="e.g. Carpenter, Plumber"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#2E8B57] focus:bg-white transition-all outline-none font-bold text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Simplified Bio */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">About Me / Why hire me?</label>
                  <textarea 
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Example: I have 10 years experience in wood work. I am reliable and professional."
                    rows={3}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#1e2520] focus:bg-white transition-all outline-none font-bold text-sm resize-none"
                  />
                </div>

                {/* Photo Management */}
                <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-sm text-[#1e2520]">My Work Photos</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Show customers what you can do</p>
                    </div>
                    <label className="cursor-pointer bg-[#2E8B57] text-white px-4 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-[#236b43] transition-all flex items-center gap-2 shadow-lg shadow-[#2E8B57]/10">
                      <Camera className="w-3 h-3" /> Add a Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handlePortfolioUpload} disabled={portfolioLoading} />
                    </label>
                  </div>
                  
                  {portfolioLoading && (
                    <div className="flex items-center justify-center py-4 gap-2 text-[#CC5500]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Saving Photo...</span>
                    </div>
                  )}

                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {currentUser?.portfolio?.map(item => (
                      <div key={item.id} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 group">
                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                    {(!currentUser?.portfolio || currentUser.portfolio.length === 0) && !portfolioLoading && (
                      <p className="text-[10px] font-bold text-gray-400 py-2 italic px-2">No photos added yet. Adding photos builds trust!</p>
                    )}
                  </div>
                </div>

                {/* Advanced Links Toggle */}
                <div className="pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowSocialLinks(!showSocialLinks)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1e2520] transition-colors"
                  >
                    {showSocialLinks ? "Hide" : "Show"} Optional Social Links (Instagram, etc.)
                  </button>

                  <AnimatePresence>
                    {showSocialLinks && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-2">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 flex items-center gap-1">
                              <Instagram className="w-3 h-3" /> Instagram
                            </label>
                            <input 
                              type="text" 
                              value={editForm.instagram}
                              onChange={(e) => setEditForm({...editForm, instagram: e.target.value})}
                              placeholder="@handle"
                              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#e1306c] focus:bg-white transition-all outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 flex items-center gap-1">
                              <Twitter className="w-3 h-3" /> Twitter / X
                            </label>
                            <input 
                              type="text" 
                              value={editForm.twitter}
                              onChange={(e) => setEditForm({...editForm, twitter: e.target.value})}
                              placeholder="@handle"
                              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#1da1f2] focus:bg-white transition-all outline-none font-bold text-sm"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1 flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Website
                            </label>
                            <input 
                              type="text" 
                              value={editForm.website}
                              onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                              placeholder="www.work.com"
                              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#2E8B57] focus:bg-white transition-all outline-none font-bold text-sm"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-3 sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-50 mt-4">
                   <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-xs tracking-widest uppercase transition-all"
                  >
                    Close
                  </button>
                  <button 
                    type="submit"
                    disabled={editLoading}
                    className="flex-grow-[2] py-4 rounded-2xl bg-[#CC5500] hover:bg-[#b34a00] text-white font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#CC5500]/20"
                  >
                    {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
