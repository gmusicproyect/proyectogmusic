import { useCallback, useEffect, useRef, useState } from "react";
import { loadLessonSessionOnce } from "../services/gmusic-api/lesson-session-load";
import type { LessonSessionStartResult } from "../services/gmusic-api/types";
import { DashboardRequestManager } from "./dashboard-request";

export type StartLessonSessionHookState =
  | { status: "idle" }
  | { status: "loading"; nodeId: string; requestGeneration: number }
  | { status: "success"; nodeId: string; requestGeneration: number; result: LessonSessionStartResult }
  | { status: "error"; nodeId: string; requestGeneration: number; message: string };

export function useStartLessonSession() {
  const [state, setState] = useState<StartLessonSessionHookState>({ status: "idle" });
  const managerRef = useRef(new DashboardRequestManager());
  const lastNodeIdRef = useRef<string | null>(null);
  const requestGenerationRef = useRef(0);

  const run = useCallback(async (nodeId: string): Promise<StartLessonSessionHookState> => {
    lastNodeIdRef.current = nodeId;
    const requestGeneration = ++requestGenerationRef.current;
    const manager = managerRef.current;
    const { generation, signal } = manager.begin();
    const loadingState: StartLessonSessionHookState = {
      status: "loading",
      nodeId,
      requestGeneration,
    };
    setState(loadingState);

    try {
      const outcome = await loadLessonSessionOnce(nodeId, signal);
      if (!manager.isCurrent(generation)) {
        setState((prev) => {
          if (prev.status === "loading" && prev.requestGeneration === requestGeneration) {
            return { status: "idle" };
          }
          return prev;
        });
        return { status: "idle" };
      }

      if (outcome.type === "aborted") {
        setState({ status: "idle" });
        return { status: "idle" };
      }

      if (outcome.type === "success") {
        const nextState: StartLessonSessionHookState = {
          status: "success",
          nodeId,
          requestGeneration,
          result: outcome.result,
        };
        setState(nextState);
        return nextState;
      }

      const errorState: StartLessonSessionHookState = {
        status: "error",
        nodeId,
        requestGeneration,
        message: outcome.message,
      };
      setState(errorState);
      return errorState;
    } catch (error) {
      if (!manager.isCurrent(generation)) {
        setState((prev) => {
          if (prev.status === "loading" && prev.requestGeneration === requestGeneration) {
            return { status: "idle" };
          }
          return prev;
        });
        return { status: "idle" };
      }

      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "No pudimos iniciar la lección. Comprueba la conexión e inténtalo de nuevo.";
      const errorState: StartLessonSessionHookState = {
        status: "error",
        nodeId,
        requestGeneration,
        message,
      };
      setState(errorState);
      return errorState;
    }
  }, []);

  const start = useCallback(
    (nodeId: string) => run(nodeId),
    [run]
  );

  const retry = useCallback(() => {
    const nodeId = lastNodeIdRef.current;
    if (nodeId) return run(nodeId);
    return Promise.resolve({ status: "idle" as const });
  }, [run]);

  const reset = useCallback(() => {
    managerRef.current.dispose();
    lastNodeIdRef.current = null;
    setState({ status: "idle" });
  }, []);

  useEffect(() => {
    const manager = managerRef.current;
    return () => manager.dispose();
  }, []);

  return {
    ...state,
    start,
    retry,
    reset,
  };
}
