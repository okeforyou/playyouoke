import type { NextApiRequest, NextApiResponse } from "next";
import { scrapeYouTubePlaylistSearch } from "../../../utils/youtubeScraper";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: "Query 'q' is required" });
    }

    try {
        console.log(`[API] Searching playlists via Direct Scraper for: ${q}`);
        const results = await scrapeYouTubePlaylistSearch(q as string);

        if (results.length === 0) {
            // Fallback: If scraping fails, maybe return error or empty?
            // In critical user path, we might want to try ONE Invidious instance as fallback?
            // For now, scraping is more reliable than Invidious public instances.
            return res.status(200).json([]); // Empty array = "No results"
        }

        return res.status(200).json(results);

    } catch (error: any) {
        console.error(`[API] Playlist search failed: ${error.message}`);
        return res.status(500).json({ error: "Failed to search playlists", details: error.message });
    }
}
