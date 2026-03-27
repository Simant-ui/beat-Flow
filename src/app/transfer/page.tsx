'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Wifi, 
  Bluetooth, 
  ArrowRightLeft, 
  CheckCircle2, 
  Smartphone,
  ChevronLeft,
  Loader2,
  Download,
  Send,
  Radio,
  Music,
  Plus,
  Search,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Song } from '@/types';

type TransferState = 'IDLE' | 'SCANNING' | 'VERIFYING' | 'SELECT_MUSIC' | 'SENDING' | 'RECEIVING' | 'COMPLETE';

interface Device {
    id: string;
    name: string;
    type: 'Phone' | 'Laptop';
    strength: number;
}

export default function MusicTransferPage() {
  const router = useRouter();
  const { theme, history, favorites } = usePlayerStore();
  const [state, setState] = useState<TransferState>('IDLE');
  const [nearbyDevices, setNearbyDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [progress, setProgress] = useState(0);
  
  // Verification states
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Combine history and favorites for selection
  const allSongs = [...new Map([...history, ...favorites].map(item => [item.id, item])).values()];

  const startScanning = () => {
    setState('SCANNING');
    setNearbyDevices([]);
    
    // Simulate finding devices after a short delay
    setTimeout(() => {
        setNearbyDevices([
            { id: 'dev-1', name: 'iPhone 15 Pro', type: 'Phone', strength: 90 },
            { id: 'dev-2', name: 'MacBook Air', type: 'Laptop', strength: 65 },
            { id: 'dev-3', name: 'Samsung S24 Ultra', type: 'Phone', strength: 40 },
        ]);
    }, 2500);
  };

  const connectToDevice = (device: Device) => {
    setSelectedDevice(device);
    // Generate a random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
    setState('VERIFYING');
    setInputCode('');
    
    // In a real scenario, the "receiver" would show the code.
    // For this demo, we'll show it in a toast or as a "hint" for the user.
    toast(`Verification code for ${device.name}: ${code}`, { 
        icon: '🔑',
        duration: 5000,
        style: {
            borderRadius: '15px',
            background: '#18181b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
        }
    });
  };

  const handleVerify = () => {
    if (inputCode === verificationCode) {
        setIsVerifying(true);
        setTimeout(() => {
            toast.success("Identity Verified", { icon: '🛡️' });
            setState('SELECT_MUSIC');
            setIsVerifying(false);
        }, 1500);
    } else {
        toast.error("Invalid verification code");
        setInputCode('');
    }
  };

  const toggleSongSelection = (song: Song) => {
    setSelectedSongs(prev => 
        prev.find(s => s.id === song.id) 
            ? prev.filter(s => s.id !== song.id)
            : [...prev, song]
    );
  };

  const startTransfer = () => {
    if (selectedSongs.length === 0) {
        toast.error("Please select at least one song");
        return;
    }
    setState('SENDING');
    
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8;
      if (p >= 100) {
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => setState('COMPLETE'), 500);
      } else {
        setProgress(p);
      }
    }, 300);
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 flex flex-col pt-12 pb-32 px-6",
      theme === 'dark' ? "bg-black text-white" : "bg-zinc-50 text-zinc-950"
    )}>
      {/* Header */}
      <div className="max-w-md mx-auto w-full mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/5">
            <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-black">Beam Transfer</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-500">
            <Bluetooth size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
        </div>
      </div>

      <main className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* STAGE 1: IDLE */}
          {state === 'IDLE' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150" />
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-2xl shadow-blue-600/20 scale-110">
                  <Radio size={54} className="animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black">Nearby Beam</h2>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto font-medium">
                  Automatically detect other BeatFlow devices within Bluetooth range to share music.
                </p>
              </div>

              <div className="w-full pt-10">
                <button 
                  onClick={startScanning}
                  className="w-full bg-white text-black font-black py-5 rounded-[30px] transition-all active:scale-95 shadow-2xl shadow-white/10 flex items-center justify-center gap-3"
                >
                  <Search size={20} />
                  Scan for Devices
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: SCANNING */}
          {state === 'SCANNING' && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 py-4"
            >
              <div className="text-center space-y-6 py-10">
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500 rounded-full"
                    />
                    <motion.div 
                        animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-400 rounded-full"
                    />
                    <div className="relative z-10 w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-xl">
                        <Smartphone size={32} />
                    </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">Scanning for devices...</h3>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Searching Bluetooth Radius</p>
                </div>
              </div>

              <div className="space-y-3">
                {nearbyDevices.length > 0 ? (
                    nearbyDevices.map((device, idx) => (
                        <motion.button
                            key={device.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => connectToDevice(device)}
                            className="w-full flex items-center justify-between p-5 rounded-[24px] bg-zinc-900 border border-white/5 hover:border-blue-500/50 hover:bg-zinc-800 transition-all group"
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm tracking-tight">{device.name}</p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Nearby • {device.strength}% Signal</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <ArrowRightLeft size={14} />
                            </div>
                        </motion.button>
                    ))
                ) : (
                    <div className="text-center py-20 animate-pulse text-zinc-600 text-xs font-bold uppercase tracking-widest">
                        Initializing scan...
                    </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STAGE: VERIFYING */}
          {state === 'VERIFYING' && selectedDevice && (
            <motion.div 
              key="verifying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col space-y-10"
            >
                <div className="text-center space-y-4 py-6">
                    <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-[30px] flex items-center justify-center mx-auto text-blue-500">
                        <Shield size={32} className="animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black">Security Pin</h3>
                        <p className="text-zinc-500 text-sm font-medium">Verify connection to {selectedDevice.name}</p>
                    </div>
                </div>

                <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3].map((i) => (
                        <div 
                            key={i}
                            className={cn(
                                "w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all duration-300",
                                inputCode.length === i ? "border-blue-500 bg-blue-500/10 scale-105 shadow-lg shadow-blue-500/10" : 
                                inputCode.length > i ? "border-white/20 bg-white/5 text-white" : "border-white/5 bg-transparent text-zinc-800"
                            )}
                        >
                            {inputCode[i] || "•"}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => inputCode.length < 4 && setInputCode(prev => prev + num)}
                            className="h-16 rounded-2xl bg-white/5 border border-white/5 text-xl font-bold hover:bg-white/10 active:scale-90 transition-all"
                        >
                            {num}
                        </button>
                    ))}
                    <button 
                        onClick={() => setInputCode('')}
                        className="h-16 rounded-2xl bg-white/5 border border-white/5 text-xs font-black uppercase tracking-widest text-zinc-500 hover:bg-white/10 active:scale-90 transition-all"
                    >
                        CLR
                    </button>
                    <button
                        onClick={() => inputCode.length < 4 && setInputCode(prev => prev + "0")}
                        className="h-16 rounded-2xl bg-white/5 border border-white/5 text-xl font-bold hover:bg-white/10 active:scale-90 transition-all"
                    >
                        0
                    </button>
                    <button 
                        onClick={() => setInputCode(prev => prev.slice(0, -1))}
                        className="h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                <div className="pt-4 space-y-4">
                    <button 
                        onClick={handleVerify}
                        disabled={inputCode.length !== 4 || isVerifying}
                        className={cn(
                            "w-full py-5 rounded-[25px] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                            inputCode.length === 4 
                                ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                                : "bg-zinc-900 text-zinc-600 border border-white/5"
                        )}
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Connection"
                        )}
                    </button>
                    <button 
                        onClick={() => setState('SCANNING')}
                        className="w-full py-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                        Cancel Connection
                    </button>
                </div>
            </motion.div>
          )}

          {/* STAGE 3: SELECT MUSIC */}
          {state === 'SELECT_MUSIC' && (
            <motion.div 
              key="select-music"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-full space-y-6"
            >
              <div className="flex items-center justify-between px-1">
                <div>
                   <h3 className="text-lg font-black tracking-tight">Select Music</h3>
                   <p className="text-xs text-zinc-500 font-medium">Transferring to {selectedDevice?.name}</p>
                </div>
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-black">
                    {selectedSongs.length} SELECTED
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[450px] space-y-2 pr-2 custom-scrollbar">
                {allSongs.map((song) => {
                    const isSelected = selectedSongs.find(s => s.id === song.id);
                    return (
                        <button
                            key={song.id}
                            onClick={() => toggleSongSelection(song)}
                            className={cn(
                                "w-full flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300",
                                isSelected 
                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                                    : "bg-zinc-900/50 border-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                                <img src={song.thumbnail} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                                <p className="text-sm font-bold truncate">{song.title}</p>
                                <p className={cn("text-[10px] truncate uppercase font-bold tracking-wider", isSelected ? "text-blue-100" : "text-zinc-500")}>
                                    {song.artist}
                                </p>
                            </div>
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                isSelected ? "bg-white border-white text-blue-600" : "border-zinc-700"
                            )}>
                                {isSelected && <CheckCircle2 size={14} className="fill-current" />}
                            </div>
                        </button>
                    )
                })}
              </div>

              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                 <button 
                    onClick={() => setState('SCANNING')}
                    className="py-4 rounded-2xl bg-zinc-900 border border-white/5 font-bold text-sm hover:bg-zinc-800 transition-all"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={startTransfer}
                    disabled={selectedSongs.length === 0}
                    className="py-4 rounded-2xl bg-blue-600 font-black text-sm text-white shadow-xl shadow-blue-600/10 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
                 >
                    Beam Transfer
                 </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: SENDING */}
          {state === 'SENDING' && (
            <motion.div 
              key="transferring"
              className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
            >
              <div className="relative w-56 h-56">
                <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full animate-pulse" />
                <svg className="w-full h-full -rotate-90 relative z-10">
                  <circle 
                    cx="112" cy="112" r="100" 
                    className="stroke-zinc-900 fill-none" 
                    strokeWidth="10"
                  />
                  <motion.circle 
                    cx="112" cy="112" r="100" 
                    className="stroke-blue-500 fill-none" 
                    strokeWidth="10"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 628" }}
                    animate={{ strokeDasharray: `${(progress / 100) * 628} 628` }}
                    transition={{ ease: "linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black">{Math.floor(progress)}%</span>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mt-1">Beaming Data</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                  <h3 className="text-xl font-black">Sending to {selectedDevice?.name}</h3>
                </div>
                <div className="bg-zinc-900/50 py-2 px-4 rounded-full border border-white/5 inline-block mx-auto">
                    <p className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                        <Music size={12} className="text-blue-500" />
                        {selectedSongs.length} Songs in Orbit
                    </p>
                </div>
                <p className="text-xs text-zinc-600 font-medium px-10">Keep both devices in range for optimal high-speed Bluetooth transfer.</p>
              </div>
            </motion.div>
          )}

          {/* STAGE 5: COMPLETE */}
          {state === 'COMPLETE' && (
            <motion.div 
              key="complete"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-3xl animate-pulse" />
                <div className="w-28 h-28 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/30 relative">
                    <CheckCircle2 size={54} />
                </div>
              </div>
              
              <div className="space-y-4 px-6">
                <h2 className="text-3xl font-black italic tracking-tight">Success!</h2>
                <p className="text-zinc-500 text-sm font-medium">
                  {selectedSongs.length} tracks have been beamed to **{selectedDevice?.name}** successfully.
                </p>
              </div>

              <div className="w-full space-y-3 pt-6">
                <button 
                    onClick={() => { setState('IDLE'); setSelectedSongs([]); }}
                    className="w-full py-4 rounded-2xl bg-white text-black font-black active:scale-95 transition-all shadow-xl"
                >
                    Beam Another
                </button>
                <button 
                    onClick={() => router.push('/library')}
                    className="w-full py-4 rounded-2xl bg-zinc-900 text-white font-bold border border-white/5 hover:bg-zinc-800 transition-all"
                >
                    Return to Library
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
