import type { KnockoutMatchView } from "../lib/types";

type BracketHomeProps = {
  matches: Record<string, KnockoutMatchView>;
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

export function BracketHome({
  matches,
  conflictCountByMatch,
  onOpenMatch,
}: BracketHomeProps) {
  return (
    <section className="bracket-shell">
      <div className="bracket-header">
        <h2>Chaveamento da Copa do Mundo 2026</h2>
        <p>Fase eliminatória • Horários de Brasília • Workspace editável</p>
      </div>

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
                    <span>{id}</span>
                    <span>{match.kickoff}</span>
                  </div>
                  <div className="match-card-body">
                    <span>{match.homeTeam}</span>
                    <span>{match.awayTeam}</span>
                  </div>
                  {conflictCount > 0 ? (
                    <span className="conflict-badge">{conflictCount} conflito</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
