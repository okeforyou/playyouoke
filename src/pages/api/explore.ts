import type { NextApiRequest, NextApiResponse } from "next";
import { getSpotifyFeaturedPlaylists, getSpotifyNewReleases, getSpotifyCategoryPlaylists } from "../../utils/spotify";
import type { MusicSection, YouTubePlaylistResult } from "../../utils/youtubeScraper";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log(`[API] Fetching Explore Feed (Spotitube Mode)`);

        // Parallel Fetch for speed
        const [featured, newReleases, topLists, pop, thai] = await Promise.all([
            getSpotifyFeaturedPlaylists('TH', 10),
            getSpotifyNewReleases('TH', 10),
            getSpotifyCategoryPlaylists('toplists', 'TH', 10),
            getSpotifyCategoryPlaylists('pop', 'TH', 10),
            getSpotifyCategoryPlaylists('0JQ5DAqbMKFHKcd02e071a', 'TH', 10) // Thai Pop Category ID
        ]);

        const sections: MusicSection[] = [];

        // Helper to map Spotify Item -> YouTubePlaylistResult
        const mapToResult = (item: any): YouTubePlaylistResult => ({
            playlistId: `sp-${item.id}`, // Prefix with sp- for resolver
            title: item.name,
            thumbnail: item.images?.[0]?.url || "",
            author: "Spotify",
            videoCount: item.tracks?.total?.toString() || "playlist"
        });

        // Helper to map New Release Album -> YouTubePlaylistResult
        const mapAlbumToResult = (item: any): YouTubePlaylistResult => ({
            playlistId: `sp-album-${item.id}`,
            title: item.name,
            thumbnail: item.images?.[0]?.url || "",
            author: item.artists?.[0]?.name || "Artist",
            videoCount: item.total_tracks?.toString() || "album"
        });

        if (featured?.length) {
            sections.push({
                title: "Featured Today",
                items: featured.map(mapToResult)
            });
        }

        if (newReleases?.length) {
            sections.push({
                title: "New Releases",
                items: newReleases.map(mapAlbumToResult)
            });
        }

        if (topLists?.length) {
            sections.push({
                title: "Top Charts",
                items: topLists.map(mapToResult)
            });
        }

        if (pop?.length) {
            sections.push({
                title: "Pop Hits",
                items: pop.map(mapToResult)
            });
        }

        if (thai?.length) {
            sections.push({
                title: "Thai Hits",
                items: thai.map(mapToResult)
            });
        }

        return res.status(200).json({ sections });

    } catch (error: any) {
        console.error(`[API] Explore feed failed: ${error.message}`);
        // Fallback or empty info, but don't error out hard if one part fails (Promise.all fails all, handled here)
        return res.status(500).json({ error: "Failed to fetch Spotify explore feed", details: error.message });
    }
}
