import type { MatchConflict } from "../lib/workspace/schema";

type ConflictPanelProps = {
  conflicts: MatchConflict[];
};

export function ConflictPanel({ conflicts }: ConflictPanelProps) {
  return (
    <aside className="conflict-panel">
      <div className="conflict-panel-header">
        <div>
          <p className="eyebrow">Revisão</p>
          <h3>Conflitos</h3>
        </div>
        <span className="conflict-count-badge">{conflicts.length}</span>
      </div>
      <p className="muted-copy">{conflicts.length} conflito aberto</p>
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
