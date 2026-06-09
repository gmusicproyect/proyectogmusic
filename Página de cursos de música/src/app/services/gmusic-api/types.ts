export interface DashboardUser {
  id: string;
  name: string;
  timezone: string;
  levelLabel: string;
  pathLabel: string;
}

export interface DashboardStreak {
  currentDays: number;
  activeToday: boolean;
}

export interface DashboardXp {
  total: number;
  earnedThisWeek: number;
}

export interface DashboardModuleProgress {
  moduleId: string;
  moduleTitle: string;
  percentCompleted: number;
  currentNodeTitle: string;
  completedNodes: number;
  totalNodes: number;
}

export interface DashboardNextPractice {
  nodeId: string;
  title: string;
  typeLabel: string;
  description: string;
}

export interface DashboardResponse {
  user: DashboardUser;
  streak: DashboardStreak;
  xp: DashboardXp;
  moduleProgress: DashboardModuleProgress;
  nextPractice: DashboardNextPractice | null;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export type PathNodeStatus = "locked" | "available" | "active" | "completed";
export type PathContentKind = "video" | "audio_lab" | "reward";

export interface PathBadgeResponse {
  instrument: string;
  month: string;
  level: string;
}

export interface PathNodeResponse {
  id: string;
  title: string;
  order: number;
  status: PathNodeStatus;
  duration: string;
  contentKind: PathContentKind;
}

export interface PathModuleResponse {
  id: string;
  index: number;
  title: string;
  focus: string;
  nodesCompleted: number;
  nodesTotal: number;
  nodes: PathNodeResponse[];
}

export interface PathCourseResponse {
  id: string;
  title: string;
  slug: string;
  badge: PathBadgeResponse;
}

export interface PathResponse {
  course: PathCourseResponse;
  modules: PathModuleResponse[];
  activeNodeId: string | null;
}

export type ExerciseType =
  | "IDENTIFY_NOTE"
  | "CHORD_SHAPE"
  | "EAR_TRAINING"
  | "RHYTHM_TAP";

/** Ejercicio público devuelto por POST /lesson-sessions (sin secureAnswer). */
export interface PublicExercise {
  id: string;
  type: ExerciseType;
  difficulty: number;
  instruction: string;
  /** Payload sanitizado del servidor; estructura opaca en el cliente. */
  contentPayload: unknown;
}

export interface LessonSessionResponse {
  sessionId: string;
  nodeId: string;
  status: "STARTED";
  startedAt: string;
  expiresAt: string;
  exercises: PublicExercise[];
}

export type LessonSessionStartKind = "created" | "reused";

export interface LessonSessionStartResult {
  session: LessonSessionResponse;
  kind: LessonSessionStartKind;
}

export type AccessReason = "ACTIVE_SUBSCRIPTION" | "NO_ACTIVE_SUBSCRIPTION";

export interface AccessUser {
  id: string;
  name: string;
  email: string;
}

export interface AccessInfo {
  canAccessStudentZone: boolean;
  reason: AccessReason;
}

export interface AccessSubscription {
  status: "ACTIVE";
  planId: string;
  endsAt: string | null;
}

export interface AccessResponse {
  user: AccessUser;
  access: AccessInfo;
  subscription: AccessSubscription | null;
}
