import { useMemo, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { KnockoutStageCard } from "../App";

type BracketHomeProps = {
  matches: Record<string, KnockoutStageCard>;
  conflictCountByMatch: Record<string, number>;
  onOpenMatch: (matchId: string) => void;
};

const columns = [
  { title: "32 avos", ids: ["K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8"] },
  { title: "Oitavas", ids: ["O1", "O2", "O3", "O4"] },
  { title: "Quartas", ids: ["Q1", "Q2"] },
  { title: "Semifinal", ids: ["S1"] },
  { title: "Final", ids: ["F", "T"] },
  { title: "Semifinal", ids: ["S2"] },
  { title: "Quartas", ids: ["Q3", "Q4"] },
  { title: "Oitavas", ids: ["O5", "O6", "O7", "O8"] },
  { title: "32 avos", ids: ["K9", "K10", "K11", "K12", "K13", "K14", "K15", "K16"] },
];

const phaseGroups = [
  {
    id: "round32",
    label: "32 avos",
    panelTitle: "32 avos de final",
    description: "Entrada principal da fase mata-mata, sem rolagem lateral obrigatória.",
    travelNote: "Vencedores avançam para as oitavas.",
    ids: ["K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8", "K9", "K10", "K11", "K12", "K13", "K14", "K15", "K16"],
  },
  {
    id: "round16",
    label: "Oitavas",
    panelTitle: "Oitavas de final",
    description: "Os classificados se reorganizam em oito confrontos decisivos.",
    travelNote: "Vencedores avançam para as quartas.",
    ids: ["O1", "O2", "O3", "O4", "O5", "O6", "O7", "O8"],
  },
  {
    id: "quarters",
    label: "Quartas",
    panelTitle: "Quartas de final",
    description: "Quatro jogos concentram o caminho até as semifinais.",
    travelNote: "Vencedores avançam para as semifinais.",
    ids: ["Q1", "Q2", "Q3", "Q4"],
  },
  {
    id: "semis",
    label: "Semifinal",
    panelTitle: "Semifinais",
    description: "Aqui o torneio se divide entre decisão do título e disputa de 3º lugar.",
    travelNote: "Vencedores vão para a final; derrotados disputam o 3º lugar.",
    ids: ["S1", "S2"],
  },
  {
    id: "finals",
    label: "Final",
    panelTitle: "Final e 3º lugar",
    description: "Os dois últimos jogos fecham o pôster do torneio.",
    travelNote: "Final decide o título; T define o 3º lugar.",
    ids: ["F", "T"],
  },
];

export function BracketHome({
  matches,
  conflictCountByMatch,
  onOpenMatch,
}: BracketHomeProps) {
  const [activePhaseId, setActivePhaseId] = useState(phaseGroups[0].id);
  const [showFullBracket, setShowFullBracket] = useState(false);

  const sourceCopy: Record<KnockoutStageCard["source"], string> = {
    manual: "manual",
    feed: "api",
    base: "base",
  };

  const activePhase = useMemo(
    () => phaseGroups.find((phase) => phase.id === activePhaseId) ?? phaseGroups[0],
    [activePhaseId],
  );
  const activeCards = activePhase.ids
    .map((id) => matches[id])
    .filter((match): match is KnockoutStageCard => Boolean(match));

  function focusPhaseTab(phaseId: string) {
    document.getElementById(`bracket-tab-${phaseId}`)?.focus();
  }

  function activatePhaseByOffset(offset: number) {
    const currentIndex = phaseGroups.findIndex((phase) => phase.id === activePhase.id);
    const nextIndex = (currentIndex + offset + phaseGroups.length) % phaseGroups.length;
    const nextPhase = phaseGroups[nextIndex];
    setActivePhaseId(nextPhase.id);
    focusPhaseTab(nextPhase.id);
  }

  function handlePhaseKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      activatePhaseByOffset(1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      activatePhaseByOffset(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActivePhaseId(phaseGroups[0].id);
      focusPhaseTab(phaseGroups[0].id);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastPhase = phaseGroups[phaseGroups.length - 1];
      setActivePhaseId(lastPhase.id);
      focusPhaseTab(lastPhase.id);
    }
  }

  return (
    <section className="bracket-shell">
      <div className="bracket-header">
        <p className="eyebrow bracket-kicker">Fase eliminatória</p>
        <h2>Chaveamento da Copa do Mundo 2026</h2>
        <p className="bracket-lead">
          Navegue por fase sem rolar para os lados e abra a árvore inteira só quando precisar.
        </p>
      </div>

      <div className="bracket-stage-toolbar">
        <div className="bracket-stage-copy">
          <p className="eyebrow">Modo principal</p>
          <h3>{activePhase.panelTitle}</h3>
          <p>{activePhase.description}</p>
        </div>
        <button
          className="ghost-button bracket-view-toggle"
          type="button"
          onClick={() => setShowFullBracket((current) => !current)}
        >
          {showFullBracket ? "Voltar para fases" : "Ver chave completa"}
        </button>
      </div>

      {!showFullBracket ? (
        <>
          <div className="bracket-phase-nav" aria-label="Fases do chaveamento" role="tablist">
            {phaseGroups.map((phase) => {
              const isActive = phase.id === activePhase.id;
              return (
                <button
                  key={phase.id}
                  aria-controls={`bracket-panel-${phase.id}`}
                  aria-selected={isActive}
                  className={`bracket-phase-tab${isActive ? " is-active" : ""}`}
                  id={`bracket-tab-${phase.id}`}
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                  type="button"
                  onClick={() => setActivePhaseId(phase.id)}
                  onKeyDown={handlePhaseKeyDown}
                >
                  <span>{phase.label}</span>
                  <small>{phase.ids.length} jogos</small>
                </button>
              );
            })}
          </div>

          <section
            aria-labelledby={`bracket-tab-${activePhase.id}`}
            className="bracket-stage-panel"
            data-phase={activePhase.id}
            id={`bracket-panel-${activePhase.id}`}
            role="tabpanel"
          >
            <div className="bracket-stage-summary">
              <span className="bracket-stage-count">{activeCards.length} partidas visíveis</span>
              <p>{activePhase.travelNote}</p>
            </div>

            <div
              className={`bracket-stage-list bracket-stage-list-${activePhase.id}`}
              style={{ alignItems: "start" }}
            >
              {activeCards.map((match) => (
                <button
                  key={match.id}
                  className="match-card bracket-stage-card"
                  type="button"
                  aria-label={`Abrir partida ${match.id}`}
                  style={{ minHeight: 0 }}
                  onClick={() => onOpenMatch(match.id)}
                >
                  <div className="match-card-meta">
                    <span className="match-card-id">{match.id}</span>
                    <span className="match-card-time">{match.kickoff}</span>
                  </div>
                  <div className="match-card-body">
                    <span className="team-line">{match.homeTeam}</span>
                    <span className="team-line">{match.awayTeam}</span>
                  </div>
                  <div className="match-card-scoreline" aria-label={`Placar atual ${match.id}`}>
                    <strong className="match-card-score-value">{match.homeScore ?? "-"}</strong>
                    <span>x</span>
                    <strong className="match-card-score-value">{match.awayScore ?? "-"}</strong>
                  </div>
                  <div className="match-card-foot">
                    <span className={`match-card-source match-card-source-${match.source}`}>
                      {sourceCopy[match.source]}
                    </span>
                    {(conflictCountByMatch[match.id] ?? 0) > 0 ? (
                      <span className="conflict-badge">{conflictCountByMatch[match.id]} conflito</span>
                    ) : null}
                  </div>
                  <p className="bracket-stage-travel">{getTravelLabel(match.id)}</p>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="bracket-scroll" aria-label="Tabela horizontal do chaveamento">
          <div className="bracket-grid">
            {columns.map((column) => (
              <div className="bracket-column" key={`${column.title}-${column.ids[0]}`}>
                <h3>{column.title}</h3>
                {column.ids.map((id) => {
                  const match = matches[id];
                  if (!match) {
                    return null;
                  }

                  const conflictCount = conflictCountByMatch[id] ?? 0;
                  return (
                    <button
                      key={id}
                      className="match-card"
                      type="button"
                      aria-label={`Abrir partida ${id}`}
                      onClick={() => onOpenMatch(id)}
                    >
                      <div className="match-card-meta">
                        <span className="match-card-id">{id}</span>
                        <span className="match-card-time">{match.kickoff}</span>
                      </div>
                      <div className="match-card-body">
                        <span className="team-line">{match.homeTeam}</span>
                        <span className="team-line">{match.awayTeam}</span>
                      </div>
                      <div className="match-card-scoreline" aria-label={`Placar atual ${id}`}>
                        <strong className="match-card-score-value">{match.homeScore ?? "-"}</strong>
                        <span>x</span>
                        <strong className="match-card-score-value">{match.awayScore ?? "-"}</strong>
                      </div>
                      <div className="match-card-foot">
                        <span className={`match-card-source match-card-source-${match.source}`}>
                          {sourceCopy[match.source]}
                        </span>
                        {conflictCount > 0 ? (
                          <span className="conflict-badge">{conflictCount} conflito</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function getTravelLabel(matchId: string) {
  if (matchId.startsWith("K")) return "Segue para as oitavas";
  if (matchId.startsWith("O")) return "Segue para as quartas";
  if (matchId.startsWith("Q")) return "Segue para a semifinal";
  if (matchId === "S1" || matchId === "S2") return "Define final e 3º lugar";
  if (matchId === "F") return "Decide o título";
  return "Decide o 3º lugar";
}
