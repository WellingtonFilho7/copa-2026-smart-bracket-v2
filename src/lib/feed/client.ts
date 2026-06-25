import type { FeedMatch } from "../workspace/schema";

export async function fetchFeedMatches(): Promise<FeedMatch[]> {
  const response = await fetch("/api/worldcup-feed", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Feed request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { matches?: FeedMatch[] };
  return payload.matches ?? [];
}
