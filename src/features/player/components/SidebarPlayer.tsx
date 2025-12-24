import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { usePlayerStore } from "../stores/usePlayerStore";
import { playerService } from "../services/playerService";
import { YouTubeAdapter } from "../adapters/YouTubeAdapter";
import { useSystemConfig } from "../../../hooks/useSystemConfig";
import { useAuthStore } from "../../auth/useAuthStore";

export const SidebarPlayer = () => {
    const { currentSource, isPlaying } = usePlayerStore();
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

    useEffect(() => {
        console.log("🔍 SidebarPlayer Limits Updated:", { userRole, maxDuration, showAds, configLoaded: !!config });
    }, [userRole, maxDuration, showAds, config]);

    // ... (rest of onReady, onStateChange, etc) ...

    return (
        <div className="w-full h-full relative group">
            {/* YouTube Layer */}
            <div className={`absolute inset-0 z-0 ${showAds ? 'pointer-events-none' : ''}`}> {/* Disable interaction if ads are forcefully shown? Or just overlay */}
                <YouTube
                    videoId={currentSource || ""}
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    className="w-full h-full object-cover"
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

        </div>
    );
};
