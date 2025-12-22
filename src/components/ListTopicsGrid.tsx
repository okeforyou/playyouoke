import { Fragment, useState } from "react";
import axios from "axios";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useKaraokeState } from "../hooks/karaoke";
import { YOUTUBE_GENRES } from "../data/genres";
import { usePlayerStore } from "../features/player/stores/usePlayerStore";
import Alert from "./Alert"; // Assuming Alert is available nearby

// Helper to fetch Invidious Playlist
const fetchInvidiousPlaylist = async (playlistId: string) => {
  // Try multiple instances if possible, but start with user config
  const baseUrl = process.env.NEXT_PUBLIC_INVIDIOUS_URL?.replace(/\/$/, "") || "https://invidious.privacyredirect.com";
  const res = await axios.get(`${baseUrl}/api/v1/playlists/${playlistId}`);
  return res.data.videos;
};

export default function ListTopicsGrid({ showTab = true }) {
  const { setActiveIndex, setSearchTerm } = useKaraokeState();
  const { setPlaylist } = useKaraokeState();
  const addToQueue = usePlayerStore(state => state.addToQueue);
  const play = usePlayerStore(state => state.play);

  const [isLoading, setIsLoading] = useState(false);

  const handleGenreClick = async (playlistId: string, genreName: string) => {
    setIsLoading(true);
    try {
      const videos = await fetchInvidiousPlaylist(playlistId);

      // Convert to QueueItem format
      const queueItems = videos.map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        author: v.author,
        thumbnail: v.videoThumbnails?.[0]?.url || ""
      }));

      if (queueItems.length > 0) {
        // Add all to queue? Or replace queue?
        // Usually for a "Station", we replace queue or add to queue.
        // Let's replace queue for "Play Playlist" experience, or add.
        // But simpler: Add first one and play, add rest to queue.
        // For now, let's use the playerService-like logic:
        // But we are in a component. 
        // We'll just call setPlaylist which usually handles this in the old legacy code, 
        // OR better: use store directly.

        // Queue Replacement Logic (Simulating "Play Playlist")
        usePlayerStore.getState().clearQueue();
        queueItems.forEach(item => usePlayerStore.getState().addToQueue(item));
        usePlayerStore.getState().playNext(); // Start playing first item (index 0)

      }
    } catch (e) {
      console.error("Failed to load genre playlist", e);
      alert("ไม่สามารถโหลดรายการเพลงได้ (YouTube Error)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="col-span-full pt-4 px-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">เลือกแนวเพลงที่คุณชอบ 🎵</h2>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {YOUTUBE_GENRES.map((genre) => (
          <div
            key={genre.id}
            onClick={() => handleGenreClick(genre.id, genre.title)}
            className={`
                            relative h-32 rounded-xl cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 group
                            bg-gradient-to-br ${genre.color} to-black
                        `}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

            <div className="absolute top-3 left-3">
              <h3 className="text-white font-bold text-lg leading-tight">{genre.title}</h3>
              <p className="text-white/80 text-xs mt-1">{genre.description}</p>
            </div>

            {/* Decorative Icon */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl transform rotate-12" />
            <PlayIcon className="absolute bottom-3 right-3 w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
