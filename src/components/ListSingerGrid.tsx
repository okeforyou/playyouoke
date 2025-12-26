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

  useEffect(() => {
    if (tempTopArtistsData) {
      setTopArtistsData(tempTopArtistsData);
      if (genreText !== "เพลงไทย") {
        // refetch logic should probably be reactive instead of imperative
        // But skipping for now to fix build first
      }
    }
  }, [tempTopArtistsData, genreText]);


  const { data: artists, isLoading } = useQuery({
    queryKey: ["getArtists", tagId],
    queryFn: () => getArtists(tagId),
    retry: false,
    refetchInterval: 0,
  });

  const { isLoading: isLoadingGenre, data: playlistData, refetch } = useQuery<SearchPlaylists, Error>({
    queryKey: ["searchPlaylists", genreText],
    queryFn: () => searchPlaylists(genreText),
    enabled: false,
  });

  // Effect to handle side effects from data fetching
  useEffect(() => {
    if (playlistData && playlistData.artistCategories) {
      console.log("Updating Artist Categories with:", playlistData.artistCategories);
      setTopArtistsData(prev => ({
        ...prev,
        artistCategories: playlistData.artistCategories
      }));
    }
  }, [playlistData]);

  useEffect(() => {
    setTopArtistsData(tempTopArtistsData);
  }, []);

  useEffect(() => {
    refetch();
  }, [genreText, refetch]);

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
      <div className="col-span-full bg-transparent pt-2">
        {showTab && (
          <nav className="flex justify-center gap-4 bg-transparent mb-4">
            <button
              type="button"
              className={`px-6 py-2 rounded-full text-base font-medium transition-all ${
                // Use Active Index logic from parent if passed, or just hardcode visual state for now since logic is mixed
                // The original code used daisyUI tabs class. We replace with cleaner buttons.
                "bg-primary text-white shadow-md hover:bg-primary-focus"
                }`}
            >
              ศิลปินยอดฮิต
            </button>
            <button
              type="button"
              className="px-6 py-2 rounded-full text-base font-medium text-gray-600 hover:bg-gray-100 transition-all"
              onClick={() => {
                setActiveIndex(2);
              }}
            >
              มาแรง
            </button>
          </nav>
        )}
      </div>

      {/* Artist Grid */}
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
                <div className="relative w-full aspect-square mb-2 overflow-hidden rounded-full shadow-sm group-hover:shadow-md border border-gray-100/50">
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
        แนวเพลง <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">เลือกได้เลย</span>
      </div>

      {/* Genres: Horizontal Scroll (Easier to use) */}
      <div className="col-span-full flex overflow-x-auto gap-2 px-2 pb-4 scrollbar-hide -mx-2 md:mx-0">
        {GENRES?.map((gen) => (
          <button
            key={gen}
            onClick={() => handleGenre(gen)}
            className={`
                 whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all border
                 ${genreText == gen
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-opacity-80 backdrop-blur-sm"
              }
              `}
          >
            {gen}
          </button>
        ))}
        <Chip
          label={OKE_PLAYLIST}
          onClick={() => handleGenre(OKE_PLAYLIST)}
          className={`cursor-pointer whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium border transition-all ${genreText === OKE_PLAYLIST ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        />
      </div>

      <div ref={playlistRef} className="col-span-full px-2 pt-4 pb-2 text-lg font-bold text-gray-800">
        เพลย์ลิสต์แนะนำ
      </div>

      {/* Category/Mood Tags: Horizontal Scroll */}
      {!isLoadTopArtists && (
        <div className="col-span-full flex overflow-x-auto gap-3 px-2 pb-6 scrollbar-hide">
          {topArtistsData?.artistCategories.map((cat) => (
            <div
              key={cat.tag_id}
              onClick={() => {
                setTagId(cat.tag_id);
                handleSongScroll();
              }}
              className={`
                   relative flex-shrink-0 w-32 h-20 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-105 group
                   ${tagId == cat.tag_id ? "ring-2 ring-offset-1 ring-primary" : ""}
                `}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${cat.imageUrl}')` }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <span className="text-white font-bold text-sm text-center drop-shadow-md">{cat.tag_name}</span>
              </div>
            </div>
          ))}
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
