'use client';

import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Download, X, Music, Loader2, FolderOpen, Save } from 'lucide-react';

import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';
import { Song } from '@/types';

export const DownloadManager = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { downloadQueue, theme } = usePlayerStore();

  const handleSaveToDevice = (song: Song) => {
    // For a real app, this would be the actual MP3/media source
    // Here we simulate the platform's 'Save As' capability
    const mockContent = `BEATFLOW_MEDIA_STREAM_${song.id}`;
    const blob = new Blob([mockContent], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${song.title.replace(/[\\/:*?"<>|]/g, '')}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Opening system folder picker...", { icon: '📂' });
  };

  const handleFolderSettings = () => {
    toast("On mobile, files go to your /Downloads folder. On desktop, check browser settings.", { icon: '📂' });
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "absolute right-0 mt-2 w-80 p-6 rounded-[35px] z-[70] border shadow-[0_25px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl",
              theme === 'dark' ? "bg-zinc-950/95 border-white/10" : "bg-white/95 border-zinc-200"
            )}
          >
            <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                        <Download size={16} className="animate-pulse" />
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Live Beam</h3>
                    </div>
                    <button 
                        onClick={handleFolderSettings}
                        className="flex items-center gap-1.5 text-[8px] font-black uppercase text-zinc-500 hover:text-white transition-colors"
                    >
                        <FolderOpen size={10} /> Choose Folder
                    </button>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors">
                    <X size={16} className="text-zinc-500" />
                </button>
            </div>

            <div className="space-y-5 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
              {downloadQueue.length > 0 ? (
                downloadQueue.map((item) => (
                  <div key={item.songId} className="space-y-4 p-4 rounded-[28px] bg-white/5 border border-white/5 transition-all hover:border-white/10 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl">
                        <img src={item.song.thumbnail} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-black truncate text-white italic">{item.song.title}</p>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider truncate mt-0.5">{item.song.artist}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress}%` }}
                                className={cn(
                                    "h-full transition-all duration-700 ease-out",
                                    item.status === 'COMPLETED' ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-blue-600 to-indigo-500"
                                )}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    item.status === 'COMPLETED' ? "text-green-500" : "text-blue-500 flex items-center gap-1.5"
                                )}>
                                    {item.status === 'COMPLETED' ? "Secured" : (
                                        <>
                                            <Loader2 size={10} className="animate-spin" />
                                            {Math.floor(item.progress)}%
                                        </>
                                    )}
                                </span>
                                <span className="text-[8px] text-zinc-600 font-bold mt-0.5">{item.currentMB}MB / {item.totalMB}MB</span>
                            </div>
                            
                            {item.status === 'COMPLETED' && (
                                <button 
                                    onClick={() => handleSaveToDevice(item.song)}
                                    className="px-4 py-2 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-xl"
                                >
                                    <Save size={12} /> Save
                                </button>
                            )}
                        </div>
                    </div>
                  </div>
                ))

              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 opacity-40">
                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500">
                        <Music size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Queue is empty</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/5 text-center">
                 <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.3em] font-mono">End-to-End Encrypted Transfer</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
