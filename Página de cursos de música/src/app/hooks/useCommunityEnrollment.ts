import { useMemo } from "react";
import type { CommunityEnrollment } from "../utils/community-enrollment";
import { resolveCommunityEnrollment } from "../utils/community-enrollment";
import { useDashboard } from "./useDashboard";

/**
 * Enrollment activo para Comunidad.
 * Track A: mock + override local hasta que API exponga programLabel de inscripción.
 */
export function useCommunityEnrollment(): {
  enrollment: CommunityEnrollment;
  isLoading: boolean;
} {
  const dashboard = useDashboard();

  const enrollment = useMemo(() => {
    const viewModel = dashboard.status === "success" ? dashboard.viewModel : null;
    return resolveCommunityEnrollment({
      // TODO(C2+): enrollmentProgramLabel desde API cuando exista campo de inscripción académica.
      currentLessonTitle: viewModel?.currentNodeTitle ?? null,
    });
  }, [dashboard.status, dashboard.status === "success" ? dashboard.viewModel?.currentNodeTitle : null]);

  return {
    enrollment,
    isLoading: dashboard.status === "loading",
  };
}
