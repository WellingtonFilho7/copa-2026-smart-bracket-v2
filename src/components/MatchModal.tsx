import { useEffect, useRef, useState } from "react";

import type { OfficialMatch } from "../lib/feed/schema";

type MatchModalProps = {
  match: OfficialMatch | null;
  onClose: () => void;
};

function getStatusCopy(status: OfficialMatch["status"]) {
  if (status === "finished") return "Encerrado";
  if (status === "live") return "Ao vivo";
  return "Agendado";
}

export function MatchModal({ match, onClose }: MatchModalProps) {
  const [showStructure, setShowStructure] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!match) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || active === dialogRef.current) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last || active === dialogRef.current) {
        event.preventDefault();
        first.focus();
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
            <p className="modal-kickoff">{match.kickoffLabel}</p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Fechar
          </button>
        </header>

        <div className="modal-score-shell">
          <div className="modal-score-grid">
            <div className="team-name team-home">{match.homeTeam}</div>
            <div className="score-field home-score-field modal-score-readonly">
              <span>{match.homeScore ?? "-"}</span>
            </div>
            <span className="modal-score-x" aria-hidden="true">
              ×
            </span>
            <div className="score-field away-score-field modal-score-readonly">
              <span>{match.awayScore ?? "-"}</span>
            </div>
            <div className="team-name team-away">{match.awayTeam}</div>
          </div>
        </div>

        <div className="source-line modal-source">Fonte atual: oficial</div>
        <div className="source-line modal-source">Status: {getStatusCopy(match.status)}</div>

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
            <p>Fase: {match.stage}</p>
            <p>Próximo jogo: {match.nextMatchId ?? "fim da chave"}</p>
            <p>Vencedor oficial: {match.winnerTeam ?? "a definir"}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}
