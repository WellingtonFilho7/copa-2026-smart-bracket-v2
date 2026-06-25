import type { MatchConflict } from "../lib/workspace/schema";

type ConflictPanelProps = {
  conflicts: MatchConflict[];
};

export function ConflictPanel({ conflicts }: ConflictPanelProps) {
  return (
    <aside className="conflict-panel">
      <h3>Conflitos</h3>
      <p>{conflicts.length} conflito aberto</p>
      {conflicts.length === 0 ? (
        <p className="muted-copy">Sem divergências entre API e edição manual.</p>
      ) : (
        <ul>
          {conflicts.map((conflict) => (
            <li key={conflict.matchId}>
              <strong>{conflict.matchId}</strong> manual {conflict.manualValue.homeScore} x{" "}
              {conflict.manualValue.awayScore} • API {conflict.externalValue.homeScore} x{" "}
              {conflict.externalValue.awayScore}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
