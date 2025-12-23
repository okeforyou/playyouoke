import type { NextApiRequest, NextApiResponse } from "next";
import { scrapeYouTubePlaylistVideos, scrapeYouTubeSearch } from "../../../utils/youtubeScraper";
import { getSpotifyPlaylistTracks, getSpotifyAlbumTracks } from "../../../utils/spotify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "Playlist ID is required" });
  }

  try {
    // =================================================================================
    // STRATEGY 1: SPOTIFY RESOLVER (SPOTITUBE)
    // =================================================================================
    if (id.startsWith('sp-')) {
      console.log(`[API] Resolving Spotify Playlist: ${id}`);
      let spotifyTracks: any[] = [];
      const isAlbum = id.startsWith('sp-album-');
      const realId = id.replace(isAlbum ? 'sp-album-' : 'sp-', '');

      try {
        if (isAlbum) {
          spotifyTracks = await getSpotifyAlbumTracks(realId);
        } else {
          spotifyTracks = await getSpotifyPlaylistTracks(realId);
        }
      } catch (e: any) {
        console.error("Spotify Fetch Failed", e.message);
        return res.status(404).json({ error: "Spotify playlist not found" });
      }

      // Limit to Top 20 tracks to prevent timeout and rate-limiting
      const tracksToResolve = spotifyTracks.slice(0, 20);
      console.log(`[Spotitube] Resolving ${tracksToResolve.length} tracks...`);

      // Resolve in parallel (Concurrency: 5)
      // We use a simple chunking approach or just Promise.all if count is low
      const resolvedVideos = [];
      for (const track of tracksToResolve) {
        // Search Query: Artist - Title Audio
        const query = `${track.artist} - ${track.title} Audio`;
        try {
          // Return just the first result
          const searchResults = await scrapeYouTubeSearch(query, 5000); // 5s timeout per search
          if (searchResults.length > 0) {
            const bestMatch = searchResults[0];
            resolvedVideos.push({
              videoId: bestMatch.videoId,
              title: track.title, // Use Clean Spotify Title
              author: track.artist, // Use Clean Spotify Artist
              // Use Spotify Thumbnail if available, fallback to YouTube
              videoThumbnails: track.thumbnail ? [{ url: track.thumbnail, quality: 'high', width: 640, height: 640 }] : bestMatch.videoThumbnails
            });
          }
        } catch (e) {
          console.warn(`[Spotitube] Failed to resolve: ${query}`);
          // Continue despite error
        }

        // Small delay to be nice to YouTube
        await new Promise(r => setTimeout(r, 100));
      }

      console.log(`[Spotitube] Resolved ${resolvedVideos.length}/${tracksToResolve.length} videos`);
      return res.status(200).json({ videos: resolvedVideos });
    }

    // =================================================================================
    // STRATEGY 2: YOUTUBE DIRECT SCRAPER (FALLBACK/LEGACY)
    // =================================================================================
    console.log(`[API] Fetching YouTube playlist: ${id}`);
    const videos = await scrapeYouTubePlaylistVideos(id);

    if (videos.length === 0) {
      return res.status(404).json({ error: "No videos found in playlist" });
    }

    return res.status(200).json({ videos });

  } catch (error: any) {
    console.error(`[API] Playlist fetch failed: ${error.message}`);
    return res.status(500).json({ error: "Failed to fetch playlist items", details: error.message });
  }
}
