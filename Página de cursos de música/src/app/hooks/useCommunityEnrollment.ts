import { useCallback, useEffect, useRef, useState } from "react";
import type { CommunityEnrollment } from "../utils/community-enrollment";
import { resolveCommunityEnrollment } from "../utils/community-enrollment";
import { loadCommunityEnrollmentOnce } from "../services/gmusic-api/community-enrollment-load";
import { DashboardRequestManager } from "./dashboard-request";
import { useDashboard } from "./useDashboard";

export type CommunityEnrollmentHookState =
  | { status: "loading" }
  | { status: "ready"; enrollment: CommunityEnrollment; fromApi: boolean };

/**
 * Enrollment activo para Comunidad desde API PostgreSQL.
 */
export function useCommunityEnrollment(): {
  enrollment: CommunityEnrollment;
  isLoading: boolean;
} {
  const dashboard = useDashboard();
  const [state, setState] = useState<CommunityEnrollmentHookState>({ status: "loading" });
  const managerRef = useRef(new DashboardRequestManager());

  const currentLessonTitle =
    dashboard.status === "success" ? dashboard.viewModel.currentNodeTitle : null;

  const load = useCallback(async () => {
    const manager = managerRef.current;
    const { generation, signal } = manager.begin();
    setState({ status: "loading" });

    const outcome = await loadCommunityEnrollmentOnce(signal, {
      currentLessonTitle,
    });

    if (!manager.isCurrent(generation)) return;

    if (outcome.type === "aborted") return;

    setState({
      status: "ready",
      enrollment: outcome.enrollment,
      fromApi: outcome.type === "success",
    });
  }, [currentLessonTitle]);

  useEffect(() => {
    void load();
    const manager = managerRef.current;
    return () => manager.dispose();
  }, [load]);

  const enrollment =
    state.status === "ready"
      ? state.enrollment
      : resolveCommunityEnrollment({ currentLessonTitle });

  return {
    enrollment,
    isLoading: state.status === "loading",
  };
}
