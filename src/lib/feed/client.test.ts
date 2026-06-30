import { officialFeedFixture } from "../../test/fixtures/official-feed";
import { fetchOfficialFeed } from "./client";

describe("feed client", () => {
  it("returns the normalized official payload from the backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => officialFeedFixture,
      }),
    );

    await expect(fetchOfficialFeed()).resolves.toEqual(officialFeedFixture);
  });

  it("throws on non-ok responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
      }),
    );

    await expect(fetchOfficialFeed()).rejects.toThrow(/502/);
  });
});
