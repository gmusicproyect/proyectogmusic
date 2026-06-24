import { useCallback, useState } from "react";
import { LessonRunnerShell, type LessonRunnerSubmissionView } from "../lesson/LessonRunnerShell";
import type { CompleteLessonSessionResponse, LessonSessionResponse } from "../../../services/gmusic-api/types";
import { completeLessonSession } from "../../../services/gmusic-api/complete-lesson-session";
import { GmusicApiError } from "../../../services/gmusic-api/client";
import type { RunnerAttemptDraft } from "../lesson/lesson-runner-state";
import { mapRunnerAttemptsToCompleteRequest } from "./map-lesson-attempts";

export interface PathLessonRunnerProps {
  session: LessonSessionResponse;
  nodeTitle: string;
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
  onExit,
  onSessionCompleted,
}: PathLessonRunnerProps) {
  const [submission, setSubmission] = useState<LessonRunnerSubmissionView>({ status: "idle" });

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
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#080808" }}>
      <LessonRunnerShell
        session={session}
        nodeTitle={nodeTitle}
        onExit={onExit}
        onPracticeFinished={handlePracticeFinished}
        submission={submission}
      />
    </div>
  );
}
