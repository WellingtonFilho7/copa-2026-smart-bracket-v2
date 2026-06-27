import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { BracketHome } from "./components/BracketHome";
import { ConflictPanel } from "./components/ConflictPanel";
import { GroupCards } from "./components/GroupCards";
import { MatchHub } from "./components/MatchHub";
import { MatchModal } from "./components/MatchModal";
import { WorkspaceToolbar } from "./components/WorkspaceToolbar";
import { fetchFeedMatches } from "./lib/feed/client";
import { TOURNAMENT_BASE } from "./lib/tournament/base-data";
import {
  assignThirdPlaceSlots,
  buildKnockoutMatches,
  computeGroupStandings,
  rankThirdPlaceTeams,
} from "./lib/tournament/engine";
import type { GroupMatch, KnockoutMatchView } from "./lib/types";
import {
  acceptFeedValue,
  applyManualScore,
  createInitialWorkspace,
  exportWorkspace,
  importWorkspace,
  keepManualValue,
  mergeFeedMatches,
  resolveMatchScore,
} from "./lib/workspace/reducer";
import { loadWorkspace, saveWorkspace } from "./lib/workspace/storage";

const STAGE_ORDER = [
  "K1",
  "K2",
  "K3",
  "K4",
  "K5",
  "K6",
  "K7",
  "K8",
  "K9",
  "K10",
  "K11",
  "K12",
  "K13",
  "K14",
  "K15",
  "K16",
  "O1",
  "O2",
  "O3",
  "O4",
  "O5",
  "O6",
  "O7",
  "O8",
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "S1",
  "S2",
  "F",
  "T",
];

export default function App() {
  const [workspace, setWorkspace] = useState(() => loadWorkspace() ?? createInitialWorkspace(TOURNAMENT_BASE));
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const groupMatches = useMemo(
    () =>
      workspace.tournament.groupMatches.map((match) => {
        const resolved = resolveMatchScore(workspace, match.id);
        return {
          ...match,
          homeScore: resolved.homeScore,
          awayScore: resolved.awayScore,
        };
      }),
    [workspace],
  );

  const standings = useMemo(
    () => computeGroupStandings(workspace.tournament.teams, groupMatches as GroupMatch[]),
    [groupMatches, workspace.tournament.teams],
  );
  const rankedThirds = useMemo(() => rankThirdPlaceTeams(standings).slice(0, 8), [standings]);
  const thirdPlaceSlots = useMemo(() => assignThirdPlaceSlots(rankedThirds), [rankedThirds]);
  const knockoutMatches = useMemo(
    () => buildKnockoutMatches(standings, thirdPlaceSlots, workspace.tournament.knockoutMatches),
    [standings, thirdPlaceSlots, workspace.tournament.knockoutMatches],
  );
  const selectedMatch = selectedMatchId ? knockoutMatches[selectedMatchId] ?? null : null;
  const selectedScore = selectedMatchId
    ? resolveMatchScore(workspace, selectedMatchId)
    : { source: "base" as const, homeScore: null, awayScore: null };

  const conflictEntries = Object.values(workspace.conflicts).filter((value) => value !== undefined);
  const conflictCountByMatch = Object.fromEntries(conflictEntries.map((conflict) => [conflict.matchId, 1]));
  const stageMatches = useMemo(() => pickStageMatches(knockoutMatches), [knockoutMatches]);
  const quickMatches = useMemo(
    () =>
      Object.values(stageMatches).map((match) => {
        const score = resolveMatchScore(workspace, match.id);
        return {
          id: match.id,
          stage: match.stage,
          kickoff: match.kickoff,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          homeScore: score.homeScore,
          awayScore: score.awayScore,
          source: score.source,
          hasConflict: Boolean(workspace.conflicts[match.id]),
        };
      }),
    [stageMatches, workspace],
  );
  const filledMatchCount = quickMatches.filter(
    (match) => match.homeScore !== null || match.awayScore !== null,
  ).length;
  const manualMatchCount = quickMatches.filter((match) => match.source === "manual").length;
  const feedMatchCount = quickMatches.filter((match) => match.source === "feed").length;

  function commitWorkspace(nextWorkspace: typeof workspace) {
    setWorkspace(nextWorkspace);
    saveWorkspace(nextWorkspace);
  }

  async function handleSync() {
    const feedMatches = await fetchFeedMatches();
    const nextWorkspace = mergeFeedMatches(workspace, feedMatches);
    commitWorkspace(nextWorkspace);
  }

  function handleSaveScore(homeScore: number | null, awayScore: number | null) {
    if (!selectedMatchId) {
      return;
    }
    commitWorkspace(applyManualScore(workspace, selectedMatchId, homeScore, awayScore));
  }

  function handleExport() {
    const blob = new Blob([exportWorkspace(workspace)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "copa-2026-smart-bracket-workspace.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const imported = importWorkspace(text);
    commitWorkspace(imported);
    event.target.value = "";
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">World Cup 2026 • bracket poster</p>
          <h1>Copa 2026 Smart Bracket</h1>
          <p className="hero-lead">
            Acompanhe o mata-mata, ajuste resultados e revise conflitos em uma página com cara
            de tabela oficial.
          </p>
        </div>
        <div className="hero-ribbon" aria-label="Resumo da home">
          <span>{filledMatchCount} placares</span>
          <span>{manualMatchCount} manuais</span>
          <span>{feedMatchCount} da API</span>
        </div>
      </header>

      <WorkspaceToolbar
        lastSyncLabel={workspace.meta.lastSyncAt ?? "ainda não sincronizado"}
        onExport={handleExport}
        onImportClick={handleImportClick}
        onSync={() => {
          void handleSync();
        }}
      />
      <input ref={fileInputRef} hidden type="file" accept="application/json" onChange={(event) => void handleImport(event)} />

      <nav className="section-nav" aria-label="Navegação da página">
        <a href="#partidas">Partidas</a>
        <a href="#grupos">Grupos</a>
        <a href="#chave">Chave</a>
        <a href="#conflitos">Conflitos</a>
      </nav>

      <MatchHub matches={quickMatches} conflictCount={conflictEntries.length} onOpenMatch={setSelectedMatchId} />

      <section className="section-block" id="grupos">
        <div className="section-heading">
          <p className="eyebrow">Mapa do torneio</p>
          <h2>Grupos classificados</h2>
        </div>
        <GroupCards teams={workspace.tournament.teams} />
      </section>

      <section className="workspace-grid">
        <div id="chave">
        <BracketHome
          matches={stageMatches}
          conflictCountByMatch={conflictCountByMatch}
          onOpenMatch={setSelectedMatchId}
        />
        </div>
        <div id="conflitos">
          <ConflictPanel conflicts={conflictEntries} />
        </div>
      </section>

      <MatchModal
        match={selectedMatch}
        sourceLabel={selectedScore.source}
        initialHomeScore={selectedScore.homeScore}
        initialAwayScore={selectedScore.awayScore}
        conflict={selectedMatchId ? workspace.conflicts[selectedMatchId] : undefined}
        onAcceptFeed={() => {
          if (!selectedMatchId) return;
          commitWorkspace(acceptFeedValue(workspace, selectedMatchId));
        }}
        onClose={() => setSelectedMatchId(null)}
        onKeepManual={() => {
          if (!selectedMatchId) return;
          commitWorkspace(keepManualValue(workspace, selectedMatchId));
        }}
        onSaveScore={handleSaveScore}
      />
    </main>
  );
}

function pickStageMatches(matches: Record<string, ReturnType<typeof buildKnockoutMatches>[string]>) {
  return STAGE_ORDER.reduce<Record<string, KnockoutMatchView>>((accumulator, id) => {
    const match = matches[id];
    if (match) {
      accumulator[id] = match;
    }
    return accumulator;
  }, {});
}
