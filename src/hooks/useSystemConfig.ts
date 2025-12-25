import { useEffect, useState } from "react";
import { SystemConfig, subscribeToSystemConfig } from "../services/systemConfigService";

const DEFAULT_CONFIG: SystemConfig = {
    membership: {
        free: {
            max_daily_songs: 20,
            max_duration_sec: 0,
            allow_cast: false,
            allow_remote: true,
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

export const useSystemConfig = () => {
    const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Try to load from cache first for instant render
        const cached = localStorage.getItem('system_config_cache');
        if (cached) {
            try {
                setConfig(JSON.parse(cached));
                setLoading(false); // Show content immediately
            } catch (e) { }
        }

        // 2. Subscribe to live updates
        const unsubscribe = subscribeToSystemConfig((newConfig) => {
            setConfig(newConfig);
            setLoading(false);
            // Update cache
            localStorage.setItem('system_config_cache', JSON.stringify(newConfig));
        });
        return () => unsubscribe();
    }, []);

    return { config, loading };
};
