import { create } from 'zustand';
import { PlayerState, MediaPlayerAdapter } from '../types';

interface PlayerStore extends PlayerState {
    queue: any[]; // Define Video type later
    activeAdapterId: string;

    // Actions
    setVolume: (vol: number) => void;
    setMuted: (muted: boolean) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    setActiveAdapter: (id: string) => void;

    // Internal (called by adapters)
    setPlayerState: (state: Partial<PlayerState>) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    isMuted: false,
    currentSource: null,
    adapterId: 'youtube', // Default
    activeAdapterId: 'youtube',
    queue: [],

    setVolume: (vol) => set({ volume: vol }),
    setMuted: (muted) => set({ isMuted: muted }),

    play: () => set({ isPlaying: true }), // Start optimistic
    pause: () => set({ isPlaying: false }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    setActiveAdapter: (id) => set({ activeAdapterId: id }),

    setPlayerState: (state) => set((prev) => ({ ...prev, ...state })),
}));
