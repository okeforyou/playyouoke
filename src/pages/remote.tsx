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
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'monitor-mode'>('connecting');
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [nowPlaying, setNowPlaying] = useState<QueueItem | null>(null);
    const [hostStatus, setHostStatus] = useState({ isPlaying: false, isMuted: false });

    // Guest Auth
    const [guestName, setGuestName] = useState<string>('');
    const [showNameModal, setShowNameModal] = useState(false);

    // Search State
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setSearching] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Load name from storage on mount
        const storedName = localStorage.getItem('youoke_guest_name');
        if (storedName) {
            setGuestName(storedName);
        } else {
            setShowNameModal(true);
        }
    }, []);

    useEffect(() => {
        if (!roomCode || typeof roomCode !== 'string') return;
        if (showNameModal) return; // Wait for name

        const connect = async () => {
            if (!auth) {
                setStatus('error');
                return;
            }
            // Use existing auth if available (e.g. if they logged in before)
            // But we prefer anonymous for guests.
            if (!auth.currentUser) {
                try {
                    await signInAnonymously(auth);
                } catch (e) {
                    console.error("Auth failed", e);
                    setStatus('error');
                    return;
                }
            }

            // Start Sync Loop
            const dbURL = realtimeDb.app.options.databaseURL;

            // Poll for room state
            const syncInterval = setInterval(async () => {
                try {
                    const res = await fetch(`${dbURL}/antigravity_rooms/${roomCode}/state.json`);
                    const data = await res.json();
                    if (data) {
                        setStatus('connected');
                        setQueue(data.queue || []);
                        setNowPlaying(data.currentVideo);
                        setHostStatus(data.controls || {});
                    } else {
                        // Room might not exist yet or empty
                    }
                } catch (e) {
                    console.error('Remote Sync Error:', e);
                }
            }, 2000); // Poll every 2s to save bandwidth

            return () => clearInterval(syncInterval);
        };

        connect();
    }, [roomCode, showNameModal]); // Re-run when name is set

    const handleSaveName = (name: string) => {
        if (!name.trim()) return;
        const finalName = name.trim().slice(0, 15); // Limit length
        localStorage.setItem('youoke_guest_name', finalName);
        setGuestName(finalName);
        setShowNameModal(false);
    };

    const sendCommand = async (type: string, payload: any = {}) => {
        if (!roomCode || !auth.currentUser) return;

        const dbURL = realtimeDb.app.options.databaseURL;

        try {
            const token = await auth.currentUser.getIdToken();
            const cmdId = Date.now().toString();

            // Enrich payload with Guest Info
            const enrichedPayload = {
                ...payload,
                addedBy: {
                    uid: auth.currentUser.uid,
                    name: guestName || 'Anonymous',
                }
            };

            const commandEnvelope = {
                command: { type, payload: enrichedPayload },
                status: 'pending',
                timestamp: Date.now(),
                senderId: auth.currentUser.uid,
                senderName: guestName // Include at top level too
            };

            await fetch(`${dbURL}/antigravity_rooms/${roomCode}/commands/${cmdId}.json?auth=${token}`, {
                method: 'PUT',
                body: JSON.stringify(commandEnvelope)
            });
        } catch (e) {
            console.error(e);
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
        // Just send the video, the 'addedBy' logic is in sendCommand now
        sendCommand('ADD_TO_QUEUE', { video: videoItem });
        setSearchOpen(false);
        setSearchTerm('');
        setSearchResults([]);
        // Feedback
        alert(`Added "${video.title}" to queue!`);
    };

    if (!roomCode) return <div className="p-10 text-center">No Room Code Provided</div>;
    if (status === 'error') return <div className="p-10 text-center text-red-500">Connection Failed (Auth Error)</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10 shadow-md">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                        <h1 className="text-sm font-bold leading-none">Review Room: {roomCode}</h1>
                        <span className="text-xs text-gray-400">👋 {guestName}</span>
                    </div>
                </div>
                <div className="text-xs bg-gray-800 px-2 py-1 rounded">
                    {queue.length} Songs
                </div>
            </div>

            {/* Now Playing Card */}
            <div className="p-4 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900/20 to-gray-900">
                {nowPlaying ? (
                    <div className="w-full max-w-sm bg-gray-800/50 rounded-xl p-4 flex gap-4 items-center backdrop-blur-sm border border-white/5">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden shadow-lg shrink-0 flex items-center justify-center">
                            <span className="text-2xl">📀</span>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold line-clamp-2 text-white">{nowPlaying.title}</h2>
                            <p className="text-xs text-gray-400 mt-1 truncate">{nowPlaying.author}</p>
                            {/* Show who added this tracking if available (needs backend support first) */}
                            {/* <p className="text-[10px] text-indigo-400 mt-1">Requested by {nowPlaying.addedBy?.name}</p> */}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm py-4">Waiting for music...</div>
                )}
            </div>

            {/* Controls (Host Only? For now let everyone control for fun) */}
            <div className="px-4 pb-6 flex justify-center items-center gap-6">
                <button onClick={() => sendCommand('PREVIOUS')} className="p-3 bg-gray-800 rounded-full active:scale-90 transition shadow-lg"><BackwardIcon className="w-6 h-6 text-gray-300" /></button>
                <button
                    onClick={() => sendCommand(hostStatus.isPlaying ? 'PAUSE' : 'PLAY')}
                    className="p-5 bg-indigo-600 rounded-full shadow-xl shadow-indigo-600/30 active:scale-90 transition hover:bg-indigo-500"
                >
                    {hostStatus.isPlaying ? <PauseIcon className="w-8 h-8 text-white" /> : <PlayIcon className="w-8 h-8 text-white" />}
                </button>
                <button onClick={() => sendCommand('NEXT')} className="p-3 bg-gray-800 rounded-full active:scale-90 transition shadow-lg"><ForwardIcon className="w-6 h-6 text-gray-300" /></button>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto px-4 pb-20 bg-gray-900">
                <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wider mb-3 sticky top-0 bg-gray-900 py-2 z-10">Up Next</h3>
                {queue.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <span className="text-4xl mb-2">👻</span>
                        <p className="text-sm">Queue is empty</p>
                        <p className="text-xs">Add a song to start the party!</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {queue.map((item, idx) => (
                            <li key={idx} className={`p-3 rounded-lg flex gap-3 items-center ${idx === (hostStatus as any).currentIndex ? 'bg-indigo-900/30 border border-indigo-500/30' : 'bg-gray-800/30'}`}>
                                <span className={`text-xs font-mono w-4 text-center ${idx === (hostStatus as any).currentIndex ? 'text-indigo-400 animate-pulse' : 'text-gray-600'}`}>
                                    {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium truncate ${idx === (hostStatus as any).currentIndex ? 'text-indigo-300' : 'text-gray-200'}`}>{item.title}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500 truncate max-w-[120px]">{item.author}</span>
                                        {/* Placeholder for future Added By */}
                                        {/* <span className="text-[10px] bg-gray-700 px-1.5 rounded text-gray-400">by {item.addedBy?.name || 'Guest'}</span> */}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* FAB to Add Songs */}
            <button
                onClick={() => setSearchOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-600/50 flex items-center justify-center text-3xl active:scale-90 transition z-20 hover:bg-indigo-500 ring-2 ring-indigo-400/50"
            >
                <span className="mb-1 text-white">+</span>
            </button>

            {/* Name Entry Modal */}
            {showNameModal && (
                <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-xs bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl animate-bounce">
                            🎤
                        </div>
                        <h2 className="text-xl font-bold mb-2">Join the Party!</h2>
                        <p className="text-gray-400 text-sm mb-6">Enter your nickname to start requesting songs.</p>

                        <form onSubmit={(e) => { e.preventDefault(); handleSaveName((e.target as any).nickname.value); }}>
                            <input
                                name="nickname"
                                autoFocus
                                type="text"
                                placeholder="Your Name (e.g. DJ Jo)"
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-center text-white mb-4 focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                                maxLength={15}
                            />
                            <button type="submit" className="w-full btn btn-primary rounded-xl text-lg font-bold">
                                Let's go! 🚀
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Search Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col animate-in slide-in-from-bottom duration-200">
                    <div className="p-4 flex gap-3 items-center border-b border-gray-800 bg-gray-900">
                        <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-white p-2">
                            ✕
                        </button>
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search YouTube..."
                            className="flex-1 bg-gray-800 border-none rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-gray-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-900">
                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-gray-500">Searching...</span>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="space-y-4">
                                {searchResults.map((video) => (
                                    <div key={video.videoId} onClick={() => handleAdd(video)} className="flex gap-4 items-center active:opacity-60 cursor-pointer p-2 rounded-lg hover:bg-gray-800/50 transition">
                                        <div className="w-24 h-14 bg-gray-800 rounded-md overflow-hidden shrink-0 shadow-sm relative group">
                                            <img src={video.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${video.videoId}/default.jpg`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-semibold text-white line-clamp-2 leading-tight">{video.title}</div>
                                            <div className="text-xs text-gray-400 mt-1">{video.author}</div>
                                        </div>
                                        <button className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-full text-indigo-400 border border-gray-700 shadow-sm">
                                            +
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : searchTerm ? (
                            <div className="text-center text-gray-500 py-20">No results found</div>
                        ) : (
                            <div className="text-center text-gray-600 py-20 flex flex-col items-center">
                                <span className="text-4xl mb-3">🎹</span>
                                <p>Search for your favorite songs</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
