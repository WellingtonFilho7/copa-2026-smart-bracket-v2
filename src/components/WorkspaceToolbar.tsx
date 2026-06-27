type WorkspaceToolbarProps = {
  onSync: () => void;
  onExport: () => void;
  onImportClick: () => void;
  lastSyncLabel: string;
};

export function WorkspaceToolbar({
  onSync,
  onExport,
  onImportClick,
  lastSyncLabel,
}: WorkspaceToolbarProps) {
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
      </div>
      <div className="toolbar-row">
        <button className="primary-button" type="button" onClick={onSync}>
          Buscar feed
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
