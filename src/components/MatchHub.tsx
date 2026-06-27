type MatchHubEntry = {
  id: string;
  stage: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  source: "manual" | "feed" | "base";
  hasConflict: boolean;
};

type MatchHubProps = {
  matches: MatchHubEntry[];
  conflictCount: number;
  onOpenMatch: (matchId: string) => void;
};

const sourceCopy: Record<MatchHubEntry["source"], string> = {
  manual: "manual",
  feed: "api",
  base: "base",
};

export function MatchHub({ matches, conflictCount, onOpenMatch }: MatchHubProps) {
  const featured = matches.slice(0, 8);
  const manualCount = matches.filter((match) => match.source === "manual").length;

  return (
    <section className="match-hub" id="partidas">
      <div className="match-hub-header">
        <div>
          <p className="eyebrow">Fluxo rápido</p>
          <h2>Partidas rápidas</h2>
          <p className="muted-copy">
            No celular, comece por aqui: abra um jogo, ajuste placar e volte para a chave
            completa quando precisar do panorama.
          </p>
        </div>
        <div className="match-hub-metrics" aria-label="Resumo do workspace">
          <div className="match-metric">
            <strong>{featured.length}</strong>
            <span>atalhos agora</span>
          </div>
          <div className="match-metric">
            <strong>{manualCount}</strong>
            <span>edições manuais</span>
          </div>
          <div className="match-metric match-metric-warn">
            <strong>{conflictCount}</strong>
            <span>conflitos</span>
          </div>
        </div>
      </div>

      <div className="match-hub-strip" role="list" aria-label="Atalhos de partidas">
        {featured.map((match) => (
          <article className="match-quick-card" key={match.id} role="listitem">
            <div className="match-quick-meta">
              <span>{match.stage}</span>
              <span>{match.kickoff}</span>
            </div>
            <div className="match-quick-score" aria-label={`Placar atual ${match.id}`}>
              <strong>{match.homeScore ?? "-"}</strong>
              <span>x</span>
              <strong>{match.awayScore ?? "-"}</strong>
            </div>
            <h3>
              {match.homeTeam} x {match.awayTeam}
            </h3>
            <div className="match-quick-status">
              <span className={`status-pill status-${match.source}`}>{sourceCopy[match.source]}</span>
              {match.hasConflict ? <span className="status-pill status-conflict">conflito</span> : null}
            </div>
            <button
              className="primary-button quick-open-button"
              type="button"
              aria-label={`Abrir partida rápida ${match.id}`}
              onClick={() => onOpenMatch(match.id)}
            >
              Abrir {match.id}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
