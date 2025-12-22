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

  const handleGenreClick = async (query: string, genreName: string) => {
    setIsLoading(true);
    try {
      // 1. Search for the best playlist matching the query
      const baseUrl = process.env.NEXT_PUBLIC_INVIDIOUS_URL?.replace(/\/$/, "") || "https://invidious.privacyredirect.com";

      console.log(`🔍 Searching playlist for: ${query}`);
      // Note: type=playlist is key here
      const searchRes = await axios.get(`${baseUrl}/api/v1/search`, {
        params: { q: query, type: 'playlist', sort: 'relevance' }
      });

      const playlists = searchRes.data;
      if (!playlists || playlists.length === 0) {
        throw new Error("No playlists found");
      }

      // Pick the first one (most relevant)
      const topPlaylist = playlists[0];
      console.log(`✅ Found playlist: ${topPlaylist.title} (${topPlaylist.playlistId})`);

      // 2. Fetch the videos from that playlist
      const videos = await fetchInvidiousPlaylist(topPlaylist.playlistId);

      // Convert to QueueItem format
      const queueItems = videos.map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        author: v.author,
        thumbnail: v.videoThumbnails?.[0]?.url || ""
      }));

      if (queueItems.length > 0) {
        // Smart Shuffle: If it's a generic genre, maybe shuffle? 
        // For now, Play in order is fine.

        usePlayerStore.getState().clearQueue();
        queueItems.forEach(item => usePlayerStore.getState().addToQueue(item));
        usePlayerStore.getState().playNext();

        // Feedback to user
        // alert(`Playing: ${topPlaylist.title}`); // Optional
      }
    } catch (e) {
      console.error("Failed to load genre playlist", e);
      alert("ไม่สามารถค้นหาเพลย์ลิสต์ได้ในขณะนี้ (Search Error)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="col-span-full pt-4 px-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">เลือกแนวเพลง (อัปเดตใหม่ล่าสุด) 🎵✨</h2>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <span className="text-white font-medium">กำลังค้นหาเพลย์ลิสต์ใหม่ล่าสุด...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {YOUTUBE_GENRES.map((genre) => (
          <div
            key={genre.query}
            onClick={() => handleGenreClick(genre.query, genre.title)}
            className={`
                            relative h-32 rounded-xl cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 group
                            bg-gradient-to-br ${genre.color} to-black
                        `}
          >    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

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
