import { useCallback, useEffect, useRef, useState } from "react";
import { loadLessonSessionOnce } from "../services/gmusic-api/lesson-session-load";
import type { LessonSessionStartResult } from "../services/gmusic-api/types";
import { DashboardRequestManager } from "./dashboard-request";

export type StartLessonSessionHookState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: LessonSessionStartResult }
  | { status: "error"; message: string };

export function useStartLessonSession() {
  const [state, setState] = useState<StartLessonSessionHookState>({ status: "idle" });
  const managerRef = useRef(new DashboardRequestManager());
  const lastNodeIdRef = useRef<string | null>(null);

  const run = useCallback(async (nodeId: string) => {
    lastNodeIdRef.current = nodeId;
    const manager = managerRef.current;
    const { generation, signal } = manager.begin();
    setState({ status: "loading" });

    const outcome = await loadLessonSessionOnce(nodeId, signal);
    if (!manager.isCurrent(generation)) return;

    if (outcome.type === "aborted") return;
    if (outcome.type === "success") {
      setState({ status: "success", result: outcome.result });
      return;
    }
    setState({ status: "error", message: outcome.message });
  }, []);

  const start = useCallback(
    (nodeId: string) => {
      void run(nodeId);
    },
    [run]
  );

  const retry = useCallback(() => {
    const nodeId = lastNodeIdRef.current;
    if (nodeId) void run(nodeId);
  }, [run]);

  useEffect(() => {
    const manager = managerRef.current;
    return () => manager.dispose();
  }, []);

  return {
    ...state,
    start,
    retry,
  };
}
