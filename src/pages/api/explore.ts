import type { NextApiRequest, NextApiResponse } from "next";
import { scrapeMusicExplore } from "../../utils/youtubeScraper";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log(`[API] Fetching Dynamic Music Explore Feed`);
        const sections = await scrapeMusicExplore();

        if (sections.length === 0) {
            return res.status(404).json({ error: "No music sections found" });
        }

        // Filter for relevant sections if needed (e.g., exclude "Shorts")
        const validSections = sections.filter(s =>
            !s.title.includes("Shorts") &&
            s.items.length > 0
        );

        return res.status(200).json({ sections: validSections });

    } catch (error: any) {
        console.error(`[API] Explore feed failed: ${error.message}`);
        return res.status(500).json({ error: "Failed to fetch explore feed", details: error.message });
    }
}
