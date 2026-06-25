import {
  acceptFeedValue,
  applyManualScore,
  createInitialWorkspace,
  exportWorkspace,
  importWorkspace,
  mergeFeedMatches,
  resolveMatchScore,
} from "./reducer";

const tournament = {
  teams: [
    { code: "BRA", name: "Brasil", group: "A" as const },
    { code: "JPN", name: "Japão", group: "A" as const },
  ],
  groupMatches: [
    {
      id: "GA1",
      group: "A" as const,
      homeTeam: "BRA",
      awayTeam: "JPN",
      homeScore: null,
      awayScore: null,
    },
  ],
  knockoutMatches: [],
};

describe("workspace reducer", () => {
  it("stores a manual score override", () => {
    const workspace = applyManualScore(
      createInitialWorkspace(tournament),
      "GA1",
      2,
      1,
    );

    expect(workspace.manualOverrides.matches.GA1).toEqual({
      homeScore: 2,
      awayScore: 1,
    });
    expect(resolveMatchScore(workspace, "GA1")).toEqual({
      source: "manual",
      homeScore: 2,
      awayScore: 1,
    });
  });

  it("creates a conflict when API data diverges from a manual score", () => {
    const withManual = applyManualScore(
      createInitialWorkspace(tournament),
      "GA1",
      1,
      1,
    );
    const merged = mergeFeedMatches(withManual, [
      { id: "GA1", homeScore: 2, awayScore: 0, status: "finished" },
    ]);

    expect(merged.conflicts.GA1).toMatchObject({
      field: "score",
      manualValue: { homeScore: 1, awayScore: 1 },
      externalValue: { homeScore: 2, awayScore: 0 },
    });
    expect(resolveMatchScore(merged, "GA1")).toEqual({
      source: "manual",
      homeScore: 1,
      awayScore: 1,
    });
  });

  it("accepts the API value and clears the conflict", () => {
    const withConflict = mergeFeedMatches(
      applyManualScore(createInitialWorkspace(tournament), "GA1", 1, 1),
      [{ id: "GA1", homeScore: 2, awayScore: 0, status: "finished" }],
    );

    const resolved = acceptFeedValue(withConflict, "GA1");

    expect(resolved.conflicts.GA1).toBeUndefined();
    expect(resolved.manualOverrides.matches.GA1).toBeUndefined();
    expect(resolveMatchScore(resolved, "GA1")).toEqual({
      source: "feed",
      homeScore: 2,
      awayScore: 0,
    });
  });

  it("exports and imports a workspace with schema validation", () => {
    const original = mergeFeedMatches(
      applyManualScore(createInitialWorkspace(tournament), "GA1", 3, 2),
      [{ id: "GA1", homeScore: 1, awayScore: 0, status: "finished" }],
    );

    const serialized = exportWorkspace(original);
    const restored = importWorkspace(serialized);

    expect(restored.meta.schemaVersion).toBe(1);
    expect(restored.manualOverrides.matches.GA1).toEqual({
      homeScore: 3,
      awayScore: 2,
    });
    expect(() => importWorkspace('{"meta":{"schemaVersion":999}}')).toThrow(
      /schemaVersion/i,
    );
  });
});
