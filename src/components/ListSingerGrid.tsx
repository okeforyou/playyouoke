import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { OKE_PLAYLIST } from "../const/common";
import { useKaraokeState } from "../hooks/karaoke";
import { useListSingerState } from "../hooks/listSinger";
import { GetTopArtists, SearchPlaylists } from "../types";
import {
  getArtists,
  getSkeletonItems,
  getTopArtists,
  searchPlaylists,
} from "../utils/api";
import Chip from "./Chips";
import JooxError from "./JooxError";

const GENRES = [
  "เพลงไทย",
  "ลูกทุ่ง",
  "ลูกกรุง",
  "เพื่อชีวิต",
  "คันทรี",
  "หมอลำ",
  "อีสาน",
  "ปักษ์ใต้",
  "ป็อป",
  "ป็อปร็อก",
  "ฮาร์ดร็อก",
  "ร็อกแอนด์โรล",
  "ริทึมแอนด์บลูส์",
];

export default function ListSingerGrid({ showTab = true }) {
  const { tagId, setTagId, genreText, setGenreText } = useListSingerState();

  const [topArtistsData, setTopArtistsData] = useState<GetTopArtists>({
    artistCategories: [],
    artist: [],
  } as GetTopArtists);

  const playlistRef = useRef(null);
  const songlistRef = useRef(null);

  const handlePlaylistScroll = () => {
    playlistRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleSongScroll = () => {
    songlistRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const { data: tempTopArtistsData, isLoading: isLoadTopArtists } = useQuery({
    queryKey: ["getTopArtists"],
    queryFn: getTopArtists,
    retry: false,
    refetchInterval: 0,
    // v5 removed onError/onSuccess from useQuery, moving to useEffect or action handler
    // But for now let's just use the query. effects should be side-effect based.
    // However, since we need to set state, we can use useEffect on data change.
  });

  // When default Top Artists load (Only if no genre selected)
  useEffect(() => {
    if (tempTopArtistsData && genreText === "เพลงไทย") {
      // Logic to prevent unnecessary re-sets could be added, but simple set is fine for now
      setTopArtistsData(tempTopArtistsData);

      // Auto-select first category if available and no tag selected (optional, user said no auto-select earlier but checking logic)
      // Removed auto-select tagId logic to prevent overriding user choice or causing jumps
    }
  }, [tempTopArtistsData, genreText]);


  const { data: artists, isLoading } = useQuery({
    queryKey: ["getArtists", tagId],
    queryFn: () => getArtists(tagId),
    retry: false,
    refetchInterval: 0,
    enabled: !!tagId, // Only fetch if tagId exists
  });

  const { isLoading: isLoadingGenre, data: playlistData, refetch } = useQuery<SearchPlaylists, Error>({
    queryKey: ["searchPlaylists", genreText],
    queryFn: () => searchPlaylists(genreText),
    // enabled: true, // Always run now
  });

  // When Genre Search Results load
  useEffect(() => {
    if (playlistData && playlistData.artistCategories) {
      console.log("Updating Artist Categories with:", playlistData.artistCategories);

      setTopArtistsData(prev => ({
        ...prev,
        artistCategories: playlistData.artistCategories
      }));

      // Auto Select First Playlist removed to allow user to choose
      // if (playlistData.artistCategories[0]?.tag_id) {
      //   setTagId(playlistData.artistCategories[0].tag_id);
      // } else {
      //   // If empty, maybe clear tagId or set to null?
      //   // setTagId("");
      // }

      // Clear tagId when genre changes effectively (but maybe keep it if it matches? No, unsafe)
      // Actually, if we switch genre, we should sort of reset selection.
      setTagId("");
    }
  }, [playlistData]);

  // Initial Load Placeholder
  useEffect(() => {
    if (!topArtistsData.artistCategories.length && tempTopArtistsData) {
      setTopArtistsData(tempTopArtistsData);
    }
  }, []);

  // Trigger search when genre text changes
  useEffect(() => {
    if (genreText !== "เพลงไทย") {
      refetch();
    } else if (tempTopArtistsData) {
      // Reset to default if back to Thai
      setTopArtistsData(tempTopArtistsData);
    }
  }, [genreText, refetch, tempTopArtistsData]);

  const { setSearchTerm } = useKaraokeState();
  const { artist: topArtists } = !!topArtistsData
    ? topArtistsData
    : {
      artist: [],
    };
  const { artist } = artists || {};
  const { setActiveIndex } = useKaraokeState();
  const [isError, setIsError] = useState(false);

  const handleGenre = (genreText: string) => {
    setGenreText(genreText);
    handlePlaylistScroll();
  };

  return isError ? (
    <JooxError />
  ) : (
    <>
      <div className="col-span-full px-2 pt-2 pb-2 text-lg font-bold text-gray-800 flex items-center gap-2">
        ศิลปินยอดนิยม
      </div>

      {/* Artist Grid - Show Always */}
      <div className={`relative grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-3 col-span-full pb-6 px-2`}>
        {isLoadTopArtists && (
          <>
            {getSkeletonItems(16).map((s, i) => (
              <div
                key={s + i}
                className="card bg-gray-200 animate-pulse w-full aspect-square rounded-2xl"
              ></div>
            ))}
          </>
        )}
        {topArtists?.map((artist, i) => {
          return (
            <Fragment key={artist.name + i}>
              <div
                className="group relative flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1"
                onClick={() => {
                  setSearchTerm(artist.name);
                }}
              >
                <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-2xl shadow-sm group-hover:shadow-md border border-gray-100/50">
                  <Image
                    unoptimized
                    src={artist.imageUrl}
                    priority
                    alt={artist.name}
                    layout="fill"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    onLoad={(ev) =>
                      ev.currentTarget.classList.remove("animate-pulse")
                    }
                    onErrorCapture={(ev) => {
                      ev.currentTarget.src = "/assets/avatar.jpeg";
                    }}
                  />
                  {/* Play Overlay Hints */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 p-2 rounded-full shadow-sm backdrop-blur-sm">
                      <svg className="w-6 h-6 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
                <h2 className="text-xs sm:text-sm font-medium text-gray-800 text-center line-clamp-1 group-hover:text-primary transition-colors">
                  {artist.name}
                </h2>
              </div>
            </Fragment>
          );
        })}
      </div>


      <div className="col-span-full px-2 pt-2 pb-2 text-lg font-bold text-gray-800 flex items-center gap-2">
        แนวเพลง
      </div>

      {/* Genres: Grid Layout (Clean & Luxury) */}
      <div className="col-span-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 px-2 pb-6">
        {GENRES?.map((gen) => (
          <button
            key={gen}
            onClick={() => handleGenre(gen)}
            className={`
                 w-full py-2.5 rounded-full text-sm font-medium transition-all border border-transparent
                 ${genreText == gen
                ? "bg-primary text-white shadow-lg shadow-primary/30 transform scale-105"
                : "bg-gray-500 text-white hover:bg-gray-600 hover:scale-105 shadow-sm"
              }
              `}
          >
            {gen}
          </button>
        ))}
        <Chip
          label={OKE_PLAYLIST}
          onClick={() => handleGenre(OKE_PLAYLIST)}
          className={`cursor-pointer w-full py-2.5 rounded-full text-center text-sm font-medium border transition-all ${genreText === OKE_PLAYLIST ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary hover:bg-white hover:shadow-md"}`}
        />
      </div>

      <div ref={playlistRef} className="col-span-full px-2 pt-4 pb-2 text-lg font-bold text-gray-800">
        {genreText === "เพลงไทย" ? "เพลย์ลิสต์แนะนำ" : `เพลย์ลิสต์ ${genreText}`}
      </div>

      {/* Category/Mood Tags: Unified Grid for ALL Genres */}
      {!isLoadTopArtists && (
        <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 px-4 pb-8">
          {topArtistsData?.artistCategories.length > 0 ? (
            topArtistsData.artistCategories.map((cat) => (
              <div
                key={cat.tag_id}
                onClick={() => {
                  setTagId(cat.tag_id);
                  handleSongScroll();
                }}
                className={`
                   relative flex-shrink-0 w-full aspect-video rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all hover:scale-[1.02] group
                   ${tagId == cat.tag_id ? "ring-4 ring-offset-2 ring-primary" : ""}
                `}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${cat.imageUrl}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:via-black/40 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end">
                  <span className="text-white font-semibold text-xs drop-shadow-sm line-clamp-2 leading-relaxed tracking-wide transform translate-y-0 group-hover:-translate-y-1 transition-transform">
                    {cat.tag_name}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
              <p>ไม่พบเพลย์ลิสต์สำหรับ {genreText}</p>
            </div>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <>
          <div className="col-span-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
            {getSkeletonItems(8).map((s) => (
              <div key={s} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </>
      )}

      <div
        ref={songlistRef}
        className="col-span-full px-2 pt-2 pb-2 text-lg font-bold text-gray-800 flex items-center gap-2"
      >
        {(topArtistsData?.artistCategories || []).find(
          (cat) => cat.tag_id === tagId
        )?.tag_name || "เพลง"}
        <span className="text-xs font-normal text-gray-400">รายการเพลงในหมวดนี้</span>
      </div>

      {/* Song List Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 col-span-full px-2 pb-20">
        {artist?.map((artist, i) => {
          return (
            <Fragment key={artist.name + i}>
              <div
                className="group cursor-pointer bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all overflow-hidden"
                onClick={() => {
                  setSearchTerm(artist.name);
                }}
              >
                <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                  <Image
                    unoptimized
                    src={artist.imageUrl}
                    priority
                    alt={artist.name}
                    layout="fill"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    onLoad={(ev) =>
                      ev.currentTarget.classList.remove("animate-pulse")
                    }
                    onErrorCapture={(ev) => {
                      ev.currentTarget.src = "/assets/avatar.jpeg";
                    }}
                  />
                  {/* Quick Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white p-2 rounded-full shadow-lg">
                      <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h2 className="font-semibold text-sm line-clamp-2 h-[2.5em] text-gray-700 group-hover:text-primary transition-colors leading-snug">
                    {artist.name}
                  </h2>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </>
  );
}
