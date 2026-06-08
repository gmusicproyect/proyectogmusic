import { useCallback, useEffect, useRef, useState } from "react";
import { loadPathOnce } from "../services/gmusic-api/path-load";
import { isPathMockEnabled } from "../services/gmusic-api/config";
import type { PathViewModel } from "../services/gmusic-api/map-path";
import {
  applyDashboardOutcome,
  DashboardRequestManager,
} from "./dashboard-request";

export type PathHookState =
  | { status: "loading" }
  | { status: "success"; viewModel: PathViewModel }
  | { status: "error"; message: string };

export function usePath() {
  const [state, setState] = useState<PathHookState>({ status: "loading" });
  const managerRef = useRef(new DashboardRequestManager());

  const load = useCallback(async () => {
    const manager = managerRef.current;
    const { generation, signal } = manager.begin();

    if (!isPathMockEnabled()) {
      setState({ status: "loading" });
    }

    const outcome = await loadPathOnce(signal);
    const nextState = applyDashboardOutcome(generation, manager, outcome);
    if (nextState) setState(nextState as PathHookState);
  }, []);

  useEffect(() => {
    void load();
    const manager = managerRef.current;
    return () => manager.dispose();
  }, [load]);

  return {
    ...state,
    retry: load,
  };
}
