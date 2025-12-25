import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../features/auth/useAuthStore';
import { usePlayerStore } from '../features/player/stores/usePlayerStore';
import { SidebarPlayer } from '../features/player/components/SidebarPlayer';

// Monitor Page: Digital Signage Mode
export default function MonitorPage() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { queue, currentVideo, currentSource } = usePlayerStore();

  useEffect(() => {
    setMounted(true);
    const initCast = async () => {
      const { castService } = await import('../features/cast/services/CastService');
      const code = await castService.initialize();
      setRoomCode(code);
    };
    initCast();
  }, []);

  if (!mounted) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading TV Mode...</div>;

  const isIdle = !currentSource;

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative font-sans text-white selection:bg-pink-500 selection:text-white">
      <Head>
        <title>YouOke TV - Room {roomCode}</title>
      </Head>

      {/*LAYER 0: VIDEO (Background) - Always rendered but covered if idle */}
      <div className={`absolute inset-0 z-0 bg-black transition-opacity duration-1000 ${isIdle ? 'opacity-30' : 'opacity-100'}`}>
        <SidebarPlayer />
      </div>

      {/* LAYER 1: IDLE MODE (Fullscreen Overlay) */}
      <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900/90 to-black/95 backdrop-blur-sm transition-all duration-700 transform ${isIdle ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>

        {/* Brand / Welcome */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tighter drop-shadow-2xl">
            YouOke
          </h1>
          <p className="text-2xl text-gray-300 mt-4 font-light tracking-wide">Digital Jukebox & Karaoke</p>
        </div>

        {/* QR Code (Massive) */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-tr from-pink-500 to-blue-500 rounded-3xl opacity-75 blur-xl group-hover:opacity-100 transition duration-500 animate-pulse"></div>
          <div className="relative bg-white p-6 rounded-2xl shadow-2xl">
            {roomCode && (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                  `${typeof window !== 'undefined' ? window.location.origin : ''}/remote?room=${roomCode}`
                )}`}
                alt="Scan to Join"
                className="w-80 h-80 mix-blend-multiply"
              />
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center space-y-2">
          <p className="text-4xl font-bold text-white">Scan to Join Party 🚀</p>
          <p className="text-xl text-gray-400">Control the music • Add songs • Cheer friends</p>
          <div className="mt-8 inline-block px-6 py-2 bg-white/10 rounded-full border border-white/10 text-xl font-mono text-pink-300">
            Room: {roomCode}
          </div>
        </div>
      </div>

      {/* LAYER 2: CINEMA OVERLAYS (Visible during playback) */}
      <div className={`absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-12 transition-all duration-700 ${!isIdle ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Left: Logo */}
        <div className="flex items-center gap-4">
          <div className="text-3xl font-black tracking-tighter text-white/50">YouOke</div>
        </div>

        {/* Top Right: Small QR */}
        <div className="absolute top-8 right-8 flex flex-col items-center bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl">
          <span className="text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">Join Room</span>
          {roomCode && (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                `${typeof window !== 'undefined' ? window.location.origin : ''}/remote?room=${roomCode}`
              )}`}
              alt="Scan"
              className="w-24 h-24 rounded-lg bg-white p-1"
            />
          )}
          <span className="mt-2 font-mono text-xl font-bold text-pink-400 tracking-widest">{roomCode}</span>
        </div>

        {/* Bottom Area: Next Song Indicator */}
        <div className="mt-auto flex items-end justify-between w-full">
          {/* SidebarPlayer has its own "Now Playing" toast on bottom-left. 
                  We will place the "Next Queue" on Bottom Right. 
              */}
          <div className="flex-1"></div> {/* Spacer */}

          {queue.length > 0 && (
            <div className="max-w-md bg-black/60 backdrop-blur-lg border-l-4 border-indigo-500 p-4 rounded-r-xl rounded-tl-xl shadow-2xl animate-in slide-in-from-right duration-700">
              <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Coming Up Next</p>
              {queue[0] && ( // queue[0] is current, Wait. 
                // If logic says isIdle is false, then queue[0] is PLAYING.
                // "Up Next" should be queue[1].
                queue[1] ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-white truncate">{queue[1].title}</p>
                      <p className="text-sm text-gray-400 truncate">{queue[1].author}</p>
                    </div>
                    {queue[1].addedBy && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold ring-2 ring-black">
                        {queue[1].addedBy.displayName?.charAt(0)}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">Queue is empty. Add a song!</p>
                )
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
