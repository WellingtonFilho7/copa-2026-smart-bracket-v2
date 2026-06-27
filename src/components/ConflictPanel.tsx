import type { MatchConflict } from "../lib/workspace/schema";

type ConflictPanelProps = {
  conflicts: MatchConflict[];
};

export function ConflictPanel({ conflicts }: ConflictPanelProps) {
  const summaryCopy =
    conflicts.length === 0
      ? "Nenhum conflito aberto"
      : conflicts.length === 1
        ? "1 conflito aberto"
        : `${conflicts.length} conflitos abertos`;

  return (
    <aside className="conflict-panel">
      <div className="conflict-panel-header">
        <div>
          <p className="eyebrow">Revisão editorial</p>
          <h3>Conflitos abertos</h3>
        </div>
        <span className="conflict-count-badge">{conflicts.length}</span>
      </div>
      <p className="muted-copy">{summaryCopy}</p>
      {conflicts.length === 0 ? (
        <p className="muted-copy">Sem divergências entre API e edição manual.</p>
      ) : (
        <ul className="conflict-list">
          {conflicts.map((conflict) => (
            <li key={conflict.matchId}>
              <strong>{conflict.matchId}</strong>
              <span>
                Manual {conflict.manualValue.homeScore} x {conflict.manualValue.awayScore}
              </span>
              <span>
                API {conflict.externalValue.homeScore} x {conflict.externalValue.awayScore}
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
