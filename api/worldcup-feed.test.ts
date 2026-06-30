// @ts-expect-error Vercel function is implemented in plain JS for runtime compatibility.
import handler from "./worldcup-feed";

describe("Vercel world cup feed function", () => {
  it("returns the normalized official contract from the FIFA API", async () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn().mockReturnThis();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("Tue, 30 Jun 2026 15:04:40 GMT"),
        },
        json: async () => ({
          Results: [
            {
              IdStage: "289273",
              IdGroup: "289275",
              GroupName: [{ Locale: "pt-BR", Description: "Grupo A" }],
              Home: {
                Abbreviation: "MEX",
                TeamName: [{ Locale: "pt-BR", Description: "México" }],
                Score: 2,
              },
              Away: {
                Abbreviation: "RSA",
                TeamName: [{ Locale: "pt-BR", Description: "África do Sul" }],
                Score: 0,
              },
            },
            {
              MatchNumber: 74,
              IdStage: "289287",
              StageName: [{ Locale: "pt-BR", Description: "32 avos" }],
              Date: "2026-06-29T20:30:00Z",
              MatchStatus: 0,
              PlaceHolderA: "1E",
              PlaceHolderB: "3ABCDF",
              Home: {
                Abbreviation: "GER",
                Score: 1,
              },
              Away: {
                Abbreviation: "PAR",
                Score: 1,
              },
            },
          ],
        }),
      }),
    );

    await handler({ method: "GET", url: "/api/worldcup-feed" }, { status, json });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          source: "official-fifa-api",
          syncedAt: expect.any(String),
          upstreamUpdatedAt: expect.any(String),
        }),
        groups: expect.arrayContaining([
          expect.objectContaining({
            group: "A",
            teams: expect.any(Array),
          }),
        ]),
        matches: expect.arrayContaining([
          expect.objectContaining({
            id: "K1",
            homeTeam: "GER",
            awayTeam: "PAR",
            status: "finished",
          }),
        ]),
        bracket: expect.objectContaining({
          round32: expect.any(Array),
          round16: expect.any(Array),
          quarters: expect.any(Array),
          semis: expect.any(Array),
          finals: expect.any(Array),
        }),
      }),
    );
  });

  it("falls back to the bundled official snapshot when the upstream fails", async () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn().mockReturnThis();

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("upstream down")));

    await handler({ method: "GET", url: "/api/worldcup-feed" }, { status, json });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          source: "official-snapshot-fallback",
        }),
      }),
    );
  });
});
