import { realtimeDb } from "../firebase";
import { ref, get, set, onValue, off } from "firebase/database";

export interface SystemConfig {
    membership: {
        free: {
            max_daily_songs: number;
            max_duration_sec: number; // 0 = unlimited
            allow_cast: boolean;
            allow_remote: boolean;
            show_ads: boolean;
        };
        premium: {
            max_daily_songs: number;
            max_duration_sec: number;
            allow_cast: boolean;
            allow_remote: boolean;
            show_ads: boolean;
        };
    };
}

const CONFIG_PATH = "system/config";

const DEFAULT_CONFIG: SystemConfig = {
    membership: {
        free: {
            max_daily_songs: 20,
            max_duration_sec: 0, // Unlimited duration by default
            allow_cast: false,   // Cast locked
            allow_remote: true,  // Remote allowed
            show_ads: true,
        },
        premium: {
            max_daily_songs: 9999,
            max_duration_sec: 0,
            allow_cast: true,
            allow_remote: true,
            show_ads: false,
        },
    },
};

/**
 * Get current system config once
 */
export const getSystemConfig = async (): Promise<SystemConfig> => {
    if (!realtimeDb) throw new Error("Firebase not initialized");
    const snapshot = await get(ref(realtimeDb, CONFIG_PATH));
    if (snapshot.exists()) {
        return snapshot.val() as SystemConfig;
    }
    // If not exists, initialize with default
    await set(ref(realtimeDb, CONFIG_PATH), DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
};

/**
 * Update system config (Admin only)
 */
export const updateSystemConfig = async (newConfig: SystemConfig) => {
    if (!realtimeDb) throw new Error("Firebase not initialized");
    await set(ref(realtimeDb, CONFIG_PATH), newConfig);
};

/**
 * Subscribe to config changes
 */
export const subscribeToSystemConfig = (callback: (config: SystemConfig) => void) => {
    if (!realtimeDb) return () => { };
    const configRef = ref(realtimeDb, CONFIG_PATH);
    const listener = onValue(configRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        } else {
            callback(DEFAULT_CONFIG);
        }
    }, (error) => {
        console.error("System Config Subscription Error:", error);
        // Fallback to default config on error (e.g. permission denied)
        callback(DEFAULT_CONFIG);
    });
    return () => off(configRef, "value", listener);
};
