export type GroupCode =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export type TeamDefinition = {
  code: string;
  name: string;
  group: GroupCode;
};

export type GroupMatch = {
  id: string;
  group: GroupCode;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
};

export type GroupStanding = {
  code: string;
  rank: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

export type KnockoutMatchDefinition = {
  id: string;
  stage: string;
  side: "left" | "right" | "center";
  homeSlot: string;
  awaySlot: string;
  kickoff: string;
  nextMatchId?: string;
  homeScore?: number | null;
  awayScore?: number | null;
};

export type KnockoutMatchView = KnockoutMatchDefinition & {
  homeTeam: string;
  awayTeam: string;
};
