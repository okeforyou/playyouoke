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
            // Check current time
            const currentTime = playerRef.current.getCurrentTime();
            if (currentTime >= maxDuration) {
                console.log(`⏱️ Time limit reached (${maxDuration}s). Skipping...`);
                usePlayerStore.getState().playNext();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, maxDuration, currentSource]); // Re-run if song or state changes

    return (
        <div className="w-full h-full relative group">
            {/* YouTube Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Pointer events none to prevent stealing clicks, unless we want interaction */}
                <YouTube
                    videoId={currentSource || ""} // No placeholder
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Overlay (Optional) */}
            {!currentSource && (
                <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center text-white/50">
                    <p>Waiting for track...</p>
                </div>
            )}

            {/* Limit Indicator (Optional Logic: Show badge if limit active) */}
            {maxDuration > 0 && currentSource && (
                <div className="absolute top-2 right-2 z-20 badge badge-warning gap-1 opacity-80 text-xs">
                    <span>⏱️ Limit: {maxDuration}s</span>
                </div>
            )}
        </div>
    );
};
