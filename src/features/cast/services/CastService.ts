import { ref, off, get, set, update, push, child, remove } from 'firebase/database';
import { signInAnonymously } from 'firebase/auth';
import { realtimeDb, auth } from '../../../firebase';
import { usePlayerStore } from '../../player/stores/usePlayerStore';
import { Video } from '../../player/types';

export class CastService {
    private roomCode: string | null = null;
    private unsubscribe: (() => void) | null = null;
    private pollInterval: NodeJS.Timeout | null = null;
    private commandPollInterval: NodeJS.Timeout | null = null;
    private processedCommandIds = new Set<string>();

    constructor() { }

    public async initialize(roomCode?: string): Promise<string> {
        // 0. Guard: Check if Auth is initialized
        if (!auth) {
            console.warn("🔥 Firebase Auth not initialized. Casting disabled. Check .env.local file.");
            return "";
        }

        // 1. Ensure Auth (Anonymous)
        if (!auth.currentUser) {
            try {
                await signInAnonymously(auth);
            } catch (e) {
                console.error("🔥 Anonymous Auth failed:", e);
                return "";
            }
        }

        // 2. Determine Room Code
        this.roomCode = roomCode || this.generateRoomCode();
        console.log('📡 Initializing CastService for Room:', this.roomCode);

        // 3. Create/Join Room
        await this.createRoomIfNotExists(this.roomCode);

        // 4. Start Listeners (Using Polling for stability as per legacy findings)
        this.startStatePolling();
        this.startCommandPolling();

        return this.roomCode;
    }

    public cleanup() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        if (this.commandPollInterval) clearInterval(this.commandPollInterval);
        this.roomCode = null;
        console.log('🛑 CastService Cleaned Up');
    }

    private generateRoomCode(): string {
        return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    }

    private async createRoomIfNotExists(roomCode: string) {
        if (!realtimeDb) return;
        const dbURL = realtimeDb.app.options.databaseURL;

        // Use REST to check existence (stable)
        try {
            const checkRes = await fetch(`${dbURL}/antigravity_rooms/${roomCode}.json`);
            const data = await checkRes.json();

            if (!data) {
                console.log('📝 Room not found, creating new...');
                const initialData = {
                    hostId: auth.currentUser?.uid || 'monitor',
                    isHost: true,
                    state: {
                        queue: [],
                        currentIndex: 0,
                        controls: { isPlaying: false, isMuted: false },
                        currentVideo: null
                    },
                    createdAt: Date.now()
                };

                await fetch(`${dbURL}/antigravity_rooms/${roomCode}.json`, {
                    method: 'PUT',
                    body: JSON.stringify(initialData)
                });
            }
        } catch (e) {
            console.error('❌ Room access failed:', e);
        }
    }

    private startStatePolling() {
        if (!realtimeDb || !this.roomCode) return;
        const dbURL = realtimeDb.app.options.databaseURL;

        this.pollInterval = setInterval(async () => {
            try {
                // Fetch State
                // Note: We are now the SOURCE of truth for playback if we are the Host (Desktop)
                // BUT, if we want to allow "Remote" to control us, we need to read 'commands', not just state.
                // Actually, the legacy logic had Monitor polling state?
                // Wait. Monitor IS the Host. It should WRITE state, not just read it?
                // The legacy monitor READS state to see if "Remote" updated it?
                // No, typically Monitor WRITES state (progress) and READS commands.
                // Let's stick to reading COMMANDS primarily.

                // However, for Multi-monitor sync, we might read state.
                // For now, let's just broadcast OUR state to Firebase so Remotes can see it.

                this.syncLocalStateToFirebase();

            } catch (e) {
                console.error('State Sync Error:', e);
            }
        }, 1000);
    }

    private async syncLocalStateToFirebase() {
        if (!this.roomCode || !realtimeDb) return;

        const store = usePlayerStore.getState();
        const dbURL = realtimeDb.app.options.databaseURL;
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();

        const minimalState = {
            queue: store.queue,
            currentIndex: store.currentIndex,
            currentVideo: store.currentVideo,
            controls: {
                isPlaying: store.isPlaying,
                isMuted: store.isMuted,
                volume: store.volume
            },
            timestamp: Date.now()
        };

        // Fire & Forget (don't await to avoid blocking UI)
        fetch(`${dbURL}/antigravity_rooms/${this.roomCode}/state.json?auth=${token}`, {
            method: 'PUT',
            body: JSON.stringify(minimalState)
        }).catch(e => console.warn('Sync failed', e));
    }

    private startCommandPolling() {
        if (!realtimeDb || !this.roomCode) return;
        const dbURL = realtimeDb.app.options.databaseURL;

        this.commandPollInterval = setInterval(async () => {
            try {
                const res = await fetch(`${dbURL}/antigravity_rooms/${this.roomCode}/commands.json`);
                const commands = await res.json();

                if (!commands) return;

                Object.entries(commands).forEach(([cmdId, env]: [string, any]) => {
                    if (this.processedCommandIds.has(cmdId) || env.status !== 'pending') return;

                    this.executeCommand(env.command);
                    this.markCommandComplete(cmdId);
                    this.processedCommandIds.add(cmdId);
                });

            } catch (e) {
                console.error('Command Poll Error:', e);
            }
        }, 500);
    }

    private async markCommandComplete(cmdId: string) {
        if (!realtimeDb || !this.roomCode) return;
        const dbURL = realtimeDb.app.options.databaseURL;
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        fetch(`${dbURL}/antigravity_rooms/${this.roomCode}/commands/${cmdId}/status.json?auth=${token}`, {
            method: 'PUT',
            body: JSON.stringify('completed')
        });
    }

    private executeCommand(command: any) {
        console.log('⚡ Executing Remote Command:', command.type);
        const store = usePlayerStore.getState();

        switch (command.type) {
            case 'PLAY': store.play(); break;
            case 'PAUSE': store.pause(); break;
            case 'NEXT': store.playNext(); break;
            case 'PREVIOUS': store.playPrevious(); break;
            case 'ADD_TO_QUEUE':
                if (command.payload?.video) store.addToQueue(command.payload.video);
                break;
            case 'SKIP_TO':
                if (typeof command.payload?.index === 'number') store.setCurrentIndex(command.payload.index);
                break;
            case 'REMOVE_AT':
                // We need UUID implementation in remote to do this properly, 
                // but legacy might send index.
                // Store uses UUID. Check if payload has UUID or Index.
                // Implementation Plan said "Queue Management" done. Use RemoveByUUID.
                // If remote sends index, we might need a helper.
                break;
            case 'SET_VOLUME':
                if (command.payload?.volume) store.setVolume(command.payload.volume);
                break;
            case 'CLEAR_QUEUE':
                store.clearQueue();
                break;
        }
    }
}

export const castService = new CastService();
