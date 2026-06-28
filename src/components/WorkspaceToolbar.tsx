type WorkspaceToolbarProps = {
  onSync: () => void;
  onExport: () => void;
  onImportClick: () => void;
  lastSyncLabel: string;
  syncState?: "idle" | "pending" | "error";
};

export function WorkspaceToolbar({
  onSync,
  onExport,
  onImportClick,
  lastSyncLabel,
  syncState = "idle",
}: WorkspaceToolbarProps) {
  const isPending = syncState === "pending";

  return (
    <div className="toolbar">
      <div className="toolbar-copy">
        <p className="eyebrow">Controle do workspace</p>
        <p className="toolbar-lead">
          Busque o feed quando quiser, salve um snapshot em JSON e compartilhe a mesma base entre
          amigos.
        </p>
        <p className="toolbar-sync" aria-label="Última sincronização">
          <span className="toolbar-sync-dot" aria-hidden="true" />
          Última sync: {lastSyncLabel}
        </p>
        {syncState === "error" ? (
          <p className="toolbar-error" role="alert">
            Não foi possível buscar o feed. Verifique a conexão e tente novamente.
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
          {isPending ? "Buscando…" : "Buscar feed"}
        </button>
        <button className="ghost-button" type="button" onClick={onExport}>
          Exportar JSON
        </button>
        <button className="ghost-button" type="button" onClick={onImportClick}>
          Importar JSON
        </button>
      </div>
    </div>
  );
}
