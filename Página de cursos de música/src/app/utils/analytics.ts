import posthog from "posthog-js";
import type { TemperamentQuizResult } from "../data/temperament-quiz";

const enabled = Boolean(import.meta.env?.VITE_POSTHOG_KEY);

function capturePagePath(pathname: string): string {
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
    return pathname;
  }
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export const analytics = {
  /** SPA: registrar vista cuando cambia currentPage / pathname público. */
  pageViewed: (pathname: string, pageId?: string) => {
    if (!enabled) return;
    posthog.capture("$pageview", {
      $current_url: capturePagePath(pathname),
      ...(pageId ? { gmusic_page: pageId } : {}),
    });
  },

  demoCtaClicked: () =>
    enabled && posthog.capture("demo_cta_clicked"),

  semestralCtaClicked: () =>
    enabled && posthog.capture("semestral_cta_clicked"),

  demoLessonCompleted: (lessonId: number, lessonTitle: string) =>
    enabled &&
    posthog.capture("demo_lesson_completed", {
      lesson_id: lessonId,
      lesson_title: lessonTitle,
    }),

  demoCompleted: () =>
    enabled && posthog.capture("demo_completed"),

  gateViewed: (locked: boolean) =>
    enabled && posthog.capture("gate_viewed", { locked }),

  planSelected: (tier: string, period: string, priceCLP: number, planId: string) =>
    enabled &&
    posthog.capture("plan_selected", {
      tier,
      period,
      price_clp: priceCLP,
      plan_id: planId,
    }),

  registroViewed: (planId: string) =>
    enabled && posthog.capture("registro_viewed", { plan_id: planId }),

  whatsappCtaClicked: (intent: "inscripcion" | "dudas", planId: string) =>
    enabled &&
    posthog.capture("whatsapp_cta_clicked", { intent, plan_id: planId }),

  temperamentQuizCompleted: (result: TemperamentQuizResult) =>
    enabled &&
    posthog.capture("temperament_quiz_completed", {
      calculated_temperament: result.calculated_temperament,
      is_tie: result.is_tie,
      total_duration_ms: result.total_duration_ms,
      total_answer_changes: result.total_answer_changes,
      scores: result.scores,
      session_id: result.session_id,
    }),

  temperamentQuizSkipped: () =>
    enabled && posthog.capture("temperament_quiz_skipped"),

  temperamentQuizSyncFailed: (sessionId: string) =>
    enabled && posthog.capture("temperament_quiz_sync_failed", { session_id: sessionId }),

  communityViewed: (level: string, programLabel: string) =>
    enabled &&
    posthog.capture("community_viewed", {
      community_level: level,
      program_label: programLabel,
    }),

  communityLevelChanged: (fromLevel: string, toLevel: string, isAssignedLevel: boolean) =>
    enabled &&
    posthog.capture("community_level_changed", {
      from_level: fromLevel,
      to_level: toLevel,
      is_assigned_level: isAssignedLevel,
    }),

  postCreated: (postType: string, level: string) =>
    enabled && posthog.capture("post_created", { post_type: postType, community_level: level }),

  externalLinkClicked: (provider: string, postType: string) =>
    enabled && posthog.capture("external_link_clicked", { provider, post_type: postType }),

  challengeViewed: (level: string, lessonNumber: number | null) =>
    enabled &&
    posthog.capture("challenge_viewed", {
      community_level: level,
      lesson_number: lessonNumber,
    }),

  challengeSubmitted: (level: string, lessonNumber: number | null) =>
    enabled &&
    posthog.capture("challenge_submitted", {
      community_level: level,
      lesson_number: lessonNumber,
    }),

  commentCreated: (postId: string) =>
    enabled && posthog.capture("comment_created", { post_id: postId }),

  feedbackGiven: (category: string) =>
    enabled && posthog.capture("feedback_given", { feedback_category: category }),
};
