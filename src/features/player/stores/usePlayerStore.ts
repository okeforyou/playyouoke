import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PlayerState, Video, QueueItem } from '../types';

interface PlayerStore extends PlayerState {
    queue: QueueItem[];
    activeAdapterId: string;
    currentIndex: number;
    currentVideo: QueueItem | null;

    // Actions
    setVolume: (vol: number) => void;
    setMuted: (muted: boolean) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    playVideo: (videoId: string) => void;
    setActiveAdapter: (id: string) => void;

    // Queue Actions
    addToQueue: (video: Video) => void;
    removeFromQueue: (uuid: string) => void;
    reorderQueue: (newQueue: QueueItem[]) => void;
    setCurrentIndex: (index: number) => void;
    playNext: () => void;
    playPrevious: () => void;
    clearQueue: () => void;

    // Internal (called by adapters)
    setPlayerState: (state: Partial<PlayerState>) => void;
}

const generateUUID = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const usePlayerStore = create<PlayerStore>()(
    persist(
        (set, get) => ({
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 100,
            isMuted: false,
            currentSource: null,
            adapterId: 'youtube', // Default
            activeAdapterId: 'youtube',
            queue: [],
            currentIndex: 0,
            currentVideo: null,

            setVolume: (vol) => set({ volume: vol }),
            setMuted: (muted) => set({ isMuted: muted }),

            play: () => set({ isPlaying: true }),
            pause: () => set({ isPlaying: false }),
            togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

            playVideo: (videoId) => set((state) => {
                const newItem: QueueItem = {
                    videoId,
                    title: 'Playing Video', // We might not have title here, ideally we fetch it or pass it. 
                    // But for Hero "Play Now", we often just have ID. 
                    // The player will resolve metadata later if needed or we accept generic title.
                    author: 'System',
                    uuid: generateUUID(),
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
                };
                return {
                    queue: [newItem],
                    currentIndex: 0,
                    currentVideo: newItem,
                    currentSource: videoId,
                    isPlaying: true
                };
            }),

            setActiveAdapter: (id) => set({ activeAdapterId: id }),

            setPlayerState: (state) => set((prev) => ({ ...prev, ...state })),

            addToQueue: (video) => set((state) => {
                const newItem: QueueItem = { ...video, uuid: generateUUID() };
                const newQueue = [...state.queue, newItem];

                // If queue was empty, set as current
                if (state.queue.length === 0 && !state.currentVideo) {
                    return {
                        queue: newQueue,
                        currentIndex: 0,
                        currentVideo: newItem,
                        currentSource: newItem.videoId
                    };
                }

                return { queue: newQueue };
            }),

            removeFromQueue: (uuid) => set((state) => {
                const newQueue = state.queue.filter(item => item.uuid !== uuid);
                return { queue: newQueue };
            }),

            reorderQueue: (newQueue) => set({ queue: newQueue }),

            setCurrentIndex: (index) => set((state) => {
                if (index < 0 || index >= state.queue.length) return {};
                const video = state.queue[index];
                return {
                    currentIndex: index,
                    currentVideo: video,
                    currentSource: video.videoId,
                    isPlaying: true // Auto play when changing track
                };
            }),

            playNext: () => {
                const state = get();
                // "Party Mode" logic: Remove played song to keep queue clean
                if (state.queue.length > 0) {
                    // Remove the current song (index 0 usually, but let's be safe)
                    // Actually, if we just shift, index stays 0.
                    // Let's remove the FIRST item if it matches current.
                    const newQueue = state.queue.slice(1); // Remove top

                    if (newQueue.length > 0) {
                        // Play next one
                        const nextVideo = newQueue[0];
                        set({
                            queue: newQueue,
                            currentIndex: 0,
                            currentVideo: nextVideo,
                            currentSource: nextVideo.videoId,
                            isPlaying: true
                        });
                    } else {
                        // Queue finished
                        set({
                            queue: [],
                            currentIndex: 0,
                            currentVideo: null,
                            currentSource: null,
                            isPlaying: false
                        });
                    }
                }
            },

            playPrevious: () => {
                const state = get();
                if (state.currentIndex > 0) {
                    state.setCurrentIndex(state.currentIndex - 1);
                }
            },

            clearQueue: () => set({ queue: [], currentVideo: null, currentSource: null, isPlaying: false, currentIndex: 0 })
        }),
        {
            name: 'youoke-player-storage-v2',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                volume: state.volume,
                // queue: state.queue, // REMOVED: Do not persist queue across sessions
                // Don't persist isPlaying or current playback state to avoid auto-play on reload
            }),
        }
    )
);
