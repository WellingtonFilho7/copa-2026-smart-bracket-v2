import type { Workspace } from "./schema";
import { exportWorkspace, importWorkspace } from "./reducer";

const STORAGE_KEY = "copa-2026-smart-bracket-v2";

export function loadWorkspace(): Workspace | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  return importWorkspace(raw);
}

export function saveWorkspace(workspace: Workspace): void {
  window.localStorage.setItem(STORAGE_KEY, exportWorkspace(workspace));
}
