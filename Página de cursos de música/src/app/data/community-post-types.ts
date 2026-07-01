import type { CommunityLevel } from "./community-level";
import { COMMUNITY_LEVEL_LABELS } from "./community-level";

/** Tipos de publicación MVP (sin lanzamiento libre ni colaboración en feed principal). */
export type CommunityPostType =
  | "question"
  | "progress"
  | "music"
  | "feedback"
  | "collaboration"
  | "admin_featured";

export type ExternalLinkProvider =
  | "drive"
  | "youtube"
  | "soundcloud"
  | "spotify"
  | "facebook"
  | "other";

export type CommunityFeedFilter = "all" | "questions" | "progress" | "music";

export type FeedbackCategory =
  | "ritmo"
  | "acordes"
  | "afinacion"
  | "sonido"
  | "interpretacion"
  | "mezcla";

/** Estructura futura para comentarios de feedback guiado. */
export interface CommunityGuidedFeedback {
  best: string;
  toImprove: string;
  practicalTip: string;
  categories?: FeedbackCategory[];
}

export const COMMUNITY_POST_TYPE_LABELS: Record<CommunityPostType, string> = {
  question: "Pregunta",
  progress: "Progreso",
  music: "Música",
  feedback: "Feedback",
  collaboration: "Colaboración",
  admin_featured: "Destacado Gmusic",
};

export const COMMUNITY_FEED_FILTERS: readonly {
  id: CommunityFeedFilter;
  label: string;
}[] = [
  { id: "all", label: "Todo" },
  { id: "questions", label: "Preguntas" },
  { id: "progress", label: "Progreso" },
  { id: "music", label: "Música" },
] as const;

/** Tipos visibles en el feed principal del alumno. */
export const COMMUNITY_FEED_VISIBLE_POST_TYPES: readonly CommunityPostType[] = [
  "question",
  "progress",
  "music",
  "feedback",
] as const;

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  ritmo: "Ritmo",
  acordes: "Acordes",
  afinacion: "Afinación",
  sonido: "Sonido",
  interpretacion: "Interpretación",
  mezcla: "Mezcla",
};

export interface CommunityPost {
  id: string;
  author: string;
  authorImage: string;
  instrument: string;
  timeAgo: string;
  content: string;
  postType: CommunityPostType;
  level: CommunityLevel;
  lessonNumber?: number;
  topicLabel?: string;
  externalUrl?: string;
  externalProvider?: ExternalLinkProvider;
  feedbackCategories?: FeedbackCategory[];
  /** Entrega vinculada al reto semanal. */
  isWeeklyChallengeSubmission?: boolean;
  likes: number;
  comments: number;
  tags?: string[];
  isLiked?: boolean;
}

export function communityPostLevelLabel(post: CommunityPost): string {
  return COMMUNITY_LEVEL_LABELS[post.level];
}

export function filterCommunityPostsByLevel(
  posts: readonly CommunityPost[],
  level: CommunityLevel
): CommunityPost[] {
  return posts.filter((post) => post.level === level);
}

const FEED_POST_TYPE_PRIORITY: Partial<Record<CommunityPostType, number>> = {
  question: 0,
  progress: 1,
  music: 2,
  feedback: 3,
};

function sortCommunityFeedPosts(posts: CommunityPost[]): CommunityPost[] {
  return [...posts].sort((a, b) => {
    const priorityA = FEED_POST_TYPE_PRIORITY[a.postType] ?? 99;
    const priorityB = FEED_POST_TYPE_PRIORITY[b.postType] ?? 99;
    return priorityA - priorityB;
  });
}

export function communityPostActionLabel(
  postType: CommunityPostType
): string | null {
  switch (postType) {
    case "question":
      return "Responder";
    case "progress":
      return "Dar feedback";
    case "music":
      return "Comentar";
    case "feedback":
      return "Dar feedback";
    default:
      return null;
  }
}

export function filterCommunityPostsForFeed(
  posts: readonly CommunityPost[],
  level: CommunityLevel,
  feedFilter: CommunityFeedFilter
): CommunityPost[] {
  const byLevel = filterCommunityPostsByLevel(posts, level).filter((post) =>
    (COMMUNITY_FEED_VISIBLE_POST_TYPES as readonly string[]).includes(post.postType)
  );

  switch (feedFilter) {
    case "all":
      return sortCommunityFeedPosts(byLevel);
    case "questions":
      return byLevel.filter((post) => post.postType === "question");
    case "progress":
      return byLevel.filter(
        (post) => post.postType === "progress" || post.postType === "feedback"
      );
    case "music":
      return byLevel.filter((post) => post.postType === "music");
    default:
      return byLevel;
  }
}

export function shouldShowCuratedInFeed(
  feedFilter: CommunityFeedFilter
): "top" | "bottom" | false {
  if (feedFilter === "all") return "bottom";
  if (feedFilter === "music") return "top";
  return false;
}
