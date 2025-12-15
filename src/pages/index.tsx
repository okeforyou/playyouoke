import dynamic from "next/dynamic";
import { useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { useKaraokeState } from "../hooks/karaoke";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { DebounceInput } from "react-debounce-input";
import { playerService } from "../features/player/services/playerService";
import { usePlayerStore } from "../features/player/stores/usePlayerStore";

// Dynamic imports for performance
const ListSingerGrid = dynamic(() => import("../components/ListSingerGrid"), {
  loading: () => <div className="p-4">Loading Artists...</div>,
  ssr: false, // These likely rely on browser APIs / LocalStorage
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

  const renderContent = () => {
    switch (activeIndex) {
      case 0: return <SearchResultGrid onClick={(video) => {
        playerService.loadMedia(video.videoId);
        playerService.play();
        usePlayerStore.setState(state => ({
          ...state,
          currentSource: video.videoId,
          // simplistic queue add for now, normally we append object
          queue: [...state.queue, { title: video.title, author: video.author, videoId: video.videoId }]
        }));
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

          {/* Navigation Tabs (Mobile/Desktop) */}
          {!searchTerm && (
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
          {renderContent()}
        </div>
      </div>
    </MainLayout>
  );
}
