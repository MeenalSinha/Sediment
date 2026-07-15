import { env } from "../config/env";

const REDDIT_AUTH_BASE = "https://www.reddit.com/api/v1/authorize";
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const REDDIT_API_BASE = "https://oauth.reddit.com";

export interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface RedditIdentity {
  id: string;
  name: string;
  icon_img: string;
  subreddit?: { icon_img?: string };
}

/**
 * Builds the Reddit "authorize" redirect URL. We request only `identity`
 * (username, avatar, flair) — no write scopes, per the design brief's
 * "never request unnecessary permissions" rule.
 */
export function buildRedditAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.reddit.clientId,
    response_type: "code",
    state,
    redirect_uri: env.reddit.redirectUri,
    duration: "temporary",
    scope: "identity",
  });
  return `${REDDIT_AUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<RedditTokenResponse> {
  const basicAuth = Buffer.from(`${env.reddit.clientId}:${env.reddit.clientSecret}`).toString("base64");

  const res = await fetch(REDDIT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": env.reddit.userAgent,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.reddit.redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error(`Reddit token exchange failed: ${res.status} ${await res.text()}`);
  }

  return res.json() as Promise<RedditTokenResponse>;
}

export async function fetchRedditIdentity(accessToken: string): Promise<RedditIdentity> {
  const res = await fetch(`${REDDIT_API_BASE}/api/v1/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": env.reddit.userAgent,
    },
  });

  if (!res.ok) {
    throw new Error(`Reddit identity fetch failed: ${res.status} ${await res.text()}`);
  }

  return res.json() as Promise<RedditIdentity>;
}
