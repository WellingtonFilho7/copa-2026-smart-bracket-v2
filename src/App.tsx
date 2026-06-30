import { useEffect, useMemo, useState } from "react";

import { BracketHome } from "./components/BracketHome";
import { GroupCards } from "./components/GroupCards";
import { MatchHub } from "./components/MatchHub";
import { MatchModal } from "./components/MatchModal";
import { WorkspaceToolbar } from "./components/WorkspaceToolbar";
import { fetchOfficialFeed } from "./lib/feed/client";
import type { OfficialFeedPayload, OfficialMatch } from "./lib/feed/schema";
import { loadCachedFeed, saveCachedFeed } from "./lib/workspace/storage";

export default function App() {
  const [data, setData] = useState<OfficialFeedPayload | null>(() => loadCachedFeed());
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<"idle" | "pending" | "error">("idle");
  const [isStale, setIsStale] = useState(false);

  const matchesById = useMemo(
    () => Object.fromEntries((data?.matches ?? []).map((match) => [match.id, match])),
    [data],
  );
  const selectedMatch = selectedMatchId ? matchesById[selectedMatchId] ?? null : null;
  const knockoutMatches = useMemo(
    () => (data?.matches ?? []).filter((match) => match.roundKey !== undefined),
    [data],
  );
  const featuredMatches = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.bracket.round32
      .map((id) => matchesById[id])
      .filter((match): match is OfficialMatch => Boolean(match));
  }, [data, matchesById]);

  const finishedCount = knockoutMatches.filter((match) => match.status === "finished").length;
  const liveCount = knockoutMatches.filter((match) => match.status === "live").length;
  const scheduledCount = knockoutMatches.filter((match) => match.status === "scheduled").length;

  useEffect(() => {
    void handleSync();
    // Intentionally sync once on mount; local cache keeps the shell populated between visits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSync() {
    setSyncState("pending");
    try {
      const nextData = await fetchOfficialFeed();
      setData(nextData);
      saveCachedFeed(nextData);
      setSyncState("idle");
      setIsStale(false);
    } catch {
      setSyncState("error");
      setIsStale(Boolean(data));
    }
  }

  return (
    <main className="app-shell">
      <a className="skip-link" href="#partidas">
        Pular para partidas
      </a>
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow hero-kicker">Copa do Mundo 2026 • tracker oficial</p>
          <h1>
            Copa 2026
            <span>Official Bracket</span>
          </h1>
          <p className="hero-lead">
            Acompanhe a chave e os grupos com o calendário oficial da FIFA normalizado no backend,
            sem edição manual e sem placares locais competindo com o torneio real.
          </p>
          <div className="hero-stats" aria-label="Resumo da home">
            <div className="hero-stat">
              <strong>{finishedCount}</strong>
              <span>encerradas</span>
            </div>
            <div className="hero-stat">
              <strong>{scheduledCount}</strong>
              <span>agendadas</span>
            </div>
            <div className="hero-stat">
              <strong>{liveCount}</strong>
              <span>ao vivo</span>
            </div>
          </div>
        </div>
      </header>

      <WorkspaceToolbar
        lastSyncLabel={formatTimestamp(data?.meta.syncedAt)}
        upstreamLabel={formatTimestamp(data?.meta.upstreamUpdatedAt)}
        syncState={syncState}
        isStale={isStale}
        onSync={() => {
          void handleSync();
        }}
      />

      <nav className="section-nav" aria-label="Navegação da página">
        <a href="#partidas">Partidas</a>
        <a href="#grupos">Grupos</a>
        <a href="#chave">Chave</a>
      </nav>

      {!data ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Sincronização inicial</p>
              <h2>Carregando dados oficiais</h2>
            </div>
            <p className="section-note">
              {syncState === "error"
                ? "A fonte oficial não respondeu. Tente atualizar novamente."
                : "Buscando o feed oficial ao vivo do torneio."}
            </p>
          </div>
        </section>
      ) : (
        <>
          <MatchHub matches={featuredMatches} onOpenMatch={setSelectedMatchId} />

          <section className="section-block" id="grupos">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Tabela oficial</p>
                <h2>Classificação dos grupos</h2>
              </div>
              <p className="section-note">
                Doze grupos recalculados a partir dos resultados oficiais da FIFA, sem edição local.
              </p>
            </div>
            <GroupCards groups={data.groups} />
          </section>

          <section className="workspace-grid workspace-grid-single">
            <div className="workspace-primary" id="chave">
              <BracketHome matches={matchesById} bracket={data.bracket} onOpenMatch={setSelectedMatchId} />
            </div>
          </section>
        </>
      )}

      <MatchModal match={selectedMatch} onClose={() => setSelectedMatchId(null)} />
    </main>
  );
}

function formatTimestamp(value: string | undefined) {
  if (!value) {
    return "ainda não sincronizado";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
