import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useKaraokeState } from "../hooks/karaoke";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { DebounceInput } from "react-debounce-input";
import { usePlayerStore } from "../features/player/stores/usePlayerStore";
import { CategoryChips } from "../components/CategoryChips";

// Dynamic imports for performance
const ListSingerGrid = dynamic(() => import("../components/ListSingerGrid"), {
  loading: () => <div className="p-12 text-center text-gray-500">Loading Artists...</div>,
  ssr: false,
});
const ListTopicsGrid = dynamic(() => import("../components/ListTopicsGrid"), {
  loading: () => <div className="p-12 text-center text-gray-500">Loading Topics...</div>,
  ssr: false,
});
const SearchResultGrid = dynamic(() => import("../components/SearchResultGrid"), {
  loading: () => <div className="p-12 text-center text-gray-500">Loading Results...</div>,
  ssr: false,
});
const ListPlaylistsGrid = dynamic(() => import("../components/ListPlaylistsGrid"), {
  loading: () => <div className="p-12 text-center text-gray-500">Loading Playlists...</div>,
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

    // Aesthetic Wrapper for Grids
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
        {children}
      </div>
    );

    switch (activeIndex) {
      case 0: return <Wrapper><SearchResultGrid onClick={(video) => {
        const videoToAdd = {
          videoId: video.videoId,
          title: video.title,
          author: video.author,
          thumbnail: undefined,
        };
        usePlayerStore.getState().addToQueue(videoToAdd);
      }} /></Wrapper>;
      case 1: return <Wrapper><ListSingerGrid showTab={false} /></Wrapper>;
      case 2: return <Wrapper><ListTopicsGrid showTab={false} /></Wrapper>;
      case 3: return <Wrapper><ListPlaylistsGrid /></Wrapper>;
      default: return <Wrapper><ListSingerGrid showTab={false} /></Wrapper>;
    }
  };

  // Mapping string categories to IDs for Chips
  const categories = ['Search', 'Artists', 'Trending', 'Playlists', 'Party', 'Relax', 'Sad', 'Rock'];
  // We map the first 4 to our existing `activeIndex`. 
  // Future adjustment: Map 'Party', 'Relax' etc to specific Genre queries or Playlists.
  const handleChipSelect = (cat: string) => {
    if (cat === 'Search') setActiveIndex(0);
    else if (cat === 'Artists') setActiveIndex(1);
    else if (cat === 'Trending') setActiveIndex(2);
    else if (cat === 'Playlists') setActiveIndex(3);
    else {
      // Check if it's a "Genre" style category
      // For now, let's treat it as a Search
      setSearchTerm(cat + ' karaoke'); // Auto search the genre
      setActiveIndex(0);
    }
  };

  const getActiveCategoryName = () => {
    if (searchTerm && activeIndex === 0) return 'Search'; // Or custom
    if (activeIndex === 1) return 'Artists';
    if (activeIndex === 2) return 'Trending';
    if (activeIndex === 3) return 'Playlists';
    return 'Search';
  }


  return (
    <MainLayout>
      <div className="flex flex-col min-h-full bg-[#030303] text-gray-100 font-sans">

        {/* Top Sticky Bar: Search + Chips (YTM Style) */}
        <div className="sticky top-0 z-40 bg-[#030303]/95 backdrop-blur-md border-b border-white/5 pb-2">

          {/* Search Row */}
          <div className="px-4 pt-4 pb-2 max-w-[1600px] mx-auto w-full flex gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-2xl group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
              <DebounceInput
                minLength={1}
                debounceTimeout={300}
                className="w-full bg-[#1F1F1F] text-white placeholder-gray-500 rounded-full py-2.5 pl-12 pr-4 text-base focus:outline-none focus:ring-1 focus:ring-white/20 transition-all border border-transparent focus:border-white/10"
                placeholder="Search songs, artists, albums..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Karaoke Toggle (Pill) */}
            <button
              onClick={() => setIsKaraoke(!isKaraoke)}
              className={`
                        px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all select-none
                        ${isKaraoke
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }
                    `}
            >
              {isKaraoke ? '🎤 KARAOKE ON' : '🎤 KARAOKE OFF'}
            </button>
          </div>

          {/* Chips Row */}
          <div className="max-w-[1600px] mx-auto w-full">
            <CategoryChips
              categories={categories}
              activeCategory={getActiveCategoryName()}
              onSelect={handleChipSelect}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {mounted ? renderContent() : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-video bg-[#1F1F1F] rounded-md animate-pulse"></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
