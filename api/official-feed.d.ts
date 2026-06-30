import type { OfficialFeedPayload } from "../src/lib/feed/schema";

export function fetchLiveOfficialFeed(options?: {
  fetchImpl?: typeof fetch;
  now?: Date;
}): Promise<OfficialFeedPayload>;

export function getSnapshotFallbackFeed(options?: {
  now?: Date;
}): OfficialFeedPayload;

export function getOfficialFeedOrFallback(options?: {
  fetchImpl?: typeof fetch;
  now?: Date;
}): Promise<OfficialFeedPayload>;
