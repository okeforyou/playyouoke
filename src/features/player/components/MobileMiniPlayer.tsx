import React from "react";
import { Play, Pause, X, ListMusic } from "lucide-react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { playerService } from "../services/playerService";
import YouTube from "react-youtube";
import { SidebarPlayer } from "./SidebarPlayer";

export const MobileMiniPlayer = ({ onExpandQueue }: { onExpandQueue: () => void }) => {
    const { isPlaying, currentSource } = usePlayerStore();

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            playerService.pause();
        } else {
            playerService.play();
        }
    };

    // If no track is loaded, don't show (or show empty state)
    if (!currentSource) return null;

    return (
        <div className="lg:hidden h-16 bg-muted border-t border-border flex items-center px-4 justify-between shrink-0 sticky bottom-0 z-30 shadow-2xl">
            {/* Hidden Player Instance for Mobile Logic if Sidebar is hidden */}
            {/* Note: In MainLayout, SidebarPlayer is hidden on mobile via CSS class 'hidden lg:flex' */}
            {/* We need ONE active Youtube instance. If Sidebar is hidden, we need it here? */}
            {/* Actually, display:none usually keeps the DOM. 'hidden' clsx class sets display:none. */}
            {/* Display none MIGHT stop Youtube playback on some browsers/mobile. */}
            {/* For mobile, we might need a persistent player somewhere visible (1x1 pixel) or the mini player itself contains it. */}

            {/* Let's Try putting the SidebarPlayer logic here too if needed, or rely on MainLayout not unmounting SidebarPlayer but just hiding it? */}
            {/* Wait, 'hidden' in tailwind is display:none. Youtube Player stops in display:none often? */}
            {/* Safe bet: MainLayout uses absolute positioning off-screen for the player if mobile? */}
            {/* For now, assuming sticking with SidebarPlayer being present but hidden. If issues arise, we move SidebarPlayer to a shared persistent hidden container. */}

            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className="w-10 h-10 bg-black rounded-md shrink-0 border border-border overflow-hidden relative">
                    {/* Mini Thumbnail or Video */}
                    <img
                        src={`https://i.ytimg.com/vi/${currentSource}/default.jpg`}
                        alt="Process"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="min-w-0">
                    <p className="font-medium text-sm truncate text-text-base">Now Playing</p>
                    <p className="text-xs text-text-muted truncate">Tap to open</p>
                </div>
            </div>

            <div className="flex gap-3 shrink-0 items-center">
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:scale-105 transition"
                >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>

                <button onClick={onExpandQueue} className="p-2 text-text-muted hover:text-primary">
                    <ListMusic size={24} />
                </button>
            </div>
        </div>
    );
};
