import type { OfficialMatch } from "../lib/feed/schema";

type MatchHubProps = {
  matches: OfficialMatch[];
  onOpenMatch: (matchId: string) => void;
};

function getStatusCopy(status: OfficialMatch["status"]) {
  if (status === "finished") return "encerrado";
  if (status === "live") return "ao vivo";
  return "agendado";
}

export function MatchHub({ matches, onOpenMatch }: MatchHubProps) {
  const featured = matches.slice(0, 8);
  const finishedCount = matches.filter((match) => match.status === "finished").length;
  const liveCount = matches.filter((match) => match.status === "live").length;

  return (
    <section className="match-hub" id="partidas">
      <div className="match-hub-header">
        <div>
          <p className="eyebrow">Fluxo oficial</p>
          <h2>Partidas em destaque</h2>
          <p className="muted-copy">
            Abra qualquer jogo para ver placar oficial, status e caminho da chave sem alterar o
            torneio.
          </p>
          <p className="match-hub-note">Leitura rápida do estado oficial antes de explorar a árvore completa.</p>
        </div>
        <div className="match-hub-metrics" aria-label="Resumo oficial">
          <div className="match-metric">
            <strong>{featured.length}</strong>
            <span>atalhos agora</span>
          </div>
          <div className="match-metric">
            <strong>{finishedCount}</strong>
            <span>encerradas</span>
          </div>
          <div className="match-metric match-metric-warn">
            <strong>{liveCount}</strong>
            <span>ao vivo</span>
          </div>
        </div>
      </div>

      <div className="match-hub-strip" role="list" aria-label="Atalhos de partidas">
        {featured.map((match) => (
          <article className="match-quick-card" key={match.id} role="listitem">
            <div className="match-quick-meta">
              <span>{match.stage}</span>
              <span>{match.kickoffLabel}</span>
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
              <span className="status-pill status-official">oficial</span>
              <span className={`status-pill status-${match.status}`}>{getStatusCopy(match.status)}</span>
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
