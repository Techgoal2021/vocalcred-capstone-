"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, CheckCircle, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function RecordPage() {
  const params = useParams();
  const phone = params.phone;
  
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadAudio(audioBlob);
      };

      mediaRecorder.start();
      setStatus("recording");
    } catch (err) {
      console.error("Mic error:", err);
      setErrorMessage("Microphone access denied or unavailable.");
      setStatus("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === "recording") {
      mediaRecorderRef.current.stop();
      setStatus("analyzing");
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const uploadAudio = async (blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, `voice_${phone}.webm`);
      formData.append('phone', phone);

      const res = await fetch('/api/upload-voice', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      setStatus("complete");
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage("Upload failed. Please ensure you are connected to the internet.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#2E8B57]/30">
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center text-center gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-[#2E8B57]"></div>
        
        <div className="w-20 h-20 rounded-[2rem] bg-[#2E8B57]/10 flex items-center justify-center text-[#2E8B57] mb-2 shadow-sm border border-[#2E8B57]/20">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <div>
          <h1 className="text-3xl font-black text-[#1e2520] mb-2 tracking-tight">Identity Verification</h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-500 text-sm font-bold">Please complete your profile.</p>
            <div className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-[#CC5500] font-black text-xs tracking-widest uppercase">
              {phone}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-6 mt-2 w-full"
            >
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-inner">
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase block mb-3">Please Read Aloud</span>
                <span className="text-lg text-[#1e2520] font-bold leading-relaxed italic">
                  "I am confirming my identity for the VocalCred network."
                </span>
              </div>
              <button 
                onClick={startRecording}
                className="w-full py-5 rounded-full bg-[#CC5500] text-white font-black text-sm tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 shadow-lg shadow-[#CC5500]/20"
              >
                <Mic className="w-5 h-5" />
                START RECORDING
              </button>
            </motion.div>
          )}

          {status === "recording" && (
            <motion.div 
              key="recording"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-8 mt-2 w-full items-center"
            >
              <div className="relative">
                  <motion.div 
                      animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-red-500 rounded-full blur-xl"
                  ></motion.div>
                  <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border-4 border-red-500 relative z-10 shadow-lg">
                    <Mic className="w-10 h-10 text-red-600" />
                  </div>
              </div>
              <button 
                onClick={stopRecording}
                className="w-full py-5 rounded-full bg-[#1e2520] text-white font-black text-sm tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-3 shadow-lg"
              >
                <Square className="w-5 h-5 fill-current" />
                STOP & UPLOAD
              </button>
            </motion.div>
          )}

          {status === "analyzing" && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-6 mt-4 w-full items-center py-6"
            >
              <div className="w-16 h-16 bg-[#CC5500]/10 rounded-full flex items-center justify-center mb-2">
                <Loader2 className="w-8 h-8 text-[#CC5500] animate-spin" />
              </div>
              <h3 className="text-xl font-black text-[#1e2520] tracking-tight">Uploading Securely...</h3>
              <p className="text-sm font-bold text-gray-500">Please do not close this window.</p>
            </motion.div>
          )}

          {status === "complete" && (
            <motion.div 
               key="complete"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="flex flex-col gap-6 mt-4 w-full items-center py-6"
            >
              <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="w-24 h-24 rounded-[2rem] bg-[#2E8B57]/10 border border-[#2E8B57]/20 flex items-center justify-center shadow-sm"
              >
                 <CheckCircle className="w-12 h-12 text-[#2E8B57]" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-black text-[#1e2520] tracking-tight">Success</h3>
                <p className="text-sm font-bold text-gray-500 mt-2">Voice profile successfully registered.</p>
              </div>
              <div className="text-sm font-bold text-gray-600 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-inner mt-2 w-full">
                You may now close this window and return to the main platform.
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-6 mt-4 w-full items-center py-4"
            >
              <AlertCircle className="w-16 h-16 text-red-500" />
              <p className="text-[#1e2520] font-black text-lg tracking-tight px-4">{errorMessage}</p>
              <button 
                onClick={() => setStatus("idle")}
                className="w-full py-5 rounded-full bg-gray-100 text-[#1e2520] font-black tracking-widest text-sm hover:bg-gray-200 transition-colors"
              >
                TRY AGAIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <p className="mt-8 text-xs font-bold text-gray-400">
        VocalCred Secure Voice Enrollment • {new Date().getFullYear()}
      </p>
    </div>
  );
}
