export interface MediaPlayerAdapter {
    id: string; // 'youtube' | 'local' | 'midi'
    play(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>; // acts like play
    stop(): Promise<void>;
    seekTo(seconds: number): Promise<void>;
    setVolume(volume: number): Promise<void>;
    getDuration(): Promise<number>;
    getCurrentTime(): Promise<number>;
    loadMedia(source: string): Promise<void>;
}

export interface Video {
    videoId: string;
    title: string;
    author: string;
    thumbnail?: string;
    duration?: number;
    addedBy?: {
        uid: string;
        displayName: string;
        photoURL?: string;
    };
}

export interface QueueItem extends Video {
    uuid: string; // Unique ID for queue manipulation (handling duplicates)
}

export interface PlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    currentSource: string | null;
    adapterId: string;
    // We shouldn't put 'queue' directly in PlayerState if PlayerState is just for the "Engine".
    // But typically the Store holds both.
    // Let's keep PlayerState as the "Playback Status" and the Store as the "App State".
}
