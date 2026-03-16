"use client";

import { useState } from 'react';
import { Phone, RefreshCcw, Wifi, Battery, Signal, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function USSDSimulator() {
  const [screen, setScreen] = useState('HOME');
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('08012345678');
  const [loading, setLoading] = useState(false);
  const [sessionText, setSessionText] = useState('');

  const handleSend = async () => {
    setLoading(true);
    try {
      let currentTextToSend = sessionText;
      
      if (screen === 'HOME') {
        if (input !== '*384*43029#') {
          setMessage('Please dial *384*43029#');
          setLoading(false);
          return;
        }
        currentTextToSend = ""; // Initial request is empty
      } else {
        currentTextToSend = sessionText ? `${sessionText}*${input}` : input;
      }

      const formData = new URLSearchParams();
      formData.append('phone', phone);
      formData.append('text', currentTextToSend);

      const res = await fetch(`/api/ussd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const text = await res.text();
      
      // Real AT endpoints return "CON [message]" or "END [message]"
      // Let's strip those for the UI if they exist, or just show them.
      let displayMessage = text;
      if (displayMessage.startsWith('CON ')) displayMessage = displayMessage.substring(4);
      if (displayMessage.startsWith('END ')) displayMessage = displayMessage.substring(4);
      
      if (screen === 'HOME') {
        setScreen('MENU');
        setMessage(displayMessage);
        setSessionText(currentTextToSend);
      } else {
        setMessage(displayMessage);
        if (text.startsWith('END ')) {
            // End of session
            setSessionText('');
            setTimeout(() => {
                setScreen('HOME');
                setMessage('');
            }, 3000);
        } else {
            setSessionText(currentTextToSend);
        }
      }
      setInput('');
    } catch (err) {
      console.error('USSD Error:', err);
      setMessage('Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScreen('HOME');
    setInput('');
    setMessage('');
    setSessionText('');
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white border border-gray-200 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] font-sans relative overflow-hidden">
      
      {/* Phone Hardware Details */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-100 rounded-b-[1rem] z-20 flex justify-center items-end pb-1.5">
        <div className="w-12 h-1.5 rounded-full bg-gray-300"></div>
      </div>
      
      {/* Screen Container */}
      <div className="bg-gray-50 rounded-[2.5rem] w-full h-[650px] overflow-hidden border-4 border-gray-100 relative shadow-inner">
        
        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 pt-5 pb-2 text-[#1e2520] z-10 relative">
          <span className="text-[10px] font-black tracking-widest">09:41</span>
          <div className="flex items-center gap-1.5 opacity-80">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Dynamic Content Area */}
        <AnimatePresence mode="wait">
          {screen === 'HOME' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-[550px] flex flex-col justify-center items-center px-8 relative"
            >
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-green-100">
                  <Phone className="w-8 h-8 text-[#2E8B57]" />
                </div>
                <h4 className="text-[#1e2520] font-black text-2xl mb-2 tracking-tight">Access Protocol</h4>
                <p className="text-[#2E8B57] text-[10px] font-bold uppercase tracking-[0.2em]">Dial *384*43029# to initiate</p>
                
                <div className="mt-12 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 text-left pl-2">Target MSISDN</label>
                    <input 
                        type="text" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-center text-sm font-bold text-[#1e2520] focus:outline-none focus:ring-2 focus:ring-[#CC5500]/20 focus:border-[#CC5500] transition-all shadow-sm"
                    />
                </div>

                {message && (
                  <div className="mt-8 text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-full border border-red-100 text-center uppercase tracking-widest shadow-sm">
                    {message}
                  </div>
                )}
            </motion.div>
          ) : (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[550px] flex flex-col p-6"
            >
              <div className="flex-1 bg-white border border-gray-200 rounded-3xl p-6 overflow-y-auto mb-6 shadow-sm">
                <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#1e2520] font-bold">
                  {message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Interaction Bar */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-white border-t border-gray-100 z-10 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
            <button 
                onClick={handleReset}
                className="w-14 h-14 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-[1.25rem] flex items-center justify-center transition-all text-gray-500 shadow-sm"
                title="Reset Session"
            >
                <RefreshCcw className="w-5 h-5" />
            </button>
            <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={screen === 'HOME' ? 'Dial code...' : 'Type response...'}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-[1.25rem] py-3 px-5 text-sm font-bold text-[#1e2520] focus:outline-none focus:ring-2 focus:ring-[#CC5500]/20 focus:border-[#CC5500] transition-all placeholder:text-gray-400 shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
                onClick={handleSend}
                disabled={loading}
                className="w-14 h-14 bg-[#CC5500] hover:bg-[#b34a00] rounded-[1.25rem] flex items-center justify-center transition-all text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ArrowRight className="w-5 h-5" />}
            </button>
        </div>
      </div>
    </div>
  );
}
