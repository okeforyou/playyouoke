import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import { usePlayerStore } from "../stores/usePlayerStore";
import { playerService } from "../services/playerService";
import { YouTubeAdapter } from "../adapters/YouTubeAdapter";

export const SidebarPlayer = () => {
    const { currentSource, isPlaying } = usePlayerStore();
    const playerRef = useRef<any>(null);

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
        </div>
    );
};
