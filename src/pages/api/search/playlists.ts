import type { NextApiRequest, NextApiResponse } from "next";
import { searchSpotifyPlaylists } from "../../../utils/spotify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: "Query 'q' is required" });
    }

    try {
        console.log(`[API] Searching playlists via Spotify API for: ${q}`);
        const spotifyResults = await searchSpotifyPlaylists(q as string, 10);

        if (spotifyResults.length === 0) {
            return res.status(200).json([]);
        }

        // Map to compatible format (matches YouTubeScraperResult/YouTubePlaylistResult loosely)
        // Frontend expects: playlistId, title, thumbnail, author, videoCount
        const results = spotifyResults.map((item: any) => ({
            playlistId: `sp-${item.id}`, // IMPORTANT: Prefix for resolver
            title: item.name,
            thumbnail: item.images?.[0]?.url || "",
            author: item.owner?.display_name || "Spotify",
            videoCount: item.tracks?.total?.toString() || "playlist"
        }));

        return res.status(200).json(results);

    } catch (error: any) {
        console.error(`[API] Playlist search failed: ${error.message}`);
        return res.status(500).json({ error: "Failed to search playlists", details: error.message });
    }
}
