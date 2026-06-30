// @ts-expect-error Vercel function is implemented in plain JS for runtime compatibility.
import handler from "./worldcup-feed";

describe("Vercel world cup feed function", () => {
  it("returns the normalized feed contract", async () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn().mockReturnThis();

    await handler({ method: "GET", url: "/api/worldcup-feed" }, { status, json });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          source: expect.any(String),
          syncedAt: expect.any(String),
          upstreamUpdatedAt: expect.any(String),
        }),
        groups: expect.arrayContaining([
          expect.objectContaining({
            group: expect.any(String),
            teams: expect.any(Array),
          }),
        ]),
        matches: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            homeTeam: expect.any(String),
            awayTeam: expect.any(String),
            status: expect.any(String),
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
});
