import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { usePlayerStore } from "../stores/usePlayerStore";
import { playerService } from "../services/playerService";
import { YouTubeAdapter } from "../adapters/YouTubeAdapter";
import { useSystemConfig } from "../../../hooks/useSystemConfig";
import { useAuthStore } from "../../auth/useAuthStore";

export const SidebarPlayer = () => {
    const { currentSource, isPlaying, currentVideo } = usePlayerStore();
    const playerRef = useRef<any>(null);

    // System Config & Auth for Restrictions
    const { config } = useSystemConfig();
    const { user } = useAuthStore();

    // Determine Role & Limits
    const userRole = (user?.role === 'admin' || user?.role === 'premium') ? 'premium' : 'free';
    const limits = config?.membership[userRole];
    const maxDuration = limits?.max_duration_sec || 0;
    const showAds = limits?.show_ads || false; // Default false
    const maxDailySongs = limits?.max_daily_songs || 0;

    // Track Daily Songs
    useEffect(() => {
        if (!currentSource || maxDailySongs === 0) return;

        const today = new Date().toISOString().split('T')[0];
        const storageKey = `daily_songs_${today}`;
        const currentCount = parseInt(localStorage.getItem(storageKey) || '0');

        console.log(`📊 Daily Play Count: ${currentCount} / ${maxDailySongs}`);

        if (currentCount >= maxDailySongs) {
            console.log("⛔ Daily limit reached!");
            usePlayerStore.setState({ isPlaying: false }); // Stop playback
            alert(`⛔ โควต้าฟังเพลงต่อวันหมดแล้วครับ (${maxDailySongs} เพลง)\nกรุณาอัปเกรดสมาชิกเพื่อฟังต่อ`);
            return;
        }

        // Increment count (simple dedup by source would be better, but count starts valid enough)
        // We only increment if this is a NEW song. Logic-wise we need effect to run only on source change.
        const hasCountedKey = `counted_${currentSource}`;
        if (!sessionStorage.getItem(hasCountedKey)) {
            localStorage.setItem(storageKey, (currentCount + 1).toString());
            sessionStorage.setItem(hasCountedKey, 'true');
        }

    }, [currentSource, maxDailySongs]);

    // Initialize CastService (Host Mode)
    useEffect(() => {
        // Only init if we are the "Host" (Desktop/Browser)
        // Ideally we check if we are casting? No, we ARE the host even if not casting physically.
        // We want to be controllable by Remote.
        import("../../cast/services/CastService").then(({ castService }) => {
            castService.initialize().then((code) => {
                console.log("📡 Host Service Started. Room Code:", code);
                // Optionally save code to state to display it
            });
        });

        // Cleanup? castService.cleanup() but maybe we want it persistent.
    }, []);

    useEffect(() => {
        console.log("🔍 SidebarPlayer Limits Updated:", { userRole, maxDuration, showAds, configLoaded: !!config });
    }, [userRole, maxDuration, showAds, config]);

    const opts = {
        height: "100%",
        width: "100%",
        playerVars: {
            autoplay: 1 as 0 | 1,
            controls: 0 as 0 | 1, // Hide default controls
            modestbranding: 1 as const,
        },
    };

    const onReady = (event: any) => {
        playerRef.current = event.target;
        // Register this player instance with the adapter
        const adapter = playerService.getAdapter();
        if (adapter instanceof YouTubeAdapter) {
            adapter.setPlayer(event.target);
        }
    };

    const onStateChange = (event: any) => {
        // 0 = Ended, 1 = Playing, 2 = Paused
        if (event.data === 0) {
            console.log("🎬 Video ended, playing next...");
            usePlayerStore.getState().playNext();
        }
    };

    // ⏱️ Enforce Duration Limit
    useEffect(() => {
        if (!playerRef.current || !isPlaying || maxDuration === 0) return;

        const interval = setInterval(() => {
            const currentTime = playerRef.current.getCurrentTime();
            if (currentTime >= maxDuration) {
                console.log(`⏱️ Time limit reached (${maxDuration}s). Skipping...`);
                usePlayerStore.getState().playNext();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying, maxDuration, currentSource]);

    // 🎵 Sync Play/Pause State with YouTube Player
    useEffect(() => {
        if (!playerRef.current) return;
        try {
            if (isPlaying) {
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }
        } catch (e) {
            console.warn("Player control error:", e);
        }
    }, [isPlaying]);

    // 🍞 Toast Logic
    const [showToast, setShowToast] = React.useState(false);

    useEffect(() => {
        if (currentSource && currentVideo?.addedBy) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 8000); // Hide after 8s
            return () => clearTimeout(timer);
        } else {
            setShowToast(false);
        }
    }, [currentSource, currentVideo]);

    return (
        <div className="w-full h-full relative group">
            {/* YouTube Layer */}
            <div className={`absolute inset-0 max-h-full max-w-full z-0 youtube-player-wrapper`}> {/* Always allow interaction */}
                <YouTube
                    videoId={currentSource || ""}
                    opts={{
                        ...opts,
                        height: '100%',
                        width: '100%',
                        playerVars: {
                            ...opts.playerVars,
                            controls: 1, // Enable native controls
                        }
                    }}
                    iframeClassName="w-full h-full absolute inset-0 object-cover"
                    className="w-full h-full relative"
                    onReady={onReady}
                    onStateChange={onStateChange}
                />
            </div>

            {/* AD OVERLAY (If show_ads is TRUE) */}
            {showAds && isPlaying && (
                <div className="absolute inset-x-0 bottom-0 h-16 bg-red-600 text-white z-40 flex items-center justify-between px-4 animate-bounce">
                    <span className="font-bold text-sm">📢 THIS IS AN ADVERTISEMENT</span>
                    <button className="btn btn-xs btn-white text-red-600">Upgrade to Remove</button>
                </div>
            )}

            {/* Overlay (Waiting) */}
            {!currentSource && (
                <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center text-white/50">
                    <p>Waiting for track...</p>
                </div>
            )}

            {/* Limit Indicator */}
            {maxDuration > 0 && currentSource && (
                <div className="absolute top-2 right-2 z-20 badge badge-warning gap-1 opacity-80 text-xs">
                    <span>⏱️ Limit: {maxDuration}s</span>
                </div>
            )}

            {/* Daily Limit Badge */}
            {maxDailySongs > 0 && currentSource && (
                <div className="absolute top-8 right-2 z-20 badge badge-info gap-1 opacity-80 text-xs">
                    <span>📊 Quota: {localStorage.getItem(`daily_songs_${new Date().toISOString().split('T')[0]}`) || 0}/{maxDailySongs}</span>
                </div>
            )}

            {/* Added By Toast (Animated) */}
            {showToast && currentVideo?.addedBy && (
                <div className={`absolute bottom-8 left-6 z-30 transition-all duration-700 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex items-center gap-4 bg-black/70 backdrop-blur-xl border border-white/10 rounded-full pl-2 pr-6 py-2 shadow-2xl ring-1 ring-white/5">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-inner text-white font-bold ring-2 ring-black/50">
                            {/* Avatar or Initial */}
                            {currentVideo.addedBy.photoURL ? (
                                <img src={currentVideo.addedBy.photoURL} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span>{((currentVideo.addedBy as any).name || currentVideo.addedBy.displayName || '?').charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider leading-none mb-1">Requested By</span>
                            <span className="text-base font-bold text-white leading-none truncate max-w-[200px] drop-shadow-md">
                                {(currentVideo.addedBy as any).name || currentVideo.addedBy.displayName}
                            </span>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
