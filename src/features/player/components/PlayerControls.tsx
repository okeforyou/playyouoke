import React from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { playerService } from "../services/playerService";

export const PlayerControls = () => {
    const { isPlaying, volume, isMuted, playNext, playPrevious } = usePlayerStore();

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
        <div className="flex flex-col gap-1 p-4 w-full bg-white z-20">
            {/* Progress Bar (Slim Red Line) */}
            <div className="w-full h-1 bg-gray-100 rounded-full mb-3 overflow-hidden cursor-pointer group">
                <div className="h-full bg-primary w-2/3 group-hover:w-full transition-all duration-500 ease-out shadow-sm"></div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Controls */}
                    <button onClick={() => playPrevious()} className="text-gray-400 hover:text-primary transition-colors">
                        <SkipBack size={22} strokeWidth={2} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-95"
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" strokeWidth={0} /> : <Play size={24} fill="currentColor" className="ml-1" strokeWidth={0} />}
                    </button>

                    <button onClick={() => {
                        console.log("⏭️ User clicked Next");
                        playNext();
                    }} className="text-gray-400 hover:text-primary transition-colors">
                        <SkipForward size={22} strokeWidth={2} />
                    </button>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    <button onClick={() => playerService.setVolume(isMuted ? 50 : 0)} className="text-gray-400 hover:text-gray-600 transition">
                        {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
            </div>

            {/* Playing Info (Optional Placeholder) */}
            <div className="mt-2 text-center lg:text-left">
                {/* Could put Song Title here if not in header */}
            </div>
        </div>
    );
};
