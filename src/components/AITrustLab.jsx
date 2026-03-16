"use client";

import { useState, useRef } from 'react';
import { Mic, Play, Square, Loader2, ShieldCheck, Activity, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AITrustLab() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setInsights(null);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Microphone access required for AI analysis.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeVoice = async () => {
    if (!audioBlob) return;
    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        const res = await fetch('/api/analyze-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: "DEMO_USER", // Pseudo phone for demo
            audioBase64: base64data,
            mimeType: 'audio/webm'
          })
        });
        const data = await res.json();
        setInsights(data.insights);
        setIsAnalyzing(false);
      };
    } catch (err) {
      console.error("Analysis failed:", err);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h3 className="text-2xl font-black tracking-tight mb-2">AI Trust Lab</h3>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Powered by Gemini 1.5 Flash</p>
        </div>

        {!insights ? (
           <div className="flex flex-col items-center gap-8 py-8 w-full">
              <div 
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording 
                    ? "bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)]" 
                    : "bg-[#1e2520] hover:bg-black"
                }`}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
              >
                <Mic className={`w-10 h-10 ${isRecording ? "text-white animate-pulse" : "text-[#CC5500]"}`} />
              </div>
              
              <div className="text-center">
                <p className="text-sm font-bold text-gray-600 mb-1">
                  {isRecording ? "Recording your voice..." : "Hold the button to record a trust sample"}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Say: "I am a reliable professional who delivers on time."</p>
              </div>

              {audioBlob && !isRecording && (
                <button 
                  onClick={analyzeVoice}
                  disabled={isAnalyzing}
                  className="w-full py-4 rounded-2xl bg-[#CC5500] hover:bg-[#b34a00] text-white font-black text-sm tracking-widest uppercase shadow-lg shadow-[#CC5500]/20 flex items-center justify-center gap-3 transition-all"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Dynamics...</>
                  ) : (
                    <><Activity className="w-5 h-5" /> Run AI Trust Audit</>
                  )}
                </button>
              )}
           </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6"
          >
             {/* Results Grid */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sentiment Score</span>
                    <div className="text-3xl font-black text-[#2E8B57]">{insights.sentimentScore}%</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Detected Tone</span>
                    <div className="text-lg font-black uppercase text-[#CC5500]">{insights.emotion}</div>
                </div>
             </div>

             <div className="bg-[#2E8B57]/5 p-6 rounded-2xl border border-[#2E8B57]/20">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#2E8B57]" />
                    <span className="text-xs font-black text-[#2E8B57] uppercase tracking-widest">AI Verdict</span>
                </div>
                <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                  "{insights.verdict}"
                </p>
             </div>

             <button 
               onClick={() => setInsights(null)}
               className="w-full py-3 rounded-xl border-2 border-gray-100 text-gray-400 font-black text-[10px] tracking-[0.3em] uppercase hover:bg-gray-50 transition-all"
             >
               Test Another Sample
             </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
