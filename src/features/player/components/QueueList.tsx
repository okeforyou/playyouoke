import React from "react";
import { ListMusic, Trash2 } from "lucide-react";
import { usePlayerStore } from "../stores/usePlayerStore";

export const QueueList = () => {
    const { queue } = usePlayerStore();

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-base/50">
            <div className="p-3 font-bold text-sm uppercase tracking-wide text-text-muted border-b border-border flex justify-between items-center bg-base sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <ListMusic size={16} />
                    <span>Queue</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {queue?.length || 0}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {(!queue || queue.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted gap-2 opacity-50">
                        <ListMusic size={48} strokeWidth={1} />
                        <p>Queue is empty</p>
                        <p className="text-xs">Add songs to start singing!</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {queue.map((track: any, index: number) => (
                            <li key={index} className="p-3 hover:bg-base-200 flex gap-3 group transition-colors cursor-pointer">
                                <div className="w-6 text-center text-text-muted text-sm font-mono pt-1">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate text-text-base">
                                        {track.title || "Unknown Track"}
                                    </h4>
                                    <p className="text-xs text-text-muted truncate">
                                        {track.author || "Unknown Artist"}
                                    </p>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
