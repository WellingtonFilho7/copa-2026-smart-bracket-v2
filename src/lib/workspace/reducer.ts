import type { TournamentDefinition, FeedMatch, Workspace } from "./schema";

function now(): string {
  return new Date().toISOString();
}

export function createInitialWorkspace(tournament: TournamentDefinition): Workspace {
  const timestamp = now();

  return {
    meta: {
      schemaVersion: 1,
      workspaceName: "Meu Bracket 2026",
      createdAt: timestamp,
      updatedAt: timestamp,
      lastSyncAt: null,
    },
    tournament,
    externalFeed: {
      matches: {},
    },
    manualOverrides: {
      matches: {},
    },
    conflicts: {},
  };
}

export function applyManualScore(
  workspace: Workspace,
  matchId: string,
  homeScore: number | null,
  awayScore: number | null,
): Workspace {
  return {
    ...workspace,
    meta: { ...workspace.meta, updatedAt: now() },
    manualOverrides: {
      ...workspace.manualOverrides,
      matches: {
        ...workspace.manualOverrides.matches,
        [matchId]: { homeScore, awayScore },
      },
    },
  };
}

export function mergeFeedMatches(workspace: Workspace, matches: FeedMatch[]): Workspace {
  let nextWorkspace = workspace;

  for (const match of matches) {
    const manualValue = nextWorkspace.manualOverrides.matches[match.id];
    const externalValue = {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    };

    nextWorkspace = {
      ...nextWorkspace,
      externalFeed: {
        matches: {
          ...nextWorkspace.externalFeed.matches,
          [match.id]: match,
        },
      },
    };

    if (
      manualValue &&
      (manualValue.homeScore !== externalValue.homeScore ||
        manualValue.awayScore !== externalValue.awayScore)
    ) {
      nextWorkspace = {
        ...nextWorkspace,
        conflicts: {
          ...nextWorkspace.conflicts,
          [match.id]: {
            matchId: match.id,
            field: "score",
            manualValue,
            externalValue,
            detectedAt: now(),
            status: "open",
          },
        },
      };
    }
  }

  return {
    ...nextWorkspace,
    meta: {
      ...nextWorkspace.meta,
      updatedAt: now(),
      lastSyncAt: now(),
    },
  };
}

export function acceptFeedValue(workspace: Workspace, matchId: string): Workspace {
  const nextManualMatches = { ...workspace.manualOverrides.matches };
  delete nextManualMatches[matchId];

  const nextConflicts = { ...workspace.conflicts };
  delete nextConflicts[matchId];

  return {
    ...workspace,
    meta: { ...workspace.meta, updatedAt: now() },
    manualOverrides: {
      ...workspace.manualOverrides,
      matches: nextManualMatches,
    },
    conflicts: nextConflicts,
  };
}

export function resolveMatchScore(
  workspace: Workspace,
  matchId: string,
): { source: "manual" | "feed" | "base"; homeScore: number | null; awayScore: number | null } {
  const manual = workspace.manualOverrides.matches[matchId];
  if (manual) {
    return {
      source: "manual",
      homeScore: manual.homeScore,
      awayScore: manual.awayScore,
    };
  }

  const feed = workspace.externalFeed.matches[matchId];
  if (feed) {
    return {
      source: "feed",
      homeScore: feed.homeScore,
      awayScore: feed.awayScore,
    };
  }

  const base =
    workspace.tournament.groupMatches.find((match) => match.id === matchId) ??
    workspace.tournament.knockoutMatches.find((match) => match.id === matchId);
  return {
    source: "base",
    homeScore: base?.homeScore ?? null,
    awayScore: base?.awayScore ?? null,
  };
}

export function keepManualValue(workspace: Workspace, matchId: string): Workspace {
  const nextConflicts = { ...workspace.conflicts };
  delete nextConflicts[matchId];

  return {
    ...workspace,
    meta: { ...workspace.meta, updatedAt: now() },
    conflicts: nextConflicts,
  };
}

export function exportWorkspace(workspace: Workspace): string {
  return JSON.stringify(workspace, null, 2);
}

export function importWorkspace(serialized: string): Workspace {
  const parsed = JSON.parse(serialized) as Partial<Workspace>;

  if (parsed.meta?.schemaVersion !== 1) {
    throw new Error("Unsupported schemaVersion for workspace import");
  }

  if (!parsed.tournament || !parsed.externalFeed || !parsed.manualOverrides || !parsed.conflicts) {
    throw new Error("Workspace import is missing required top-level fields");
  }

  return parsed as Workspace;
}
