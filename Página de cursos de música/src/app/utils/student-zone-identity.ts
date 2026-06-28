import type { PathBadgeData } from "../data/gmusic-path-types";

export const NEUTRAL_STUDENT_NAME = "Alumno Gmusic";

export function resolveStudentDisplayName(name: string | null | undefined): string {
  const trimmed = name?.trim();
  if (!trimmed || trimmed === "…") {
    return NEUTRAL_STUDENT_NAME;
  }

  return trimmed;
}

export function deriveStudentInitials(name: string): string {
  const displayName = resolveStudentDisplayName(name);
  if (displayName === NEUTRAL_STUDENT_NAME) {
    return "AG";
  }

  const parts = displayName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}

export function deriveWelcomeHeaderSubtitle(
  phaseLabel: string | null | undefined,
  isLoading: boolean
): string {
  if (isLoading) {
    return "Conectando con tu estudio";
  }

  const trimmed = phaseLabel?.trim();
  return trimmed && trimmed !== "…" ? trimmed : "Tu progreso musical";
}

export type StreakChipEmphasis = "none" | "active" | "recover";

export interface StreakChipCopy {
  label: string;
  emphasis: StreakChipEmphasis;
}

export function deriveStreakChipCopy(
  streakDays: number,
  activeToday: boolean
): StreakChipCopy {
  const days = Number.isFinite(streakDays) ? Math.max(0, Math.floor(streakDays)) : 0;

  if (days === 0 && !activeToday) {
    return { label: "Empieza tu racha hoy", emphasis: "none" };
  }

  if (days === 0 && activeToday) {
    return { label: "Hoy puede comenzar tu constancia", emphasis: "active" };
  }

  if (days > 0 && activeToday) {
    return { label: `Racha: ${days} ${days === 1 ? "día" : "días"}`, emphasis: "active" };
  }

  return {
    label: `Retoma hoy · ${days} ${days === 1 ? "día" : "días"}`,
    emphasis: "recover",
  };
}

export function deriveStudentHeroEyebrow(
  phaseLabel: string | null | undefined,
  isLoading: boolean
): string {
  if (isLoading) {
    return "Tu academia · Guitarra";
  }

  const trimmed = phaseLabel?.trim();
  if (trimmed && trimmed !== "…") {
    return `Guitarra · ${trimmed}`;
  }

  return "Tu academia · Guitarra";
}

export interface StudentHeroSituationInput {
  isLoading: boolean;
  pathComplete: boolean;
  nextPracticeTitle?: string | null;
  currentNodeTitle?: string | null;
}

export function deriveStudentHeroSituationLine(input: StudentHeroSituationInput): string {
  if (input.isLoading) {
    return "Conectando con tu estudio…";
  }

  if (input.pathComplete) {
    return "Completaste todos los nodos disponibles en tu camino. Revisa tu progreso cuando quieras.";
  }

  const nextTitle = input.nextPracticeTitle?.trim();
  if (nextTitle && nextTitle !== "…") {
    return `Tu siguiente paso: «${nextTitle}».`;
  }

  const nodeTitle = input.currentNodeTitle?.trim();
  if (nodeTitle && nodeTitle !== "—" && nodeTitle !== "…") {
    return `Estás en «${nodeTitle}».`;
  }

  return "Tu sesión de práctica te espera en Mi Camino.";
}

export function derivePathHeaderIdentity(
  badge: PathBadgeData | null | undefined,
  isLoading: boolean,
  studentName?: string | null
): { userName: string; userSubtitle: string } {
  const userName = resolveStudentDisplayName(studentName);

  if (isLoading || !badge) {
    return {
      userName,
      userSubtitle: "Tu camino musical",
    };
  }

  const instrument = badge.instrument.trim();
  const level = badge.level.trim();
  const hasBadge = instrument !== "…" && level !== "…";

  return {
    userName,
    userSubtitle: hasBadge ? `${instrument} · ${level}` : "Tu camino musical",
  };
}
