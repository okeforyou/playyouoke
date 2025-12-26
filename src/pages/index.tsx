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
    </MainLayout >
  );
}
