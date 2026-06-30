import snapshot from "../data/official-feed.snapshot.json" with { type: "json" };

const TOURNAMENT_NAME = "FIFA World Cup 2026";
const TOURNAMENT_PAGE_URL = "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026";
const OFFICIAL_MATCHES_URL =
  "https://api.fifa.com/api/v3/calendar/matches?idSeason=285023&language=pt&count=500";
const BRASILIA_TIMEZONE = "America/Sao_Paulo";
const GROUP_STAGE_ID = "289273";

const knockoutPlan = {
  round32: [
    { id: "K1", matchNumber: 74, side: "left", nextMatchId: "O1" },
    { id: "K2", matchNumber: 77, side: "left", nextMatchId: "O1" },
    { id: "K3", matchNumber: 73, side: "left", nextMatchId: "O2" },
    { id: "K4", matchNumber: 75, side: "left", nextMatchId: "O2" },
    { id: "K5", matchNumber: 83, side: "left", nextMatchId: "O3" },
    { id: "K6", matchNumber: 84, side: "left", nextMatchId: "O3" },
    { id: "K7", matchNumber: 81, side: "left", nextMatchId: "O4" },
    { id: "K8", matchNumber: 82, side: "left", nextMatchId: "O4" },
    { id: "K9", matchNumber: 76, side: "right", nextMatchId: "O5" },
    { id: "K10", matchNumber: 78, side: "right", nextMatchId: "O5" },
    { id: "K11", matchNumber: 79, side: "right", nextMatchId: "O6" },
    { id: "K12", matchNumber: 80, side: "right", nextMatchId: "O6" },
    { id: "K13", matchNumber: 86, side: "right", nextMatchId: "O7" },
    { id: "K14", matchNumber: 88, side: "right", nextMatchId: "O7" },
    { id: "K15", matchNumber: 85, side: "right", nextMatchId: "O8" },
    { id: "K16", matchNumber: 87, side: "right", nextMatchId: "O8" },
  ],
  round16: [
    { id: "O1", matchNumber: 89, side: "left", nextMatchId: "Q1" },
    { id: "O2", matchNumber: 90, side: "left", nextMatchId: "Q1" },
    { id: "O3", matchNumber: 93, side: "left", nextMatchId: "Q2" },
    { id: "O4", matchNumber: 94, side: "left", nextMatchId: "Q2" },
    { id: "O5", matchNumber: 91, side: "right", nextMatchId: "Q3" },
    { id: "O6", matchNumber: 92, side: "right", nextMatchId: "Q3" },
    { id: "O7", matchNumber: 95, side: "right", nextMatchId: "Q4" },
    { id: "O8", matchNumber: 96, side: "right", nextMatchId: "Q4" },
  ],
  quarters: [
    { id: "Q1", matchNumber: 97, side: "left", nextMatchId: "S1" },
    { id: "Q2", matchNumber: 98, side: "left", nextMatchId: "S1" },
    { id: "Q3", matchNumber: 99, side: "right", nextMatchId: "S2" },
    { id: "Q4", matchNumber: 100, side: "right", nextMatchId: "S2" },
  ],
  semis: [
    { id: "S1", matchNumber: 101, side: "left", nextMatchId: "F" },
    { id: "S2", matchNumber: 102, side: "right", nextMatchId: "F" },
  ],
  finals: [
    { id: "F", matchNumber: 104, side: "center", nextMatchId: null },
    { id: "T", matchNumber: 103, side: "center", nextMatchId: null },
  ],
};

const stageCopy = {
  round32: "32 avos",
  round16: "oitavas",
  quarters: "quartas",
  semis: "semifinal",
  F: "final",
  T: "3º lugar",
};

export async function fetchLiveOfficialFeed({ fetchImpl = fetch, now = new Date() } = {}) {
  const response = await fetchImpl(OFFICIAL_MATCHES_URL, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Official FIFA API request failed with ${response.status}`);
  }

  const payload = await response.json();
  const results = Array.isArray(payload?.Results) ? payload.Results : null;

  if (!results) {
    throw new Error("Official FIFA API response is missing Results");
  }

  return normalizeOfficialFeed(results, {
    now,
    source: "official-fifa-api",
    sourceUrl: OFFICIAL_MATCHES_URL,
    upstreamUpdatedAt: toIsoTimestamp(response.headers?.get?.("date"), now.toISOString()),
  });
}

export function getSnapshotFallbackFeed({ now = new Date() } = {}) {
  return {
    ...snapshot,
    meta: {
      ...snapshot.meta,
      source: "official-snapshot-fallback",
      syncedAt: now.toISOString(),
    },
  };
}

export async function getOfficialFeedOrFallback(options = {}) {
  try {
    return await fetchLiveOfficialFeed(options);
  } catch {
    return getSnapshotFallbackFeed(options);
  }
}

function normalizeOfficialFeed(results, { now, source, sourceUrl, upstreamUpdatedAt }) {
  const groupMatches = results.filter((match) => match?.IdStage === GROUP_STAGE_ID);
  const knockoutMatches = buildKnockoutMatches(results);

  return {
    meta: {
      source,
      tournament: TOURNAMENT_NAME,
      sourceUrl,
      syncedAt: now.toISOString(),
      upstreamUpdatedAt,
    },
    groups: buildGroups(groupMatches),
    matches: knockoutMatches.matches,
    bracket: knockoutMatches.bracket,
  };
}

function buildGroups(matches) {
  const byGroup = new Map();

  for (const match of matches) {
    const groupLabel = getDescription(match?.GroupName) ?? "Grupo ?";
    const groupCode = groupLabel.replace(/^Grupo\s+/i, "").trim();
    const groupKey = match?.IdGroup ?? groupCode;
    const entry = byGroup.get(groupKey) ?? {
      group: groupCode,
      matches: [],
      teams: new Map(),
    };

    entry.matches.push(match);
    upsertTeam(entry.teams, match?.Home);
    upsertTeam(entry.teams, match?.Away);

    const homeScore = match?.Home?.Score;
    const awayScore = match?.Away?.Score;
    if (Number.isFinite(homeScore) && Number.isFinite(awayScore)) {
      applyMatchResult(entry.teams, match);
    }

    byGroup.set(groupKey, entry);
  }

  return [...byGroup.values()]
    .sort((left, right) => left.group.localeCompare(right.group, "pt-BR"))
    .map((groupEntry) => {
      const sortedTeams = sortGroupTeams([...groupEntry.teams.values()], groupEntry.matches).map(
        (team, index) => ({
          code: team.code,
          name: team.name,
          rank: index + 1,
          points: team.points,
          played: team.played,
          wins: team.wins,
          draws: team.draws,
          losses: team.losses,
          goalsFor: team.goalsFor,
          goalsAgainst: team.goalsAgainst,
          goalDifference: team.goalsFor - team.goalsAgainst,
          status: index < 2 ? "qualified" : index === 2 ? "third-place" : "eliminated",
        }),
      );

      return {
        group: groupEntry.group,
        teams: sortedTeams,
      };
    });
}

function upsertTeam(teamMap, team) {
  if (!team?.Abbreviation) {
    return;
  }

  if (!teamMap.has(team.Abbreviation)) {
    teamMap.set(team.Abbreviation, {
      code: team.Abbreviation,
      name: getDescription(team.TeamName) ?? team.ShortClubName ?? team.Abbreviation,
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    });
  }
}

function applyMatchResult(teamMap, match) {
  const home = teamMap.get(match?.Home?.Abbreviation);
  const away = teamMap.get(match?.Away?.Abbreviation);
  if (!home || !away) {
    return;
  }

  const homeScore = match.Home.Score;
  const awayScore = match.Away.Score;

  home.played += 1;
  away.played += 1;
  home.goalsFor += homeScore;
  home.goalsAgainst += awayScore;
  away.goalsFor += awayScore;
  away.goalsAgainst += homeScore;

  if (homeScore > awayScore) {
    home.wins += 1;
    home.points += 3;
    away.losses += 1;
    return;
  }

  if (homeScore < awayScore) {
    away.wins += 1;
    away.points += 3;
    home.losses += 1;
    return;
  }

  home.draws += 1;
  away.draws += 1;
  home.points += 1;
  away.points += 1;
}

function sortGroupTeams(teams, matches) {
  const sorted = [...teams].sort(compareOverallTeams);
  const resolved = [];

  for (let index = 0; index < sorted.length; ) {
    const tieGroup = [sorted[index]];
    let cursor = index + 1;

    while (
      cursor < sorted.length &&
      sorted[cursor].points === sorted[index].points &&
      goalDifference(sorted[cursor]) === goalDifference(sorted[index]) &&
      sorted[cursor].goalsFor === sorted[index].goalsFor
    ) {
      tieGroup.push(sorted[cursor]);
      cursor += 1;
    }

    if (tieGroup.length === 1) {
      resolved.push(tieGroup[0]);
    } else {
      resolved.push(...sortTiedTeams(tieGroup, matches));
    }

    index = cursor;
  }

  return resolved;
}

function sortTiedTeams(tiedTeams, matches) {
  const tiedCodes = new Set(tiedTeams.map((team) => team.code));
  const miniTable = new Map(
    tiedTeams.map((team) => [
      team.code,
      {
        code: team.code,
        name: team.name,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
    ]),
  );

  for (const match of matches) {
    const homeCode = match?.Home?.Abbreviation;
    const awayCode = match?.Away?.Abbreviation;
    const homeScore = match?.Home?.Score;
    const awayScore = match?.Away?.Score;

    if (
      !tiedCodes.has(homeCode) ||
      !tiedCodes.has(awayCode) ||
      !Number.isFinite(homeScore) ||
      !Number.isFinite(awayScore)
    ) {
      continue;
    }

    const home = miniTable.get(homeCode);
    const away = miniTable.get(awayCode);
    home.goalsFor += homeScore;
    home.goalsAgainst += awayScore;
    away.goalsFor += awayScore;
    away.goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      home.points += 3;
    } else if (homeScore < awayScore) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  return [...tiedTeams].sort((left, right) => {
    const leftMini = miniTable.get(left.code);
    const rightMini = miniTable.get(right.code);

    if (leftMini.points !== rightMini.points) {
      return rightMini.points - leftMini.points;
    }

    const leftMiniDiff = leftMini.goalsFor - leftMini.goalsAgainst;
    const rightMiniDiff = rightMini.goalsFor - rightMini.goalsAgainst;
    if (leftMiniDiff !== rightMiniDiff) {
      return rightMiniDiff - leftMiniDiff;
    }

    if (leftMini.goalsFor !== rightMini.goalsFor) {
      return rightMini.goalsFor - leftMini.goalsFor;
    }

    return left.name.localeCompare(right.name, "pt-BR");
  });
}

function compareOverallTeams(left, right) {
  if (left.points !== right.points) {
    return right.points - left.points;
  }

  const leftDiff = goalDifference(left);
  const rightDiff = goalDifference(right);
  if (leftDiff !== rightDiff) {
    return rightDiff - leftDiff;
  }

  if (left.goalsFor !== right.goalsFor) {
    return right.goalsFor - left.goalsFor;
  }

  return left.name.localeCompare(right.name, "pt-BR");
}

function buildKnockoutMatches(results) {
  const byMatchNumber = new Map(results.map((match) => [match.MatchNumber, match]));
  const matches = [];
  const bracket = {
    round32: [],
    round16: [],
    quarters: [],
    semis: [],
    finals: [],
  };

  for (const [roundKey, entries] of Object.entries(knockoutPlan)) {
    for (const entry of entries) {
      const match = byMatchNumber.get(entry.matchNumber);
      if (!match) {
        continue;
      }

      matches.push(normalizeKnockoutMatch(entry, match, roundKey));
      bracket[roundKey].push(entry.id);
    }
  }

  return { matches, bracket };
}

function normalizeKnockoutMatch(entry, match, roundKey) {
  const homeTeam = getBracketTeam(match.Home, match.PlaceHolderA);
  const awayTeam = getBracketTeam(match.Away, match.PlaceHolderB);

  return {
    id: entry.id,
    stage: stageCopy[entry.id] ?? stageCopy[roundKey] ?? getDescription(match.StageName)?.toLowerCase() ?? "",
    roundKey,
    side: entry.side,
    homeTeam,
    awayTeam,
    homeScore: Number.isFinite(match?.Home?.Score) ? match.Home.Score : null,
    awayScore: Number.isFinite(match?.Away?.Score) ? match.Away.Score : null,
    status: getMatchStatus(match),
    kickoff: match?.Date ?? null,
    kickoffLabel: formatKickoffLabel(match?.Date),
    nextMatchId: entry.nextMatchId,
    winnerTeam: getWinnerTeam(match),
  };
}

function getBracketTeam(team, placeholder) {
  if (team?.Abbreviation) {
    return team.Abbreviation;
  }

  if (!placeholder) {
    return "A definir";
  }

  if (/^W\d+$/.test(placeholder)) {
    return `Vencedor ${placeholder.slice(1)}`;
  }

  if (/^RU\d+$/.test(placeholder)) {
    return `Perdedor ${placeholder.slice(2)}`;
  }

  const match = placeholder.match(/^([123])([A-Z]+)$/);
  if (match) {
    const [, position, groups] = match;
    const label = position === "1" ? "1º" : position === "2" ? "2º" : "3º";
    return `${label} ${groups.split("").join("/")}`;
  }

  return placeholder;
}

function getWinnerTeam(match) {
  if (!match?.Winner) {
    return null;
  }

  if (match.Home?.IdTeam === match.Winner) {
    return match.Home?.Abbreviation ?? null;
  }

  if (match.Away?.IdTeam === match.Winner) {
    return match.Away?.Abbreviation ?? null;
  }

  return null;
}

function getMatchStatus(match) {
  if (match?.MatchStatus === 0) {
    return "finished";
  }

  if ([2, 3, 4, 5].includes(match?.MatchStatus)) {
    return "live";
  }

  return "scheduled";
}

function getDescription(values) {
  if (!Array.isArray(values)) {
    return null;
  }

  return (
    values.find((value) => value?.Locale?.toLowerCase?.().startsWith("pt"))?.Description ??
    values[0]?.Description ??
    null
  );
}

function goalDifference(team) {
  return team.goalsFor - team.goalsAgainst;
}

function formatKickoffLabel(value) {
  if (!value) {
    return "Data pendente";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const parts = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: BRASILIA_TIMEZONE,
  }).formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${getPart("day")}/${getPart("month")} • ${getPart("hour")}h${getPart("minute")}`;
}

function toIsoTimestamp(value, fallback) {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toISOString();
}
