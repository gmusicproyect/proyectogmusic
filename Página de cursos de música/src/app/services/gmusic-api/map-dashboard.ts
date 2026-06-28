import type { DashboardResponse } from "./types";

export interface DashboardPracticeView {
  title: string;
  typeLabel: string;
  description: string;
}

export interface DashboardWeeklyChestView {
  exercisesUntilChest: number | null;
  xpReward: number;
  isReady: boolean;
}

export const WEEKLY_XP_GOAL = 200;
export const WEEKLY_CHEST_XP_REWARD = 50;

export interface DashboardViewModel {
  userName: string;
  streakLabel: string;
  streakDays: number;
  streakActiveToday: boolean;
  xpTotal: number;
  weeklyGain: number;
  consistencyStatus: string;
  progressPercentLabel: string;
  progressPercent: number;
  currentNodeTitle: string;
  phaseLabel: string;
  nextPractice: DashboardPracticeView | null;
  pathComplete: boolean;
  weeklyChest: DashboardWeeklyChestView | null;
}

export function nonNegative(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

export function deriveWeeklyChest(weeklyGain: number): DashboardWeeklyChestView {
  const gain = nonNegative(weeklyGain);
  const remaining = Math.max(0, WEEKLY_XP_GOAL - gain);

  return {
    exercisesUntilChest: remaining > 0 ? remaining : null,
    xpReward: WEEKLY_CHEST_XP_REWARD,
    isReady: remaining === 0,
  };
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function derivePhaseLabel(levelLabel: string, pathLabel: string): string {
  const monthMatch = pathLabel.match(/Mes (\d+)/);
  const month = monthMatch?.[1] ?? "1";
  return `${levelLabel} · Mes ${month}`;
}

export function mapDashboardToViewModel(response: DashboardResponse): DashboardViewModel {
  const progressPercent = clampPercent(response.moduleProgress.percentCompleted);
  const streakDays = nonNegative(response.streak.currentDays);
  const xpTotal = nonNegative(response.xp.total);
  const weeklyGain = nonNegative(response.xp.earnedThisWeek);

  return {
    userName: response.user.name,
    streakLabel: `${streakDays} días`,
    streakDays,
    streakActiveToday: response.streak.activeToday,
    xpTotal,
    weeklyGain,
    consistencyStatus: response.streak.activeToday ? "En ritmo" : "Retoma hoy",
    progressPercentLabel: `${progressPercent}%`,
    progressPercent,
    currentNodeTitle: response.moduleProgress.currentNodeTitle,
    phaseLabel: derivePhaseLabel(response.user.levelLabel, response.user.pathLabel),
    nextPractice: response.nextPractice
      ? {
          title: response.nextPractice.title,
          typeLabel: response.nextPractice.typeLabel,
          description: response.nextPractice.description,
        }
      : null,
    pathComplete: response.nextPractice === null,
    weeklyChest: deriveWeeklyChest(weeklyGain),
  };
}
