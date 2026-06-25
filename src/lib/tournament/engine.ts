import type {
  GroupMatch,
  GroupStanding,
  KnockoutMatchDefinition,
  KnockoutMatchView,
  TeamDefinition,
} from "../types";

type StandingsByGroup = Record<string, GroupStanding[]>;

export const THIRD_PLACE_SLOT_RULES: Record<string, string[]> = {
  "3 ABCDF": ["A", "B", "C", "D", "F"],
  "3 CDFGH": ["C", "D", "F", "G", "H"],
  "3 CEFHI": ["C", "E", "F", "H", "I"],
  "3 EHIJK": ["E", "H", "I", "J", "K"],
  "3 BEFIJ": ["B", "E", "F", "I", "J"],
  "3 AEHIJ": ["A", "E", "H", "I", "J"],
  "3 EFGIJ": ["E", "F", "G", "I", "J"],
  "3 DEIJL": ["D", "E", "I", "J", "L"],
};

export function computeGroupStandings(
  teams: TeamDefinition[],
  matches: GroupMatch[],
): StandingsByGroup {
  const table = new Map<string, GroupStanding>();

  for (const team of teams) {
    table.set(team.code, {
      code: team.code,
      rank: 0,
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    });
  }

  for (const match of matches) {
    if (match.homeScore === null || match.awayScore === null) {
      continue;
    }

    const home = table.get(match.homeTeam);
    const away = table.get(match.awayTeam);

    if (!home || !away) {
      continue;
    }

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (match.homeScore < match.awayScore) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }

    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  }

  const grouped = teams.reduce<StandingsByGroup>((acc, team) => {
    acc[team.group] ??= [];
    acc[team.group].push(table.get(team.code)!);
    return acc;
  }, {});

  for (const [group, standings] of Object.entries(grouped)) {
    grouped[group] = sortStandings(standings).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  return grouped;
}

export function assignThirdPlaceSlots(
  rankedThirds: Array<
    Pick<GroupStanding, "code" | "rank" | "points" | "goalDifference" | "goalsFor"> & {
      group: string;
    }
  >,
): Record<string, string> {
  const result: Record<string, string> = {};
  const slots = Object.keys(THIRD_PLACE_SLOT_RULES);

  function backtrack(slotIndex: number, remaining: typeof rankedThirds): boolean {
    if (slotIndex >= slots.length) {
      return true;
    }

    const slot = slots[slotIndex];
    const candidates = remaining.filter((entry) =>
      THIRD_PLACE_SLOT_RULES[slot].includes(entry.group),
    );

    for (const candidate of candidates) {
      result[slot] = candidate.code;
      if (
        backtrack(
          slotIndex + 1,
          remaining.filter((entry) => entry.code !== candidate.code),
        )
      ) {
        return true;
      }
      delete result[slot];
    }

    return false;
  }

  backtrack(0, rankedThirds);
  return result;
}

export function rankThirdPlaceTeams(
  standingsByGroup: StandingsByGroup,
): Array<GroupStanding & { group: string }> {
  return Object.entries(standingsByGroup)
    .map(([group, standings]) => ({ ...standings[2], group }))
    .sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }
      if (right.goalDifference !== left.goalDifference) {
        return right.goalDifference - left.goalDifference;
      }
      if (right.goalsFor !== left.goalsFor) {
        return right.goalsFor - left.goalsFor;
      }
      return left.code.localeCompare(right.code, "pt-BR");
    });
}

export function buildKnockoutMatches(
  standingsByGroup: Record<
    string,
    Array<Pick<GroupStanding, "code" | "rank" | "points" | "goalDifference" | "goalsFor">>
  >,
  thirdPlaceSlots: Record<string, string>,
  matches: KnockoutMatchDefinition[],
): Record<string, KnockoutMatchView> {
  const tree: Record<string, KnockoutMatchView> = {};

  for (const match of matches) {
    tree[match.id] = {
      ...match,
      homeTeam: resolveSlot(match.homeSlot, standingsByGroup, thirdPlaceSlots),
      awayTeam: resolveSlot(match.awaySlot, standingsByGroup, thirdPlaceSlots),
    };
  }

  return tree;
}

function resolveSlot(
  slot: string,
  standingsByGroup: Record<string, GroupStanding[] | Array<{ code: string; rank: number }>>,
  thirdPlaceSlots: Record<string, string>,
): string {
  if (slot.startsWith("3 ")) {
    return thirdPlaceSlots[slot] ?? slot;
  }

  if (/^[12][A-L]$/.test(slot)) {
    const position = Number(slot[0]);
    const group = slot[1];
    return standingsByGroup[group]?.[position - 1]?.code ?? slot;
  }

  if (/^[KOQSF]\d+$/.test(slot) || /^K\d+$/.test(slot)) {
    return `Winner ${slot}`;
  }

  return slot;
}

function sortStandings(standings: GroupStanding[]): GroupStanding[] {
  return [...standings].sort((left, right) => {
    if (right.points !== left.points) {
      return right.points - left.points;
    }

    if (right.goalDifference !== left.goalDifference) {
      return right.goalDifference - left.goalDifference;
    }

    if (right.goalsFor !== left.goalsFor) {
      return right.goalsFor - left.goalsFor;
    }

    return left.code.localeCompare(right.code, "pt-BR");
  });
}
