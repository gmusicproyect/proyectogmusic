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

export const MOCK_ADMIN_CURATED: CommunityAdminCurated[] = [
  {
    id: "curated-song-basic",
    kind: "song_of_month",
    level: "BASIC",
    title: "Canción del mes — nivel Básico",
    description: "Referencia curada por Gmusic para escuchar, aprender y practicar.",
    externalUrl: "https://www.youtube.com/watch?v=example-basic",
    externalProvider: "youtube",
  },
  {
    id: "curated-song-advanced",
    kind: "song_of_month",
    level: "ADVANCED",
    title: "Canción del mes",
    description: "Apoyemos este lanzamiento — selección Gmusic.",
    externalUrl: "https://open.spotify.com/track/example",
    externalProvider: "spotify",
  },
];

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
