import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

import { officialFeedFixture } from "./fixtures/official-feed";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ...officialFeedFixture,
        meta: {
          ...officialFeedFixture.meta,
          syncedAt: "2026-06-30T12:00:00.000Z",
        },
      }),
    }),
  );
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
