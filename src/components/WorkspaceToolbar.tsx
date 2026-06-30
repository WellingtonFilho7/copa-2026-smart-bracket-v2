type WorkspaceToolbarProps = {
  onSync: () => void;
  lastSyncLabel: string;
  upstreamLabel: string;
  isStale?: boolean;
  syncState?: "idle" | "pending" | "error";
};

export function WorkspaceToolbar({
  onSync,
  lastSyncLabel,
  upstreamLabel,
  isStale = false,
  syncState = "idle",
}: WorkspaceToolbarProps) {
  const isPending = syncState === "pending";

  return (
    <div className="toolbar">
      <div className="toolbar-copy">
        <p className="eyebrow">Fonte oficial</p>
        <p className="toolbar-lead">
          O app usa o calendário oficial da FIFA como fonte principal. Sem edição manual, sem
          importação de placares e sem conflito editorial.
        </p>
        <p className="toolbar-sync" aria-label="Última sincronização">
          <span className="toolbar-sync-dot" aria-hidden="true" />
          Última sync: {lastSyncLabel}
        </p>
        <p className="toolbar-sync" aria-label="Atualização da fonte oficial">
          <span className="toolbar-sync-dot" aria-hidden="true" />
          Fonte oficial: {upstreamLabel}
        </p>
        {isStale ? (
          <p className="toolbar-error">Mostrando o último feed salvo até a API oficial voltar.</p>
        ) : null}
        {syncState === "error" ? (
          <p className="toolbar-error" role="alert">
            Não foi possível buscar os dados oficiais agora. Tente novamente.
          </p>
        ) : null}
      </div>
      <div className="toolbar-row">
        <button
          className="primary-button"
          type="button"
          onClick={onSync}
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? "Atualizando…" : "Atualizar dados oficiais"}
        </button>
      </div>
    </div>
  );
}
