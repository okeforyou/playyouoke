// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";

const clientId = process.env.SPOTIFY_CLIENT_ID || "be495e578f89486e9d3c8ca7be1b1e27";
const redirectUri = "https://playyouoke.vercel.app/api/spotify/callback";
const scopes = "playlist-read-private playlist-read-collaborative";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const authURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(authURL);
}
