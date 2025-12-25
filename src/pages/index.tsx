import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useKaraokeState } from "../hooks/karaoke";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { DebounceInput } from "react-debounce-input";
import { playerService } from "../features/player/services/playerService";
import { usePlayerStore } from "../features/player/stores/usePlayerStore";
import { HeroSection } from "../components/HeroSection";
import { MediaLane } from "../components/MediaLane";
import { useQuery } from "@tanstack/react-query";
import { getTopArtists } from "../utils/api";
import axios from "axios";

// Dynamic imports for specific heavy grids (used when searching)
const SearchResultGrid = dynamic(() => import("../components/SearchResultGrid"), {
  loading: () => <div className="p-4">Loading Results...</div>,
  ssr: false,
});

export default function HomePage() {
  const {
    searchTerm,
    setSearchTerm,
    isKaraoke,
    setIsKaraoke
  } = useKaraokeState();

  const [mounted, setMounted] = useState(false);
  const [trending, setTrending] = useState([]);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Trending Data (Mock or Real)
  useEffect(() => {
    // For now we will fetch the 'Trending' playlist or topics
    axios.get('/api/explore').then(res => {
      if (res.data?.sections?.[0]?.items) {
        setTrending(res.data.sections[0].items.map((i: any) => ({
          id: i.playlistId,
          title: i.title,
          subtitle: i.videoCount || 'Trending',
          image: i.thumbnail?.replace('mqdefault', 'hqdefault') || `https://i.ytimg.com/vi/mqdefault.jpg`,
          onClick: () => {
            // Quick Play logic for trending items (assuming they are playlists)
            // We might need a cleaner way to handle click -> play playlist vs video
            // For demo, alert or try to play
            console.log('Clicked trending', i);
          }
        })));
      }
    }).catch(err => console.error(err));
  }, []);

  // Fetch Top Artists
  const { data: topArtistsData } = useQuery({
    queryKey: ["getTopArtists"],
    queryFn: getTopArtists,
    enabled: mounted
  });

  const artistItems = topArtistsData?.artist?.map((artist: any) => ({
    id: artist.name,
    title: artist.name,
    image: artist.imageUrl,
    onClick: () => setSearchTerm(artist.name)
  })) || [];


  const renderContent = () => {
    if (searchTerm) {
      return (
        <div className="p-4 max-w-[1600px] mx-auto w-full">
          <SearchResultGrid
            onClick={(video) => {
              const videoToAdd = {
                videoId: video.videoId,
                title: video.title,
                author: video.author,
                thumbnail: undefined,
              };
              usePlayerStore.getState().addToQueue(videoToAdd);
            }}
          />
        </div>
      );
    }

    // "Netflix" Style Home
    return (
      <div className="min-h-screen bg-stone-950 pb-20">
        {/* Hero Section */}
        <HeroSection
          title="Top of The Week"
          description="The most popular karaoke tracks everyone is singing right now. Join the fun!"
          imageUrl="https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop"
          videoId="hero-video-id"
        />

        {/* Content Lanes */}
        <div className="-mt-20 relative z-20 space-y-2">

          <MediaLane
            title="🔥 Trending Now"
            items={trending}
            type="video"
            loading={trending.length === 0}
          />

          <MediaLane
            title="🎤 Top Artists"
            items={artistItems}
            type="artist"
            loading={!topArtistsData}
          />

          <MediaLane
            title="😊 Feel Good"
            items={[
              { id: '1', title: 'Party Hits', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop', onClick: () => { } },
              { id: '2', title: 'Love Songs', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop', onClick: () => { } },
              { id: '3', title: 'Sad Songs', image: 'https://images.unsplash.com/photo-1514525253440-b393452e2729?w=500&auto=format&fit=crop', onClick: () => { } },
              { id: '4', title: 'Rock & Roll', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop', onClick: () => { } },

              { id: '5', title: 'EDM', image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=500&auto=format&fit=crop', onClick: () => { } },
            ]}
            type="square"
          />

        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full bg-stone-950">

        {/* Sticky Search Bar (Glass) */}
        <div className={`sticky top-0 z-40 transition-all duration-300 ${searchTerm ? 'bg-base-100 shadow-md' : 'bg-transparent hover:bg-black/50'} p-4`}>
          <div className="flex gap-4 items-center max-w-4xl mx-auto w-full">
            <div className="relative flex-1 group">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <DebounceInput
                minLength={1}
                debounceTimeout={300}
                className="input input-bordered w-full pl-10 bg-black/40 border-white/10 text-white placeholder-gray-400 focus:bg-black/80 focus:border-primary transition-all rounded-full backdrop-blur-md"
                placeholder="Search for songs, artists..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Karaoke Toggle (Clean) */}
            <div className="form-control">
              <label className="label cursor-pointer gap-2 p-0">
                <div className={`px-3 py-1.5 rounded-full border transition-all text-xs font-bold flex items-center gap-2 ${isKaraoke ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]' : 'bg-transparent border-white/20 text-gray-300 hover:border-white/50'}`}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isKaraoke}
                    onChange={(e) => setIsKaraoke(e.target.checked)}
                  />
                  <span>🎤 Karaoke Mode</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        {mounted && renderContent()}

      </div>
    </MainLayout>
  );
}
