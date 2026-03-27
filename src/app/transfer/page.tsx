'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Smartphone, X, CheckCircle2, Music, Loader2, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type TransferMode = 'CHOOSE' | 'SEARCHING' | 'VERIFY_CODE' | 'PICK_SONG' | 'RECEIVE' | 'TRANSFERRING' | 'COMPLETED';

export default function TransferPage() {
  const [mode, setMode] = useState<TransferMode>('CHOOSE');
  const [pairingCode, setPairingCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [transferProgress, setTransferProgress] = useState(0);
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const { favorites, downloads, addTransferredSong } = usePlayerStore();
  
  const allAvailableSongs = [...favorites, ...downloads].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  // Sample song for receive demo
  const sampleReceivedSong = {
    id: 'received-' + Date.now(),
    title: 'Shared Vibes.mp3',
    artist: 'BeatShare Wireless',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  };

  // Generate random code
  const generateCode = () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setPairingCode(code);
    return code;
  };

  const startReceive = () => {
    generateCode();
    setMode('RECEIVE');
  };

  const startSend = () => {
    setMode('SEARCHING');
    // Simulated discovery (Search within radius)
    setTimeout(() => {
        setMode('VERIFY_CODE');
    }, 3000);
  };

  const verifyCode = () => {
    if (inputCode.length !== 5) {
        toast.error("Enter full 5-digit code");
        return;
    }
    // Hardcoded demo code or generated pairingCode
    if (inputCode === '12345' || inputCode === pairingCode) {
        toast.success("Connection Verified");
        setMode('PICK_SONG');
    } else {
        toast.error("Pairing code invalid or out of range");
        setInputCode('');
    }
  };

  const handleFinalSend = () => {
    setMode('TRANSFERRING');
    simulateTransfer(false);
  };

  const simulateTransfer = (isReceiver: boolean) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        setTransferProgress(100);
        clearInterval(interval);
        
        if (isReceiver) addTransferredSong(sampleReceivedSong);

        setTimeout(() => {
          setMode('COMPLETED');
          toast.success(isReceiver ? "Song Received!" : "Song Sent!");
        }, 800);
      } else {
        setTransferProgress(progress);
      }
    }, 500);
  };

  const reset = () => {
    setMode('CHOOSE');
    setPairingCode('');
    setInputCode('');
    setTransferProgress(0);
    setSelectedSong(null);
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-10 pb-32">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-[30px] flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                <Share2 className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-black mb-1 italic">BEAT<span className="text-blue-500">SHARE</span></h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Import & Export Music</p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'CHOOSE' && (
            <motion.div 
              key="choose"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="grid gap-4"
            >
              <button 
                onClick={startSend}
                className="group relative h-36 rounded-[35px] bg-white text-black overflow-hidden shadow-2xl transition-all active:scale-95"
              >
                <div className="absolute inset-0 p-8 flex flex-col justify-between text-left">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight">Send Music</h3>
                    <p className="text-[9px] font-bold opacity-60">EXPORT TO NEARBY</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={startReceive}
                className="group relative h-36 rounded-[35px] bg-zinc-900 border border-white/5 overflow-hidden shadow-2xl transition-all active:scale-95"
              >
                <div className="absolute inset-0 p-8 flex flex-col justify-between text-left">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Receive</h3>
                    <p className="text-[9px] font-bold text-zinc-500">IMPORT FROM NEARBY</p>
                  </div>
                </div>
              </button>
            </motion.div>
          )}

          {mode === 'SEARCHING' && (
            <motion.div 
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center space-y-8"
            >
                <div className="relative w-32 h-32 mx-auto">
                    <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 border-2 border-blue-500 rounded-full" 
                    />
                    <motion.div 
                        animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                        className="absolute inset-0 border-2 border-blue-500 rounded-full" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Smartphone className="w-12 h-12 text-blue-500" />
                    </div>
                </div>
                <h3 className="text-xl font-black uppercase italic">Searching in radius...</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Keep devices within 10 meters</p>
                <button onClick={reset} className="text-xs text-zinc-700 font-black uppercase underline mt-4">Cancel</button>
            </motion.div>
          )}

          {mode === 'VERIFY_CODE' && (
            <motion.div 
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
                <div className="bg-white/5 border border-white/5 p-10 rounded-[40px] text-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-8">Enter Receiver Verification Code</h3>
                    <div className="flex gap-2 justify-center mb-10">
                        {[0,1,2,3,4].map(i => (
                            <div
                                key={i}
                                className={cn(
                                    "w-10 h-14 border rounded-xl flex items-center justify-center text-2xl font-black transition-all",
                                    inputCode[i] ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/20"
                                )}
                            >
                                {inputCode[i] || ''}
                            </div>
                        ))}
                    </div>
                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-3">
                        {[1,2,3,4,5,6,7,8,9,0].map(n => (
                            <button 
                                key={n}
                                onClick={() => inputCode.length < 5 && setInputCode(prev => prev + n)}
                                className="py-4 bg-white/5 rounded-2xl font-black hover:bg-white/10 active:scale-95 transition-all"
                            >
                                {n}
                            </button>
                        ))}
                        <button 
                            onClick={() => setInputCode(prev => prev.slice(0, -1))}
                            className="py-4 bg-red-500/10 text-red-500 rounded-2xl font-black active:scale-95"
                        >
                            <X size={18} className="mx-auto" />
                        </button>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={reset} className="flex-1 py-5 rounded-3xl bg-white/5 text-xs font-black uppercase tracking-widest">Cancel</button>
                    <button onClick={verifyCode} className="flex-[2] py-5 rounded-3xl bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95">Verify & Connect</button>
                </div>
            </motion.div>
          )}

          {mode === 'PICK_SONG' && (
            <motion.div 
              key="pick"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Connection Valid. Select Music</h3>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                
                <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {allAvailableSongs.map(song => (
                        <button
                            key={song.id}
                            onClick={() => setSelectedSong(song)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-[25px] border transition-all",
                                selectedSong?.id === song.id 
                                    ? "bg-blue-500 border-blue-500 text-white" 
                                    : "bg-white/5 border-white/5 text-zinc-400"
                            )}
                        >
                            <img src={song.thumbnail} className="w-12 h-12 rounded-xl object-cover" alt="" />
                            <div className="flex-1 text-left overflow-hidden">
                                <h4 className="text-sm font-bold truncate">{song.title}</h4>
                                <p className="text-[10px] opacity-60 truncate">{song.artist}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="pt-4 flex gap-4">
                    <button onClick={reset} className="flex-1 py-5 rounded-3xl bg-white/5 text-xs font-black uppercase tracking-widest">Cancel</button>
                    <button 
                        onClick={handleFinalSend}
                        disabled={!selectedSong}
                        className="flex-[2] py-5 rounded-3xl bg-white text-black text-xs font-black uppercase tracking-widest disabled:opacity-20 active:scale-95 shadow-xl"
                    >
                        Export Track Now
                    </button>
                </div>
            </motion.div>
          )}

          {mode === 'RECEIVE' && (
            <motion.div 
              key="receive"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
                <div className="bg-zinc-900 border border-white/5 p-10 rounded-[50px] shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-8">Generated Intake Code</p>
                    <div className="flex justify-center gap-2 mb-10">
                        {pairingCode.split('').map((char, i) => (
                            <div key={i} className="w-12 h-16 bg-black rounded-xl border border-white/5 flex items-center justify-center text-4xl font-black text-white">
                                {char}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 text-left p-4 bg-white/5 rounded-2xl">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        <div>
                            <p className="text-[10px] font-black text-white uppercase tracking-tight">Listening for Connect</p>
                            <p className="text-[9px] text-zinc-500">Wait for sender to verify your code</p>
                        </div>
                    </div>
                </div>
                <button onClick={reset} className="w-full py-5 rounded-3xl bg-white/5 text-xs font-black uppercase border border-white/5">Stop Import</button>
            </motion.div>
          )}

          {mode === 'TRANSFERRING' && (
            <motion.div 
              key="transferring"
              className="text-center py-20"
            >
                <div className="relative w-40 h-40 mx-auto mb-10">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="75" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                        <motion.circle
                            cx="80"
                            cy="80"
                            r="75"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 75}
                            animate={{ strokeDashoffset: 2 * Math.PI * 75 * (1 - transferProgress / 100) }}
                            fill="transparent"
                            strokeLinecap="round"
                            className="text-blue-500"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-black">{Math.floor(transferProgress)}%</span>
                    </div>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight italic">Syncing Vibes...</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">End-to-End Secure Channel</p>
            </motion.div>
          )}

          {mode === 'COMPLETED' && (
            <motion.div 
              key="completed"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-10"
            >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_80px_rgba(34,197,94,0.3)]">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-black mb-4 italic uppercase tracking-tighter">Transfer Complete!</h2>
                <div className="bg-white/5 border border-white/5 p-6 rounded-[35px] mb-10 flex items-center gap-4 text-left">
                    <img src={selectedSong?.thumbnail || sampleReceivedSong.thumbnail} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                    <div>
                        <h4 className="text-lg font-black italic truncate max-w-[180px]">{selectedSong?.title || sampleReceivedSong.title}</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">AVAILABLE IN LIBRARY</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <button onClick={reset} className="py-6 rounded-[30px] bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95">Send More</button>
                    <button onClick={() => window.location.href = '#/library'} className="py-6 rounded-[30px] bg-white text-black text-xs font-black uppercase tracking-widest border border-white/5 active:scale-95">View in Library</button>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
