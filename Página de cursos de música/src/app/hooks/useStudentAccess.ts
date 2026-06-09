import { useCallback, useEffect, useRef, useState } from "react";
import { loadAccessOnce } from "../services/gmusic-api/access-load";
import { DashboardRequestManager } from "./dashboard-request";
import {
  applyAccessOutcome,
  type StudentAccessHookState,
} from "./student-access-request";

export type { StudentAccessHookState } from "./student-access-request";

export function useStudentAccess() {
  const [state, setState] = useState<StudentAccessHookState>({ status: "loading" });
  const managerRef = useRef(new DashboardRequestManager());

  const load = useCallback(async () => {
    const manager = managerRef.current;
    const { generation, signal } = manager.begin();
    setState({ status: "loading" });

    const outcome = await loadAccessOnce(signal);
    const nextState = applyAccessOutcome(generation, manager, outcome);
    if (nextState) setState(nextState);
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
