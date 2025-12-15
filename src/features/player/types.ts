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

export interface PlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    currentSource: string | null;
    adapterId: string;
}
