import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useAuthStore } from '../features/auth/useAuthStore';
import { usePlayerStore } from '../features/player/stores/usePlayerStore';
import { SidebarPlayer } from '../features/player/components/SidebarPlayer';

// Use same QR Code logic as MainLayout, but larger
export default function MonitorPage() {
  const { user } = useAuthStore();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { queue, currentVideo } = usePlayerStore();

  useEffect(() => {
    setMounted(true);
    // Initialize Cast Service in Host Mode
    const initCast = async () => {
      const { castService } = await import('../features/cast/services/CastService');
      // Monitor is typically a Host
      const code = await castService.initialize();
      setRoomCode(code);
    };
    initCast();

    return () => {
      // Cleanup provided by service
    };
  }, []);

  if (!mounted) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading TV Mode...</div>;

  return (
    <div className="h-screen w-screen bg-black overflow-hidden flex relative text-white">
      <Head>
        <title>YouOke TV - Room {roomCode}</title>
      </Head>

      {/* Background Ambience (Optional) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black z-0" />

      {/* Left: Player Area (Big) */}
      <div className="flex-1 flex flex-col z-10 p-8 justify-center">
        <div className="aspect-video w-full max-h-[80vh] bg-black shadow-2xl rounded-2xl overflow-hidden border border-gray-800 relative">
          {/* We reuse SidebarPlayer but might need to tweak its styling if it's rigid. 
                         SidebarPlayer typically fills width. 
                     */}
          <SidebarPlayer />

          {/* Overlay info if idle */}
          {!currentVideo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <h1 className="text-4xl font-bold mb-4">Ready to Cast</h1>
              <p className="text-gray-400">Scan the QR code to start singing</p>
            </div>
          )}
        </div>

        {/* Now Playing Info (Below Player) */}
        {currentVideo && (
          <div className="mt-6 pl-2">
            <h2 className="text-3xl font-bold line-clamp-1">{currentVideo.title}</h2>
            <p className="text-xl text-gray-400 mt-1">{currentVideo.author}</p>
          </div>
        )}
      </div>

      {/* Right: Sidebar (QR + Queue) */}
      <div className="w-[400px] bg-gray-900/90 border-l border-gray-800 z-10 flex flex-col backdrop-blur-md">
        {/* Header / Room Info */}
        <div className="p-8 border-b border-gray-800 text-center">
          <p className="text-sm text-green-400 font-mono uppercase tracking-widest mb-2">Room Code</p>
          <h1 className="text-5xl font-bold font-mono tracking-wider mb-6 text-white">{roomCode || '....'}</h1>

          <div className="bg-white p-3 rounded-xl inline-block shadow-lg">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                `${typeof window !== 'undefined' ? window.location.origin : ''}/remote?room=${roomCode}`
              )}`}
              alt="Scan to Join"
              className="w-48 h-48"
            />
          </div>
          <p className="text-sm text-gray-400 mt-4">Scan to Control & Add Songs</p>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700">
          <h3 className="font-bold text-gray-500 uppercase tracking-widest mb-4 text-sm sticky top-0 bg-gray-900 py-2">Up Next</h3>
          {queue.length === 0 ? (
            <div className="text-center text-gray-600 py-10">
              Queue is empty
            </div>
          ) : (
            <ul className="space-y-3">
              {queue.map((item, idx) => (
                <li key={idx} className="flex gap-4 items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="text-2xl font-bold text-gray-600 font-mono w-8 text-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-white">{item.title}</div>
                    <div className="text-sm text-gray-400 truncate">{item.author}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
