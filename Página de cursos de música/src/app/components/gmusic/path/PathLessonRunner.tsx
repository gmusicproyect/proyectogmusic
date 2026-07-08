import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../../ui/button";
import { LessonPrepareScreen } from "../lesson/LessonPrepareScreen";
import { LessonRunnerShell, type LessonRunnerSubmissionView } from "../lesson/LessonRunnerShell";
import type { CompleteLessonSessionResponse, LessonSessionResponse } from "../../../services/gmusic-api/types";
import { completeLessonSession } from "../../../services/gmusic-api/complete-lesson-session";
import { GmusicApiError } from "../../../services/gmusic-api/client";
import type { RunnerAttemptDraft } from "../lesson/lesson-runner-state";
import { mapRunnerAttemptsToCompleteRequest } from "./map-lesson-attempts";
import { SubscriberLessonStepper, type SubscriberLessonPhase } from "./SubscriberLessonStepper";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock";
import { isLessonVideoUrl } from "../../../utils/youtube-embed";
import type { PathNodeData } from "../../../data/gmusic-path-types";
import { GM_BG, GM_BORDER, GM_GOLD, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export interface PathLessonRunnerProps {
  session: LessonSessionResponse;
  nodeTitle: string;
  lessonNode: PathNodeData;
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

export function PathLessonRunner({
  session,
  nodeTitle,
  lessonNode,
  videoUrl,
  nodeDuration,
  onExit,
  onSessionCompleted,
}: PathLessonRunnerProps) {
  const hasVideo = isLessonVideoUrl(videoUrl ?? lessonNode.videoUrl);
  const prepareNode = useMemo(
    () => ({
      ...lessonNode,
      duration: nodeDuration ?? lessonNode.duration,
      videoUrl: videoUrl ?? lessonNode.videoUrl ?? null,
    }),
    [lessonNode, nodeDuration, videoUrl]
  );

  const [phase, setPhase] = useState<SubscriberLessonPhase>("video");
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
          {phase === "video" ? (
            <LessonPrepareScreen
              node={prepareNode}
              onContinueToPractice={() => setPhase("practice")}
            />
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
