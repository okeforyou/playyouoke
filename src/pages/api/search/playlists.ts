import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

// List of Invidious instances to try (Server-side)
const INVIDIOUS_INSTANCES = [
    "https://invidious.privacyredirect.com",
    "https://yewtu.be",
    "https://inv.nadeko.net",
    "https://vid.puffyan.us"
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: "Query 'q' is required" });
    }

    // Try instances in order
    for (const instance of INVIDIOUS_INSTANCES) {
        try {
            console.log(`[API] Searching playlists on ${instance} for: ${q}`);
            const response = await axios.get(`${instance}/api/v1/search`, {
                params: {
                    q: q,
                    type: "playlist",
                    sort: "relevance"
                },
                timeout: 5000 // 5s timeout
            });

            // Map to consistent format
            const playlists = response.data
                .filter((item: any) => item.type === "playlist")
                .map((item: any) => ({
                    playlistId: item.playlistId,
                    title: item.title,
                    thumbnail: item.playlistThumbnail || "",
                    author: item.author,
                    videoCount: item.videoCount
                }));

            if (playlists.length > 0) {
                return res.status(200).json(playlists);
            }

        } catch (error: any) {
            console.warn(`[API] Add to skip list: ${instance} failed - ${error.message}`);
            // Continue to next instance
        }
    }

    // If all failed
    return res.status(500).json({ error: "Failed to search playlists on all instances" });
}
