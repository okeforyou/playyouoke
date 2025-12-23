import { useState, useEffect } from "react";
import axios from "axios";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useKaraokeState } from "../hooks/karaoke";
import { usePlayerStore } from "../features/player/stores/usePlayerStore";
import Alert from "./Alert";
import { YOUTUBE_GENRES } from "../data/genres"; // Keep as fallback

interface ExploreSection {
  title: string;
  items: {
    playlistId: string;
    title: string;
    thumbnail: string;
    videoCount: string;
  }[];
}

export default function ListTopicsGrid({ showTab = true }) {
  const { setActiveIndex, setSearchTerm } = useKaraokeState();
  const [isLoading, setIsLoading] = useState(false);
  const [exploreSections, setExploreSections] = useState<ExploreSection[]>([]);
  const [useFallback, setUseFallback] = useState(false);

  // Fetch Dynamic Explore Data
  useEffect(() => {
    const fetchExplore = async () => {
      try {
        // setIsLoading(true); // Don't block UI with loading state initially
        const res = await axios.get('/api/explore');
        if (res.data.sections && res.data.sections.length > 0) {
          setExploreSections(res.data.sections);
        } else {
          setUseFallback(true);
        }
      } catch (error) {
        console.error("Failed to fetch explore feed, using fallback", error);
        setUseFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplore();
  }, []);

  const handlePlaylistClick = async (playlistId: string, title: string) => {
    setIsLoading(true);
    try {
      console.log(`▶️ Fetching playlist: ${title} (${playlistId})`);
      // 2. Fetch the videos using our local proxy
      const playlistRes = await axios.get(`/api/playlist/${playlistId}`);
      const videos = playlistRes.data.videos;

      // Convert to QueueItem format
      const queueItems = videos.map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        author: v.author,
        thumbnail: v.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`
      }));

      if (queueItems.length > 0) {
        usePlayerStore.getState().clearQueue();
        queueItems.forEach(item => usePlayerStore.getState().addToQueue(item));
        usePlayerStore.getState().playNext();
      }
    } catch (e) {
      console.error("Failed to load playlist", e);
      alert("ไม่สามารถเล่นเพลย์ลิสต์นี้ได้ (API Error)");
    } finally {
      setIsLoading(false);
    }
  };

  // Use Fallback (Static Genres) if Dynamic fails
  const genresToRender = useFallback ? YOUTUBE_GENRES.map(g => ({
    playlistId: "", // Static genres use query logic in old code, but let's simplify for now via search? 
    // Actually, mixing query-based genres with ID-based is tricky here.
    // For fallback, we will just use the "Search" logic (re-implementing simplified version inline or relying on ID if I reverted to ID).
    // Let's assume fallback is NOT NEEDED if scraper works. 
    // But if needed, we'll map YOUTUBE_GENRES to the ID-based structure if they have IDs, or skip.
    // My last edit to genres.ts used QUERY.
    // So fallback Logic is: 
    // "Fallback Mode requires Query Search". 
    // I will implement a hybrid handler.
    ...g
  })) : [];

  const handleHybridClick = (item: any) => {
    if (item.query) {
      // It's a "Query Genre" (Fallback)
      // Call the search logic (copy-pasted or extracted)
      handleQuerySearch(item.query);
    } else {
      // It's a "Direct Playlist" (Dynamic)
      handlePlaylistClick(item.playlistId, item.title);
    }
  };

  const handleQuerySearch = async (query: string) => {
    setIsLoading(true);
    try {
      const searchRes = await axios.get(`/api/search/playlists`, { params: { q: query } });
      if (searchRes.data?.[0]) {
        handlePlaylistClick(searchRes.data[0].playlistId, searchRes.data[0].title);
      } else {
        throw new Error("No results");
      }
    } catch (e) {
      alert("ค้นหาไม่เจอครับ");
      setIsLoading(false);
    }
  };

  return (
    <div className="col-span-full pt-4 px-2 pb-20">

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <span className="text-white font-medium">กำลังโหลดรายการเพลง...</span>
          </div>
        </div>
      )}

      {/* Dynamic Sections */}
      {!useFallback && exploreSections.map((section, idx) => (
        <div key={idx} className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">{section.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {section.items.map((item) => (
              <div
                key={item.playlistId}
                onClick={() => handlePlaylistClick(item.playlistId, item.title)}
                className="relative aspect-square rounded-xl cursor-pointer overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 group bg-gray-900"
              >
                <img
                  src={item.thumbnail?.replace('mqdefault', 'hqdefault') || `https://i.ytimg.com/vi/mqdefault.jpg`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-bold text-sm line-clamp-2">{item.title}</h3>
                  <p className="text-white/70 text-xs mt-1">{item.videoCount || "Playlist"}</p>
                </div>
                <PlayIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-all drop-shadow-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Fallback View (Static Genres) */}
      {useFallback && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">แนวเพลงยอดนิยม 🎵</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {YOUTUBE_GENRES.map((genre: any) => (
              <div
                key={genre.query}
                onClick={() => handleQuerySearch(genre.query)}
                className={`relative h-32 rounded-xl cursor-pointer overflow-hidden shadow-lg bg-gradient-to-br ${genre.color || 'from-gray-700'} to-black`}
              >
                <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors" />
                <div className="absolute top-3 left-3">
                  <h3 className="text-white font-bold text-lg">{genre.title}</h3>
                  <p className="text-white/80 text-xs">{genre.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
