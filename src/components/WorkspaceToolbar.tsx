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
  lastSyncLabel: _lastSyncLabel,
}: WorkspaceToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-copy">
        <p className="eyebrow">Controle do workspace</p>
        <p className="toolbar-lead">Atualize o feed, exporte o estado e retome de onde parou.</p>
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
