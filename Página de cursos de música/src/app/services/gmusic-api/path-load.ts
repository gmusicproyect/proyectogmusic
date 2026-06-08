import { fetchPath } from "./path";
import { GmusicApiError, isAbortError } from "./client";
import { isPathMockEnabled } from "./config";
import { getMockPathResponse, getMockActiveNodePanel } from "./mock-path";
import { mapPathToViewModel, findPathNodeById, type PathViewModel } from "./map-path";
import type { PathResponse } from "./types";

export type PathLoadOutcome =
  | { type: "success"; viewModel: PathViewModel }
  | { type: "error"; message: string }
  | { type: "aborted" };

export interface PathLoadDeps {
  fetchPath: (options?: { signal?: AbortSignal }) => Promise<PathResponse>;
  isPathMockEnabled: () => boolean;
  getMockPathResponse: () => PathResponse;
  mapPathToViewModel: typeof mapPathToViewModel;
}

const defaultDeps: PathLoadDeps = {
  fetchPath,
  isPathMockEnabled,
  getMockPathResponse,
  mapPathToViewModel,
};

export async function loadPathOnce(
  signal: AbortSignal,
  deps: PathLoadDeps = defaultDeps
): Promise<PathLoadOutcome> {
  if (deps.isPathMockEnabled()) {
    if (signal.aborted) return { type: "aborted" };
    const viewModel = deps.mapPathToViewModel(deps.getMockPathResponse());
    enrichMockActivePanel(viewModel);
    return { type: "success", viewModel };
  }

  try {
    const response = await deps.fetchPath({ signal });
    if (signal.aborted) return { type: "aborted" };
    return {
      type: "success",
      viewModel: deps.mapPathToViewModel(response),
    };
  } catch (error) {
    if (isAbortError(error) || signal.aborted) return { type: "aborted" };
    const message =
      error instanceof GmusicApiError
        ? error.message
        : "No pudimos cargar tu camino. Comprueba la conexión e inténtalo de nuevo.";
    return { type: "error", message };
  }
}

function enrichMockActivePanel(viewModel: PathViewModel): void {
  const active = findPathNodeById(viewModel.modules, viewModel.activeNodeId);
  if (!active) return;
  const panel = getMockActiveNodePanel();
  active.typeLabel = panel.typeLabel;
  active.description = panel.description;
}
