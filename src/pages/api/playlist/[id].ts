```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { scrapeYouTubePlaylistVideos } from "../../../utils/youtubeScraper";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Playlist ID is required" });
  }

  try {
     console.log(`[API] Fetching playlist videos via Direct Scraper for: ${ id } `);
     // Scraper returns simplified array of Video objects
     const videos = await scrapeYouTubePlaylistVideos(id as string);
     
     if (videos.length === 0) {
        return res.status(404).json({ error: "No videos found in playlist" });
     }

     // Response format should match what client expects: { videos: [...] }
     return res.status(200).json({ videos });

  } catch (error: any) {
       console.error(`[API] Playlist fetch failed: ${ error.message } `);
       return res.status(500).json({ error: "Failed to fetch playlist items", details: error.message });
  }
}
```
