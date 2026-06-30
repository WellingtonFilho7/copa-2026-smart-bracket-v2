export type OfficialFeedMeta = {
  source: string;
  tournament: string;
  sourceUrl: string;
  syncedAt?: string;
  upstreamUpdatedAt: string;
};

export type OfficialGroupTeamStatus = "qualified" | "third-place" | "eliminated";

export type OfficialGroupTeam = {
  code: string;
  name: string;
  rank: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  status: OfficialGroupTeamStatus;
};

export type OfficialGroup = {
  group: string;
  teams: OfficialGroupTeam[];
};

export type OfficialMatchStatus = "scheduled" | "live" | "finished";

export type OfficialMatchRoundKey = "round32" | "round16" | "quarters" | "semis" | "finals";

export type OfficialMatch = {
  id: string;
  stage: string;
  roundKey: OfficialMatchRoundKey;
  side: "left" | "right" | "center";
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: OfficialMatchStatus;
  kickoff: string | null;
  kickoffLabel: string;
  nextMatchId: string | null;
  winnerTeam: string | null;
};

export type OfficialBracket = Record<OfficialMatchRoundKey, string[]>;

export type OfficialFeedPayload = {
  meta: OfficialFeedMeta;
  groups: OfficialGroup[];
  matches: OfficialMatch[];
  bracket: OfficialBracket;
};
