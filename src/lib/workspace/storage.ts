import type { OfficialFeedPayload } from "../feed/schema";

const STORAGE_KEY = "copa-2026-smart-bracket-v2:official-feed";

export function loadCachedFeed(): OfficialFeedPayload | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OfficialFeedPayload>;
    if (!parsed.meta || !parsed.groups || !parsed.matches || !parsed.bracket) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed as OfficialFeedPayload;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveCachedFeed(feed: OfficialFeedPayload): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(feed));
}
