import { GET } from "./worldcup-feed";

describe("Vercel world cup feed function", () => {
  it("returns the normalized feed contract", async () => {
    const response = await GET(new Request("http://localhost/api/worldcup-feed"));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toMatchObject({
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
