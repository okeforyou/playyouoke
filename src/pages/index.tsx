import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useKaraokeState } from "../hooks/karaoke";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { DebounceInput } from "react-debounce-input";
import { usePlayerStore } from "../features/player/stores/usePlayerStore";

// Dynamic imports for performance
const ListSingerGrid = dynamic(() => import("../components/ListSingerGrid"), {
  loading: () => <div className="p-4">Loading Artists...</div>,
  ssr: false,
});
const ListTopicsGrid = dynamic(() => import("../components/ListTopicsGrid"), {
  loading: () => <div className="p-4">Loading Topics...</div>,
  ssr: false,
});
const SearchResultGrid = dynamic(() => import("../components/SearchResultGrid"), {
  loading: () => <div className="p-4">Loading Results...</div>,
  ssr: false,
});
const ListPlaylistsGrid = dynamic(() => import("../components/ListPlaylistsGrid"), {
  loading: () => <div className="p-4">Loading Playlists...</div>,
  ssr: false,
});


export default function HomePage() {
  const {
    activeIndex,
    setActiveIndex,
    searchTerm,
    setSearchTerm,
    isKaraoke,
    setIsKaraoke
  } = useKaraokeState();

  // Reset to search results if typing
  useEffect(() => {
    if (searchTerm) setActiveIndex(0);
  }, [searchTerm]);

  // Hydration fix
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const renderContent = () => {
    if (!mounted) return null;
    switch (activeIndex) {
      case 0: return <SearchResultGrid onClick={(video) => {
        const videoToAdd = {
          videoId: video.videoId,
          title: video.title,
          author: video.author,
          thumbnail: undefined,
        };
        usePlayerStore.getState().addToQueue(videoToAdd);
      }} />;
      case 1: return <ListSingerGrid showTab={false} />;
      case 2: return <ListTopicsGrid showTab={false} />;
      case 3: return <ListPlaylistsGrid />;
      default: return <ListSingerGrid showTab={false} />;
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-full">
        {/* Search Bar & Controls */}
        <div className="sticky top-0 z-20 bg-base border-b border-border p-4 shadow-sm">
          {mounted ? (
            <div className="flex gap-4 items-center max-w-4xl mx-auto w-full">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <DebounceInput
                  minLength={1}
                  debounceTimeout={300}
                  className="input input-bordered w-full pl-10"
                  placeholder="Search for songs, artists..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Karaoke Toggle */}
              <div className="form-control">
                <label className="label cursor-pointer gap-2">
                  <span className="label-text font-medium hidden sm:inline">Karaoke Mode</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isKaraoke}
                    onChange={(e) => setIsKaraoke(e.target.checked)}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full h-12 bg-gray-100 rounded animate-pulse"></div>
          )}

          {/* Navigation Tabs (Classic) */}
          {mounted && !searchTerm && (
            <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-1">
              {[
                { id: 1, label: 'Artists', icon: '🎤' },
                { id: 2, label: 'Trending', icon: '🔥' },
                { id: 3, label: 'Playlists', icon: '📑' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveIndex(tab.id)}
                  className={`btn btn-sm ${activeIndex === tab.id ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <span className="mr-1">{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="flex-1 p-4 max-w-[1600px] mx-auto w-full">
          {mounted ? renderContent() : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-video bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
