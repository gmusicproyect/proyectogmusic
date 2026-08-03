import type { CommunityLevel } from "./community-level";

export interface CommunityWeeklyChallenge {
  id: string;
  instrument: string;
  level: CommunityLevel;
  lessonNumber: number;
  lessonTopic: string;
  title: string;
  description: string;
  bpm: number;
}

export interface CommunityPeer {
  id: string;
  name: string;
  level: CommunityLevel;
  activity: string;
}

export type CommunityCuratedKind = "song_of_month" | "album_of_week" | "support_launch";

export interface CommunityAdminCurated {
  id: string;
  kind: CommunityCuratedKind;
  level: CommunityLevel;
  title: string;
  description: string;
  externalUrl: string;
  externalProvider: "youtube" | "spotify" | "soundcloud";
}

export const COMMUNITY_CONDUCT_RULES = [
  "Respeta el nivel de cada alumno.",
  "Da feedback útil, no burlas.",
  "Si corriges, explica cómo mejorar.",
  "No spam ni autopromoción excesiva.",
  "Apoya antes de pedir apoyo.",
] as const;

/** Progreso futuro hacia mentoría en vivo (solo UI mock). */
export interface CommunityMentorshipProgress {
  weeklyChallengesCompleted: number;
  weeklyChallengesTarget: number;
  progressSubmissions: number;
  progressSubmissionsTarget: number;
  helpfulFeedbacksGiven: number;
  helpfulFeedbacksTarget: number;
}

export const DEFAULT_MENTORSHIP_PROGRESS: CommunityMentorshipProgress = {
  weeklyChallengesCompleted: 0,
  weeklyChallengesTarget: 4,
  progressSubmissions: 0,
  progressSubmissionsTarget: 3,
  helpfulFeedbacksGiven: 0,
  helpfulFeedbacksTarget: 5,
};

export const MOCK_COMMUNITY_PEERS: CommunityPeer[] = [];

/**
 * Curado admin vacío en producción (D-F6-ANTI-DEMO / B+ 2026-08-02).
 * Tipos y panel listos para feed real; cero «Canción del mes» ni URLs example.
 */
export const MOCK_ADMIN_CURATED: CommunityAdminCurated[] = [];

export function resolveWeeklyChallenge(_input: {
  instrument: string;
  level: CommunityLevel;
  lessonNumber: number | null;
}): CommunityWeeklyChallenge | null {
  /** Reto semanal desactivado en MVP — cada alumno avanza a su ritmo. */
  return null;
}

export function peersForLevel(level: CommunityLevel): CommunityPeer[] {
  return MOCK_COMMUNITY_PEERS.filter((peer) => peer.level === level);
}

export function curatedForLevel(level: CommunityLevel): CommunityAdminCurated[] {
  return MOCK_ADMIN_CURATED.filter((item) => item.level === level);
}
