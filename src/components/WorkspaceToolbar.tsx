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
        <p className="eyebrow">Workspace</p>
        <p className="muted-copy">Atualize, exporte e retome o bracket sem depender de conta.</p>
        <div className="sync-pill" aria-label="Última sincronização">
          <span className="sync-dot" aria-hidden="true" />
          Última sync: {lastSyncLabel}
        </div>
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
