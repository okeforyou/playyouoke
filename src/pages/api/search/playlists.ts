import type { NextApiRequest, NextApiResponse } from "next";
import { searchSpotifyPlaylists } from "../../../utils/spotify";
import { scrapeYouTubePlaylistSearch } from "../../../utils/youtubeScraper";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: "Query 'q' is required" });
    }

    try {
        console.log(`[API] Searching playlists via Spotify API for: ${q}`);
        // 1. Try Spotify First (Spotitube)
        let results: any[] = [];
        try {
            const spotifyResults = await searchSpotifyPlaylists(q as string, 10);
            if (spotifyResults && Array.isArray(spotifyResults) && spotifyResults.length > 0) {
                results = spotifyResults
                    .filter((item: any) => item && item.id)
                    .map((item: any) => ({
                        playlistId: `sp-${item.id}`,
                        title: item.name,
                        thumbnail: item.images?.[0]?.url || "",
                        author: item.owner?.display_name || "Spotify",
                        videoCount: item.tracks?.total?.toString() || "playlist"
                    }));
            }
        } catch (e) {
            console.warn("[API] Spotify Search failed, trying fallback...", e);
        }

        // 2. Fallback to YouTube Scraper if Spotify failed or empty
        if (results.length === 0) {
            console.log(`[API] Fallback: Searching YouTube for: ${q}`);
            const ytResults = await scrapeYouTubePlaylistSearch(q as string);
            results = ytResults;
        }

        if (results.length === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(results);

    } catch (error: any) {
        console.error(`[API] Playlist search failed: ${error.message}`);
        return res.status(500).json({ error: "Failed to search playlists", details: error.message });
    }
}
