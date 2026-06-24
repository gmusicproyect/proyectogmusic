export { fetchDashboard } from "./dashboard";
export { fetchPath } from "./path";
export { createLessonSession } from "./lesson-session";
export { completeLessonSession } from "./complete-lesson-session";
export { loadLessonSessionOnce } from "./lesson-session-load";
export { GmusicApiError, apiGet, apiPost, isAbortError } from "./client";
export { getApiBaseUrl, isDashboardMockEnabled, isPathMockEnabled } from "./config";
export { getMockDashboardResponse } from "./mock-dashboard";
export { getMockPathResponse } from "./mock-path";
export {
  derivePhaseLabel,
  mapDashboardToViewModel,
  clampPercent,
  nonNegative,
  type DashboardPracticeView,
  type DashboardViewModel,
} from "./map-dashboard";
export {
  deriveLane,
  derivePathNodeTypeLabel,
  derivePathNodeDescription,
  mapPathToViewModel,
  findPathNodeById,
  countPathProgressFromViewModel,
  type PathViewModel,
} from "./map-path";
export type {
  DashboardResponse,
  DashboardNextPractice,
  DashboardModuleProgress,
  PathResponse,
  PathModuleResponse,
  PathNodeResponse,
  PathNodeStatus,
  PathContentKind,
  PublicExercise,
  LessonSessionResponse,
  LessonSessionStartResult,
  LessonSessionStartKind,
  ExerciseType,
} from "./types";
export type {
  LessonSessionLoadOutcome,
} from "./lesson-session-load";
