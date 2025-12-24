// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";

import { getAccessToken } from "../../../../services/spotify";

import type { NextApiRequest, NextApiResponse } from "next";
//https://www.joox.com/th/artists

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    let { tagId } = req.query;
    if (Array.isArray(tagId)) tagId = tagId[0];

    const accessToken = await getAccessToken();

    let playlistId = tagId;
    // Strip sp- prefix if present (added by search/playlists.ts)
    if (playlistId.startsWith('sp-')) {
      playlistId = playlistId.replace('sp-', '');
    }
    // Fetching the specific playlist by ID
    const playlistResponse = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const tracks = playlistResponse.data?.items || [];

    const artists = {
      status: "success",
      artist: tracks
        .filter((a: any) => !!a.track)
        .map((a: any) => ({
          name: a.track.name || "Unknown Track",
          // Safe guard against missing album or images
          imageUrl: a.track.album?.images?.[0]?.url || "",
        })),
    };

    res.status(200).json(artists);
  } catch (error: any) {
    console.error(`❌ Error fetching playlist ${req.query.tagId}:`, error.response?.data || error.message);
    res.status(500).json({ error: error.message, details: error.response?.data });
  }
}
