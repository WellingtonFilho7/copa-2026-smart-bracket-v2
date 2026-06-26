// @ts-expect-error Vercel function is implemented in plain JS for runtime compatibility.
import handler from "./worldcup-feed";

describe("Vercel world cup feed function", () => {
  it("returns the normalized feed contract", async () => {
    const status = vi.fn().mockReturnThis();
    const json = vi.fn().mockReturnThis();

    await handler({ method: "GET", url: "/api/worldcup-feed" }, { status, json });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      matches: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          homeScore: expect.any(Number),
          awayScore: expect.any(Number),
          status: expect.any(String),
        }),
      ]),
    });
  });
});
