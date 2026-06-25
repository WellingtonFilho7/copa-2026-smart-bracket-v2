import {
  assignThirdPlaceSlots,
  buildKnockoutMatches,
  computeGroupStandings,
} from "./engine";

describe("tournament engine", () => {
  it("sorts a group by points, goal difference, and goals scored", () => {
    const standings = computeGroupStandings(
      [
        { code: "BRA", name: "Brasil", group: "A" },
        { code: "JPN", name: "Japão", group: "A" },
        { code: "MEX", name: "México", group: "A" },
        { code: "SUI", name: "Suíça", group: "A" },
      ],
      [
        {
          id: "GA1",
          group: "A",
          homeTeam: "BRA",
          awayTeam: "JPN",
          homeScore: 1,
          awayScore: 0,
        },
        {
          id: "GA2",
          group: "A",
          homeTeam: "MEX",
          awayTeam: "SUI",
          homeScore: 2,
          awayScore: 0,
        },
        {
          id: "GA3",
          group: "A",
          homeTeam: "BRA",
          awayTeam: "MEX",
          homeScore: 1,
          awayScore: 1,
        },
        {
          id: "GA4",
          group: "A",
          homeTeam: "JPN",
          awayTeam: "SUI",
          homeScore: 3,
          awayScore: 0,
        },
        {
          id: "GA5",
          group: "A",
          homeTeam: "BRA",
          awayTeam: "SUI",
          homeScore: 2,
          awayScore: 0,
        },
        {
          id: "GA6",
          group: "A",
          homeTeam: "JPN",
          awayTeam: "MEX",
          homeScore: 0,
          awayScore: 0,
        },
      ],
    );

    expect(standings.A.map((team) => team.code)).toEqual(["BRA", "MEX", "JPN", "SUI"]);
    expect(standings.A[0]).toMatchObject({ points: 7, goalDifference: 3 });
    expect(standings.A[1]).toMatchObject({ points: 5 });
  });

  it("assigns third-place slots deterministically from ranked third-place teams", () => {
    const slots = assignThirdPlaceSlots([
      { code: "C3", group: "C", rank: 1, points: 4, goalDifference: 1, goalsFor: 3 },
      { code: "E3", group: "E", rank: 2, points: 4, goalDifference: 1, goalsFor: 2 },
      { code: "F3", group: "F", rank: 3, points: 4, goalDifference: 0, goalsFor: 2 },
      { code: "H3", group: "H", rank: 4, points: 3, goalDifference: 0, goalsFor: 2 },
      { code: "I3", group: "I", rank: 5, points: 3, goalDifference: 0, goalsFor: 1 },
      { code: "D3", group: "D", rank: 6, points: 3, goalDifference: -1, goalsFor: 2 },
      { code: "J3", group: "J", rank: 7, points: 2, goalDifference: 0, goalsFor: 1 },
      { code: "L3", group: "L", rank: 8, points: 2, goalDifference: -1, goalsFor: 1 },
    ]);

    expect(slots).toEqual({
      "3 ABCDF": "C3",
      "3 CDFGH": "D3",
      "3 CEFHI": "E3",
      "3 EHIJK": "H3",
      "3 BEFIJ": "F3",
      "3 AEHIJ": "I3",
      "3 EFGIJ": "J3",
      "3 DEIJL": "L3",
    });
  });

  it("builds knockout matches from resolved group slots", () => {
    const tree = buildKnockoutMatches(
      {
        A: [
          { code: "BRA", rank: 1, points: 7, goalDifference: 4, goalsFor: 4 },
          { code: "MEX", rank: 2, points: 5, goalDifference: 2, goalsFor: 3 },
          { code: "JPN", rank: 3, points: 4, goalDifference: 0, goalsFor: 3 },
          { code: "SUI", rank: 4, points: 0, goalDifference: -6, goalsFor: 0 },
        ],
        B: [
          { code: "GER", rank: 1, points: 9, goalDifference: 7, goalsFor: 8 },
          { code: "USA", rank: 2, points: 4, goalDifference: 0, goalsFor: 3 },
          { code: "QAT", rank: 3, points: 3, goalDifference: -2, goalsFor: 1 },
          { code: "CAN", rank: 4, points: 1, goalDifference: -5, goalsFor: 1 },
        ],
      },
      {
        "3 ABCDF": "JPN",
      },
      [
        {
          id: "K1",
          stage: "Round of 32",
          side: "left",
          homeSlot: "1A",
          awaySlot: "3 ABCDF",
          kickoff: "2026-06-29T17:30:00-03:00",
          nextMatchId: "O1",
        },
        {
          id: "K2",
          stage: "Round of 32",
          side: "left",
          homeSlot: "1B",
          awaySlot: "2A",
          kickoff: "2026-06-30T17:30:00-03:00",
          nextMatchId: "O1",
        },
        {
          id: "O1",
          stage: "Round of 16",
          side: "left",
          homeSlot: "K1",
          awaySlot: "K2",
          kickoff: "2026-07-04T18:00:00-03:00",
          nextMatchId: "Q1",
        },
      ],
    );

    expect(tree.K1.homeTeam).toBe("BRA");
    expect(tree.K1.awayTeam).toBe("JPN");
    expect(tree.K2.homeTeam).toBe("GER");
    expect(tree.K2.awayTeam).toBe("MEX");
    expect(tree.O1.homeTeam).toBe("Winner K1");
    expect(tree.O1.awayTeam).toBe("Winner K2");
  });
});
