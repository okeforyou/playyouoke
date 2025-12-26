import React from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { playerService } from "../services/playerService";

export const PlayerControls = () => {
    const { isPlaying, volume, isMuted } = usePlayerStore();

    const togglePlay = () => {
        if (isPlaying) {
            playerService.pause();
        } else {
            playerService.play();
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseInt(e.target.value);
        playerService.setVolume(vol);
    };

    return (
        <div className="flex flex-col gap-2 p-4 w-full bg-base border-b border-border">
            {/* Progress Bar (Fake for now) */}
            <div className="w-full h-1 bg-gray-200 rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-primary w-0 transition-all duration-300"></div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Controls */}
                    <button onClick={() => playerService.playPrevious()} className="text-text-base hover:text-primary transition">
                        <SkipBack size={20} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition shadow-md"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                    </button>

                    <button onClick={() => {
                        console.log("⏭️ User clicked Next");
                        playerService.playNext();
                    }} className="text-text-base hover:text-primary transition">
                        <SkipForward size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <Volume2 size={16} className="text-text-muted" />
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="range range-xs range-primary w-24"
                    />
                </div>
            </div>
        </div>
    );
};
