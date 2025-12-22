import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

const INVIDIOUS_INSTANCES = [
    "https://invidious.privacyredirect.com",
    "https://yewtu.be",
    "https://inv.nadeko.net",
    "https://vid.puffyan.us"
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Playlist ID is required" });
    }

    for (const instance of INVIDIOUS_INSTANCES) {
        try {
            console.log(`[API] Fetching playlist ${id} from ${instance}`);
            const response = await axios.get(`${instance}/api/v1/playlists/${id}`, {
                params: {
                    videos: true // Ensure videos are returned
                },
                timeout: 6000
            });

            if (response.data && response.data.videos) {
                return res.status(200).json(response.data);
            }
        } catch (error: any) {
            console.warn(`[API] Failed to fetch playlist from ${instance}: ${error.message}`);
        }
    }

    return res.status(500).json({ error: "Failed to fetch playlist items" });
}
