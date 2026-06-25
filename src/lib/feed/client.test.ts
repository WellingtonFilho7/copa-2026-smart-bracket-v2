import { fetchFeedMatches } from "./client";

describe("feed client", () => {
  it("returns normalized matches from the backend payload", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          matches: [{ id: "GC5", homeScore: 2, awayScore: 1, status: "finished" }],
        }),
      }),
    );

    await expect(fetchFeedMatches()).resolves.toEqual([
      { id: "GC5", homeScore: 2, awayScore: 1, status: "finished" },
    ]);
  });

  it("throws on non-ok responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
      }),
    );

    await expect(fetchFeedMatches()).rejects.toThrow(/502/);
  });
});
