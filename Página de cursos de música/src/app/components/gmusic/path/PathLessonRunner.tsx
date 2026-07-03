import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { VideoPlayerLesson } from "../../dashboard/VideoPlayerLesson";
import { Button } from "../../ui/button";
import { LessonRunnerShell, type LessonRunnerSubmissionView } from "../lesson/LessonRunnerShell";
import type { CompleteLessonSessionResponse, LessonSessionResponse } from "../../../services/gmusic-api/types";
import { completeLessonSession } from "../../../services/gmusic-api/complete-lesson-session";
import { GmusicApiError } from "../../../services/gmusic-api/client";
import type { RunnerAttemptDraft } from "../lesson/lesson-runner-state";
import { mapRunnerAttemptsToCompleteRequest } from "./map-lesson-attempts";
import { SubscriberLessonStepper, type SubscriberLessonPhase } from "./SubscriberLessonStepper";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock";
import { isLessonVideoUrl, toYoutubeEmbedUrl } from "../../../utils/youtube-embed";
import { GM_BG, GM_BORDER, GM_GOLD, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export interface PathLessonRunnerProps {
  session: LessonSessionResponse;
  nodeTitle: string;
  videoUrl?: string | null;
  nodeDuration?: string;
  onExit: () => void;
  onSessionCompleted?: () => void;
}

function formatCompleteError(error: unknown): string {
  if (error instanceof GmusicApiError) return error.message;
  return "No pudimos guardar tu práctica. Intenta de nuevo.";
}

function mapCompleteResponseToSummary(result: CompleteLessonSessionResponse) {
  return {
    points: result.xpEarned,
    streakDays: result.currentStreak,
    precisionPercent: Math.round(result.accuracy * 100),
    stepCompleted: result.nodeCompleted,
  };
}

function resolveInitialPhase(hasVideo: boolean): SubscriberLessonPhase {
  return hasVideo ? "video" : "practice";
}

export function PathLessonRunner({
  session,
  nodeTitle,
  videoUrl,
  nodeDuration,
  onExit,
  onSessionCompleted,
}: PathLessonRunnerProps) {
  const hasVideo = isLessonVideoUrl(videoUrl);
  const embedUrl = useMemo(
    () => (hasVideo && videoUrl ? toYoutubeEmbedUrl(videoUrl) : null),
    [hasVideo, videoUrl]
  );

  const [phase, setPhase] = useState<SubscriberLessonPhase>(() => resolveInitialPhase(hasVideo));
  const [videoComplete, setVideoComplete] = useState(false);
  const [submission, setSubmission] = useState<LessonRunnerSubmissionView>({ status: "idle" });

  useBodyScrollLock(true);

  useEffect(() => {
    if (submission.status === "success") {
      setPhase("complete");
    }
  }, [submission.status]);

  const handlePracticeFinished = useCallback(
    async (attempts: RunnerAttemptDraft[]) => {
      setSubmission({ status: "loading" });
      try {
        const result = await completeLessonSession(
          session.sessionId,
          mapRunnerAttemptsToCompleteRequest(attempts)
        );
        setSubmission({ status: "success", summary: mapCompleteResponseToSummary(result) });
        onSessionCompleted?.();
      } catch (error) {
        setSubmission({ status: "error", message: formatCompleteError(error) });
      }
    },
    [session.sessionId, onSessionCompleted]
  );

  const canContinueToPractice = videoComplete;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{ background: GM_BG, color: GM_TEXT }}
      role="dialog"
      aria-modal="true"
      aria-label={`Lección: ${nodeTitle}`}
    >
      <header
        className="sticky top-0 z-10 border-b px-4 py-4 md:px-6"
        style={{ background: GM_SURFACE, borderColor: GM_BORDER }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p
                className="mb-1 text-[10px] font-medium uppercase tracking-[0.2em]"
                style={{ color: "rgba(212, 175, 55, 0.65)" }}
              >
                Mi Camino
              </p>
              <h1
                className="truncate text-xl font-medium leading-snug md:text-2xl"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {nodeTitle}
              </h1>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onExit}
              className="min-h-[44px] shrink-0"
              aria-label="Volver al camino"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
          <SubscriberLessonStepper phase={phase} hasVideo={hasVideo} />
        </div>
      </header>

      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {phase === "video" && embedUrl ? (
            <>
              <VideoPlayerLesson
                title={nodeTitle}
                subtitle="Mira la lección antes de practicar"
                duration={nodeDuration ?? "Lección"}
                lessonLabel="Video de la clase"
                videoUrl={embedUrl}
                onPlaybackComplete={() => setVideoComplete(true)}
              />
              <Button
                type="button"
                disabled={!canContinueToPractice}
                onClick={() => setPhase("practice")}
                className="min-h-[48px] w-full font-medium tracking-wide"
                style={{ background: GM_GOLD, color: "#0A0A0A" }}
              >
                Continuar al ejercicio
              </Button>
              <p className="text-center text-xs" style={{ color: GM_TEXT_SEC }}>
                {canContinueToPractice
                  ? "Listo para practicar lo visto en el video."
                  : "Marca el video como visto para continuar."}
              </p>
            </>
          ) : (
            <LessonRunnerShell
              key={session.sessionId}
              session={session}
              nodeTitle={nodeTitle}
              onExit={onExit}
              onPracticeFinished={handlePracticeFinished}
              submission={submission}
              variant="embedded"
            />
          )}
        </div>
      </div>
    </div>
  );
}
