import type { OfficialFeedPayload } from "./schema";

export async function fetchOfficialFeed(): Promise<OfficialFeedPayload> {
  const response = await fetch("/api/worldcup-feed", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Feed request failed with status ${response.status}`);
  }

  return (await response.json()) as OfficialFeedPayload;
}
