import { useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { OfficialBracket, OfficialMatch } from "../lib/feed/schema";

type BracketHomeProps = {
  matches: Record<string, OfficialMatch>;
  bracket: OfficialBracket;
  onOpenMatch: (matchId: string) => void;
};

const phaseGroups = [
  {
    id: "round32",
    label: "32 avos",
    panelTitle: "32 avos de final",
    description: "Entrada principal da fase mata-mata, sem rolagem lateral obrigatória.",
    travelNote: "Vencedores avançam para as oitavas.",
  },
  {
    id: "round16",
    label: "Oitavas",
    panelTitle: "Oitavas de final",
    description: "Os classificados se reorganizam em oito confrontos decisivos.",
    travelNote: "Vencedores avançam para as quartas.",
  },
  {
    id: "quarters",
    label: "Quartas",
    panelTitle: "Quartas de final",
    description: "Quatro jogos concentram o caminho até as semifinais.",
    travelNote: "Vencedores avançam para as semifinais.",
  },
  {
    id: "semis",
    label: "Semifinal",
    panelTitle: "Semifinais",
    description: "Aqui o torneio se divide entre decisão do título e disputa de 3º lugar.",
    travelNote: "Vencedores vão para a final; derrotados disputam o 3º lugar.",
  },
  {
    id: "finals",
    label: "Final",
    panelTitle: "Final e 3º lugar",
    description: "Os dois últimos jogos fecham o pôster do torneio.",
    travelNote: "Final decide o título; T define o 3º lugar.",
  },
] as const;

const fullColumns = [
  { title: "32 avos", roundKey: "round32", ids: (bracket: OfficialBracket) => bracket.round32.slice(0, 8) },
  { title: "Oitavas", roundKey: "round16", ids: (bracket: OfficialBracket) => bracket.round16.slice(0, 4) },
  { title: "Quartas", roundKey: "quarters", ids: (bracket: OfficialBracket) => bracket.quarters.slice(0, 2) },
  { title: "Semifinal", roundKey: "semis", ids: (bracket: OfficialBracket) => bracket.semis.slice(0, 1) },
  { title: "Final", roundKey: "finals", ids: (bracket: OfficialBracket) => bracket.finals },
  { title: "Semifinal", roundKey: "semis", ids: (bracket: OfficialBracket) => bracket.semis.slice(1) },
  { title: "Quartas", roundKey: "quarters", ids: (bracket: OfficialBracket) => bracket.quarters.slice(2) },
  { title: "Oitavas", roundKey: "round16", ids: (bracket: OfficialBracket) => bracket.round16.slice(4) },
  { title: "32 avos", roundKey: "round32", ids: (bracket: OfficialBracket) => bracket.round32.slice(8) },
] as const;

function getStatusCopy(status: OfficialMatch["status"]) {
  if (status === "finished") return "encerrado";
  if (status === "live") return "ao vivo";
  return "agendado";
}

export function BracketHome({ matches, bracket, onOpenMatch }: BracketHomeProps) {
  const [activePhaseId, setActivePhaseId] = useState<(typeof phaseGroups)[number]["id"]>("round32");
  const [showFullBracket, setShowFullBracket] = useState(false);

  const activePhase = phaseGroups.find((phase) => phase.id === activePhaseId) ?? phaseGroups[0];
  const activeCards = bracket[activePhase.id].map((id) => matches[id]).filter(Boolean);

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
        <h2>Chaveamento oficial da Copa do Mundo 2026</h2>
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
                  <small>{bracket[phase.id].length} jogos</small>
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
                  className={`match-card bracket-stage-card${
                    match.status === "finished" ? " match-card-played" : ""
                  }`}
                  type="button"
                  aria-label={`Abrir partida ${match.id}`}
                  style={{ minHeight: 0 }}
                  onClick={() => onOpenMatch(match.id)}
                >
                  <div className="match-card-meta">
                    <span className="match-card-id">{match.id}</span>
                    <span className="match-card-time">{match.kickoffLabel}</span>
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
                    <span className="match-card-source match-card-source-official">oficial</span>
                    <span className="match-card-state">{getStatusCopy(match.status)}</span>
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
            {fullColumns.map((column) => (
              <div className="bracket-column" key={`${column.title}-${column.ids(bracket)[0] ?? column.title}`}>
                <h3>{column.title}</h3>
                {column.ids(bracket).map((id) => {
                  const match = matches[id];
                  if (!match) {
                    return null;
                  }

                  return (
                    <button
                      key={id}
                      className={`match-card${match.status === "finished" ? " match-card-played" : ""}`}
                      type="button"
                      aria-label={`Abrir partida ${id}`}
                      onClick={() => onOpenMatch(id)}
                    >
                      <div className="match-card-meta">
                        <span className="match-card-id">{id}</span>
                        <span className="match-card-time">{match.kickoffLabel}</span>
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
                        <span className="match-card-source match-card-source-official">oficial</span>
                        <span className="match-card-state">{getStatusCopy(match.status)}</span>
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
