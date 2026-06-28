import { useEffect, useRef, useState } from "react";

import type { KnockoutMatchView } from "../lib/types";
import type { MatchConflict } from "../lib/workspace/schema";

type MatchModalProps = {
  match: KnockoutMatchView | null;
  sourceLabel: string;
  initialHomeScore: number | null;
  initialAwayScore: number | null;
  conflict?: MatchConflict;
  onClose: () => void;
  onSaveScore: (homeScore: number | null, awayScore: number | null) => void;
  onAcceptFeed: () => void;
  onKeepManual: () => void;
};

export function MatchModal({
  match,
  sourceLabel,
  initialHomeScore,
  initialAwayScore,
  conflict,
  onClose,
  onSaveScore,
  onAcceptFeed,
  onKeepManual,
}: MatchModalProps) {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [showStructure, setShowStructure] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setHomeScore(initialHomeScore === null ? "" : String(initialHomeScore));
    setAwayScore(initialAwayScore === null ? "" : String(initialAwayScore));
  }, [initialAwayScore, initialHomeScore, match?.id]);

  // Close on Escape and manage focus (move into the dialog, restore on close).
  useEffect(() => {
    if (!match) {
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [match?.id]);

  if (!match) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        aria-label={`Partida ${match.id}`}
        aria-modal="true"
        className="match-modal"
        role="dialog"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="match-modal-header">
          <div>
            <p className="eyebrow modal-kicker">{match.stage}</p>
            <h2>Partida {match.id}</h2>
            <p className="modal-kickoff">{match.kickoff}</p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <div className="modal-score-shell">
          <div className="modal-score-grid">
          <div className="team-name">{match.homeTeam}</div>
          <label>
            <span className="sr-only">Placar casa</span>
            <input
              aria-label="Placar casa"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={homeScore}
              onChange={(event) => setHomeScore(event.target.value)}
            />
          </label>
          <span className="modal-score-x" aria-hidden="true">
            ×
          </span>
          <label>
            <span className="sr-only">Placar fora</span>
            <input
              aria-label="Placar fora"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={awayScore}
              onChange={(event) => setAwayScore(event.target.value)}
            />
          </label>
          <div className="team-name team-away">{match.awayTeam}</div>
        </div>
        </div>

        <div className="source-line modal-source">Fonte atual: {sourceLabel}</div>

        {conflict ? (
          <div className="conflict-callout">
            <strong>Conflito detectado</strong>
            <p>
              API sugeriu {conflict.externalValue.homeScore} x {conflict.externalValue.awayScore}
            </p>
            <div className="toolbar-row">
              <button className="primary-button" type="button" onClick={onKeepManual}>
                Manter manual
              </button>
              <button className="ghost-button" type="button" onClick={onAcceptFeed}>
                Aceitar API
              </button>
            </div>
          </div>
        ) : null}

        <div className="toolbar-row modal-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() =>
              onSaveScore(
                homeScore === "" ? null : Number(homeScore),
                awayScore === "" ? null : Number(awayScore),
              )
            }
          >
            Salvar placar
          </button>
        </div>
        <div className="modal-utility-row">
          <button
            className="ghost-button"
            type="button"
            onClick={() => setShowStructure((value) => !value)}
          >
            {showStructure ? "Ocultar estrutura" : "Ver estrutura da chave"}
          </button>
        </div>

        {showStructure ? (
          <div className="structure-panel">
            <p>Home slot: {match.homeSlot}</p>
            <p>Away slot: {match.awaySlot}</p>
            <p>Vencedor propaga para: {match.nextMatchId ?? "fim da chave"}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
