import axios from 'axios'
import querystring from 'querystring'

let accessToken: string | null = null;
let refreshToken: string | null = process.env.SPOTIFY_REFRESH_TOKEN!;
let tokenExpiry: number | null = null;

const clientId = process.env.SPOTIFY_CLIENT_ID!;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;

const getAccessToken = async () => {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;

    return accessToken;
  } catch (error: any) {
    console.error("Error refreshing access token:", error.response?.data || error.message);
    throw new Error(`Failed to refresh token: ${JSON.stringify(error.response?.data || error.message)}`);
  }
};

const storeTokensInMemory = (
  access: string,
  refresh: string,
  expiry: number
) => {
  accessToken = access;
  refreshToken = refresh;
  tokenExpiry = expiry;
};

export { getAccessToken, storeTokensInMemory };
