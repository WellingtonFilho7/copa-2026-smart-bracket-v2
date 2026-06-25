import type { GroupMatch, KnockoutMatchDefinition, TeamDefinition } from "../types";

export type FeedMatch = {
  id: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  updatedAt?: string;
};

export type ManualScoreOverride = {
  homeScore: number | null;
  awayScore: number | null;
};

export type MatchConflict = {
  matchId: string;
  field: "score";
  manualValue: ManualScoreOverride;
  externalValue: ManualScoreOverride;
  detectedAt: string;
  status: "open";
};

export type TournamentDefinition = {
  teams: TeamDefinition[];
  groupMatches: GroupMatch[];
  knockoutMatches: KnockoutMatchDefinition[];
};

export type Workspace = {
  meta: {
    schemaVersion: 1;
    workspaceName: string;
    createdAt: string;
    updatedAt: string;
    lastSyncAt: string | null;
  };
  tournament: TournamentDefinition;
  externalFeed: {
    matches: Record<string, FeedMatch>;
  };
  manualOverrides: {
    matches: Record<string, ManualScoreOverride | undefined>;
  };
  conflicts: Record<string, MatchConflict | undefined>;
};
