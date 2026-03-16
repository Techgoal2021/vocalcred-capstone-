"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Star, Briefcase, Users, ShieldCheck, Phone, FileAudio, Mic, Loader2, CheckCircle2, Activity } from "lucide-react";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";

export default function UserCard({ user }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const isPartner = session?.user?.role === "CLIENT";
  const isClient = user.role === "CLIENT";
  const isSelf = session?.user?.phone === user.phone;
  const canRate = (isAdmin || isPartner) && !isSelf;

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [audioSrc, setAudioSrc] = useState(`/voice_${user.phone}.webm`);
  const audioRef = useRef(null);

  // Rating State
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ---- Audio Playback ----
  const toggleAudio = () => {
    if (!audioRef.current || audioError) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error("Audio playback failed:", e);
        setAudioError(true);
        setIsPlaying(false);
      });
    }
    setIsPlaying(!isPlaying);
  };
  const onAudioEnded = () => setIsPlaying(false);

  // ---- Audio Recording ----
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks([audioBlob]);
        setRecordedAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop()); // Stop mic
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required to leave a voice review.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ---- Form Submission ----
  const submitRating = async () => {
    if (rating === 0) return alert("Please select a star rating");
    if (audioChunks.length === 0) return alert("Please record a short voice review");

    setIsSubmitting(true);
    const audioBlob = audioChunks[0];
    
    const formData = new FormData();
    formData.append("phone", user.phone);
    formData.append("rating", rating.toString());
    formData.append("audio", audioBlob, "voice_review.webm");

    try {
      const res = await fetch("/api/users/rate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Rating submission failed");

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsRatingOpen(false);
        setSubmitSuccess(false);
        setRating(0);
        setRecordedAudioUrl(null);
        setAudioChunks([]);
      }, 2000);
      
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Failed to submit rating.");
      setIsSubmitting(false);
    }
  };


  // Risk Band Calculation based on Credit Pitch
  const getRiskBand = (score) => {
    if (score >= 750) return { label: "VERY LOW", color: "text-[#2E8B57] bg-[#2E8B57]/10" };
    if (score >= 700) return { label: "LOW", color: "text-[#2E8B57] bg-[#2E8B57]/10" };
    if (score >= 600) return { label: "MODERATE", color: "text-[#fbbf24] bg-[#fbbf24]/10" };
    return { label: "HIGH", color: "text-red-600 bg-red-100" };
  };

  const risk = getRiskBand(isClient ? (user.payer_score || 0) : (user.reputation || 0));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white border text-[#1e2520] border-gray-100 rounded-3xl pt-6 px-6 md:px-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-all duration-300 flex flex-col gap-6 relative group overflow-hidden"
    >
      {/* Header section */}
      <div className="flex justify-between items-start z-10 relative">
        <div className="flex gap-4 items-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[#CC5500] font-black text-2xl shadow-sm border border-[#CC5500]/20">
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold tracking-tight">{user.name || (isClient ? "Unregistered Partner" : "Unknown Artisan")}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black tracking-widest uppercase">
                      {user.vocalcred_id || "PENDING"}
                    </span>
                    {isSelf && (
                      <span className="px-2 py-0.5 rounded-full bg-[#2E8B57] text-white text-[10px] font-black tracking-widest uppercase shadow-sm">
                        You
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1.5 text-gray-500 mr-2">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold">{isClient ? user.businessType : (user.skill || "Unverified Service")}</span>
                  </div>
                  {/* Power-Up Badges */}
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest uppercase border ${isClient ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-[#2E8B57]/10 text-[#2E8B57] border-[#2E8B57]/20"}`}>
                    <ShieldCheck className="w-3 h-3" />
                    {isClient ? "TIER 1 PARTNER" : "SIM: Clear"}
                  </div>
                  {user.has_voice && !isClient && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#CC5500]/10 text-[#CC5500] text-[9px] font-black tracking-widest uppercase border border-[#CC5500]/20">
                      <Activity className="w-3 h-3" />
                      Biometric Valid
                    </div>
                  )}
                </div>
              </div>
        </div>

        {/* Dynamic Voice Module - Pill Shaped */}
        <div className="flex items-center">
          <audio 
            ref={audioRef} 
            src={audioSrc}
            onEnded={onAudioEnded}
            onError={() => {
              if (audioSrc.endsWith('.webm')) {
                setAudioSrc(`/voice_${user.phone}.mp3`);
              } else {
                setAudioError(true);
              }
            }}
          />
          {user.has_voice ? (
             <button 
                onClick={toggleAudio}
                disabled={audioError}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-sm ${
                    audioError 
                    ? "bg-red-50 text-red-500 border border-red-100 cursor-not-allowed"
                    : isPlaying 
                    ? "bg-gray-900 text-white shadow-md transform scale-105" 
                    : "bg-white border-2 border-[#CC5500]/20 text-[#1e2520] hover:border-[#CC5500] hover:text-[#CC5500]"
                }`}
              >
                {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {audioError ? "Error" : isPlaying ? "Playing Profile" : "Listen"}
              </button>
          ) : (
             canRate && (
               <button 
                  onClick={() => setIsRatingOpen(!isRatingOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#CC5500]/20 bg-white text-[#CC5500] hover:bg-[#CC5500] hover:text-white transition-all text-xs font-black uppercase tracking-widest shadow-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  Leave Review
                </button>
             )
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative">
          
          <div className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
              <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                <Star className="w-4 h-4 text-[#CC5500] fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider">Avg Rating</span>
              </div>
              <div className="text-2xl font-black">{user.avg_rating?.toFixed(1) || "0.0"} <span className="text-sm font-bold text-gray-400">/ 5</span></div>
          </div>

          <div className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
              <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                <Briefcase className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Jobs (90d)</span>
              </div>
              <div className="text-2xl font-black">{user.jobs_completed || "0"}</div>
          </div>

          <div className="flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
              <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Repeat Clients</span>
              </div>
              <div className="text-2xl font-black">{user.repeat_clients || "0"}</div>
          </div>

          <div className={`flex flex-col p-4 rounded-2xl border ${isClient ? "bg-blue-50 border-blue-100" : "bg-[#CC5500]/5 border-[#CC5500]/10"}`}>
              <div className={`flex items-center gap-1.5 mb-2 ${isClient ? "text-blue-600" : "text-[#CC5500]"}`}>
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{isClient ? "Payer Score" : "VocalCred Score"}</span>
              </div>
              <div className={`text-2xl font-black ${isClient ? "text-blue-600" : "text-[#CC5500]"}`}>{isClient ? (user.payer_score || "N/A") : (user.reputation || "N/A")}</div>
          </div>
      </div>

      {/* Interactive Review Drawer */}
      <AnimatePresence>
        {isRatingOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden z-20 relative"
          >
            <div className="bg-gray-50 rounded-[2rem] p-6 border border-[#CC5500]/20 flex flex-col gap-6 relative">
              {submitSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-[#2E8B57]">
                  <CheckCircle2 className="w-12 h-12 mb-3" />
                  <span className="text-lg font-black tracking-tight">Review Submitted!</span>
                  <p className="text-sm font-bold text-gray-500">The VocalCred score has been updated.</p>
                </div>
              ) : (
                <>
                  {/* Star Rating Selection */}
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">Rate this Artisan</span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star 
                            className={`w-10 h-10 transition-colors ${
                              star <= (hoverRating || rating) 
                                ? "text-[#CC5500] fill-current" 
                                : "text-gray-300"
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio Recording Selection */}
                  <div className="flex flex-col items-center gap-3">
                     <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">Record Voice Review</span>
                     
                     {!recordedAudioUrl ? (
                       <button
                         onMouseDown={startRecording}
                         onMouseUp={stopRecording}
                         onMouseLeave={stopRecording}
                         onTouchStart={startRecording}
                         onTouchEnd={stopRecording}
                         className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                           isRecording 
                            ? "bg-red-500 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
                            : "bg-[#1e2520] hover:bg-black shadow-lg shadow-black/10"
                         }`}
                       >
                         <Mic className={`w-8 h-8 ${isRecording ? "text-white animate-pulse" : "text-[#CC5500]"}`} />
                       </button>
                     ) : (
                       <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-[#CC5500]/20 shadow-sm">
                         <Play className="w-5 h-5 text-[#CC5500]" onClick={() => new Audio(recordedAudioUrl).play()} />
                         <span className="text-xs font-bold text-gray-500">Audio Captured</span>
                         <button onClick={() => setRecordedAudioUrl(null)} className="text-[10px] font-black tracking-widest uppercase text-red-500 hover:text-red-600 ml-4">
                           Retake
                         </button>
                       </div>
                     )}
                     <span className="text-xs font-bold text-gray-400">
                       {isRecording ? "Listening... Release to stop" : "Hold microphone to record"}
                     </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200/50">
                    <button 
                      onClick={() => setIsRatingOpen(false)}
                      className="flex-1 py-3 rounded-full font-black text-xs tracking-widest uppercase text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={submitRating}
                      disabled={isSubmitting || rating === 0 || !recordedAudioUrl}
                      className="flex-1 py-3 rounded-full bg-[#CC5500] hover:bg-[#b34a00] text-white font-black text-xs tracking-widest uppercase shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk Band Output */}
      <div className="w-full relative z-10 p-6 -mx-6 -mb-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between rounded-b-3xl mt-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
            <Phone className="w-4 h-4" />
            {user.phone}
          </div>
          <div className="flex items-center gap-2">
            {canRate && !isRatingOpen && (
              <button 
                  onClick={() => setIsRatingOpen(true)}
                  className="text-xs font-black tracking-widest uppercase text-[#CC5500] hover:text-[#b34a00] mr-4 transition-colors"
              >
                  Rate Artisan
              </button>
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Risk Band:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest ${risk.color}`}>
              {risk.label}
            </span>
          </div>
      </div>
    </motion.div>
  );
}
