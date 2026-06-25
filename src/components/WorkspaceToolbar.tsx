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
      <div>
        <p className="eyebrow">Workspace</p>
        <p className="muted-copy">Última sync: {lastSyncLabel}</p>
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
