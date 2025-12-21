import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth, realtimeDb } from '../firebase';
import { QueueItem } from '../features/player/types';
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid';

export default function RemotePage() {
    const router = useRouter();
    const { room: roomCode } = router.query;

    // State
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [nowPlaying, setNowPlaying] = useState<QueueItem | null>(null);
    const [hostStatus, setHostStatus] = useState({ isPlaying: false, isMuted: false });

    // Search State
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setSearching] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!roomCode || typeof roomCode !== 'string') return;

        const connect = async () => {
            if (!auth) {
                setStatus('error');
                return;
            }
            if (!auth.currentUser) await signInAnonymously(auth);

            // Start Sync Loop
            // NOTE: We are using POLLING to avoid stack overflows from the legacy bug
            // In V2, we are using /antigravity_rooms/, so we are technically safe from the recursion bug
            // But let's stick to polling for consistency with the CastService design we just built.

            const dbURL = realtimeDb.app.options.databaseURL;

            setInterval(async () => {
                try {
                    const res = await fetch(`${dbURL}/antigravity_rooms/${roomCode}/state.json`);
                    const data = await res.json();
                    if (data) {
                        setStatus('connected');
                        setQueue(data.queue || []);
                        setNowPlaying(data.currentVideo);
                        setHostStatus(data.controls || {});
                    }
                } catch (e) {
                    console.error('Remote Sync Error:', e);
                }
            }, 1000);
        };

        connect();
    }, [roomCode]);

    const sendCommand = async (type: string, payload: any = {}) => {
        if (!roomCode) {
            alert('Error: Missing Room Code');
            return;
        }
        if (!auth.currentUser) {
            alert('Error: Not Authenticated');
            return;
        }

        const dbURL = realtimeDb.app.options.databaseURL;
        // Debug URL
        // console.log('DB URL:', dbURL); 

        try {
            const token = await auth.currentUser.getIdToken();
            const cmdId = Date.now().toString();

            const commandEnvelope = {
                command: { type, payload },
                status: 'pending',
                timestamp: Date.now(),
                senderId: auth.currentUser.uid
            };

            const res = await fetch(`${dbURL}/antigravity_rooms/${roomCode}/commands/${cmdId}.json?auth=${token}`, {
                method: 'PUT',
                body: JSON.stringify(commandEnvelope)
            });

            if (!res.ok) {
                const text = await res.text();
                alert(`Command Failed: ${res.status} ${res.statusText}\n${text}`);
            }
        } catch (e: any) {
            alert(`Network Error: ${e.message}`);
        }
    };

    // Search Logic
    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (debounceTimer) clearTimeout(debounceTimer);

        if (!term.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                // Dynamic import to avoid SSR issues if api utils use browser stuff
                const { getSearchResult } = await import('../utils/api');
                const results = await getSearchResult({ q: term });
                setSearchResults(results);
            } catch (e) {
                console.error('Search failed', e);
            } finally {
                setSearching(false);
            }
        }, 800);
        setDebounceTimer(timer);
    };

    const handleAdd = (video: any) => {
        // Convert Search Result to Video Type
        const videoItem = {
            videoId: video.videoId,
            title: video.title,
            author: video.author,
            // Remote doesn't strictly need thumbnails but good to have
            // The API returns videoThumbnails array
        };
        sendCommand('ADD_TO_QUEUE', { video: videoItem });
        setSearchOpen(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    if (!roomCode) return <div className="p-10 text-center">No Room Code Provided</div>;
    if (status === 'error') return <div className="p-10 text-center text-red-500">Connection Failed (Auth Error)</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
                <div>
                    <span className="text-xs text-green-400 font-mono block">CONNECTED</span>
                    <h1 className="text-xl font-bold">Room {roomCode}</h1>
                </div>
                <div className="text-xs text-gray-400">
                    {queue.length} Songs
                </div>
            </div>

            {/* Now Playing */}
            <div className="p-6 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
                {nowPlaying ? (
                    <>
                        <div className="w-32 h-32 bg-gray-700 rounded-lg overflow-hidden mb-4 shadow-2xl relative">
                            {/* Placeholder for thumbnail since we might not have it or it's just ID */}
                            <div className="absolute inset-0 flex items-center justify-center text-4xl">🎵</div>
                            {/* If we had thumbnail URL in Video type, we'd use it */}
                        </div>
                        <h2 className="text-lg font-bold text-center line-clamp-2">{nowPlaying.title}</h2>
                        <p className="text-sm text-gray-400 mt-1">{nowPlaying.author}</p>
                    </>
                ) : (
                    <div className="text-gray-500">Nothing Playing</div>
                )}
            </div>

            {/* Controls */}
            <div className="p-4 flex justify-center items-center gap-6 border-b border-gray-800 pb-6">
                <button onClick={() => sendCommand('PREVIOUS')} className="p-3 bg-gray-800 rounded-full active:scale-95 transition"><BackwardIcon className="w-6 h-6" /></button>
                <button
                    onClick={() => sendCommand(hostStatus.isPlaying ? 'PAUSE' : 'PLAY')}
                    className="p-5 bg-primary rounded-full shadow-lg active:scale-95 transition hover:bg-red-600"
                >
                    {hostStatus.isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                </button>
                <button onClick={() => sendCommand('NEXT')} className="p-3 bg-gray-800 rounded-full active:scale-95 transition"><ForwardIcon className="w-6 h-6" /></button>
            </div>

            {/* Queue */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Up Next</h3>
                {queue.length === 0 ? (
                    <p className="text-center text-gray-600 py-10">Queue is empty</p>
                ) : (
                    <ul className="space-y-2">
                        {queue.map((item, idx) => (
                            <li key={idx} className={`p-3 rounded bg-gray-800/50 flex gap-3 items-center ${idx === (hostStatus as any).currentIndex ? 'border-l-4 border-green-500' : ''}`}>
                                <span className="text-gray-500 font-mono text-xs w-4">{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{item.title}</div>
                                    <div className="text-xs text-gray-400 truncate">{item.author}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* FAB to Add Songs */}
            <button
                onClick={() => setSearchOpen(true)}
                className="fixed bottom-8 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center text-3xl active:scale-90 transition z-20 hover:bg-indigo-500"
            >
                <span className="mb-1">+</span>
            </button>

            {/* Search Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col animate-in fade-in duration-200">
                    <div className="p-4 flex gap-3 items-center border-b border-gray-800">
                        <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-white">Close</button>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Type a song name..."
                            className="flex-1 bg-gray-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-500"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {isSearching ? (
                            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : searchResults.length > 0 ? (
                            <div className="space-y-4">
                                {searchResults.map((video) => (
                                    <div key={video.videoId} onClick={() => handleAdd(video)} className="flex gap-3 items-center active:opacity-70 cursor-pointer">
                                        <div className="w-16 h-9 bg-gray-700 rounded overflow-hidden shrink-0">
                                            <img src={video.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${video.videoId}/default.jpg`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0 flex-1 border-b border-gray-800 pb-4">
                                            <div className="text-sm font-medium text-white truncate">{video.title}</div>
                                            <div className="text-xs text-gray-400">{video.author}</div>
                                        </div>
                                        <button className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-300">Add</button>
                                    </div>
                                ))}
                            </div>
                        ) : searchTerm ? (
                            <div className="text-center text-gray-500 py-10">No results found</div>
                        ) : (
                            <div className="text-center text-gray-600 py-10">Type to search YouTube</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
