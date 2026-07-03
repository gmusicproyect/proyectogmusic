import { useEffect, useId, useMemo, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "../../ui/button";
import { GmusicApiError } from "../../../services/gmusic-api/client";
import type { LessonSessionResponse } from "../../../services/gmusic-api/types";
import { abbreviateSessionId } from "../path/path-lesson-start";
import {
  GM_BG,
  GM_BORDER,
  GM_GOLD,
  GM_GOLD_MATT,
  GM_SURFACE,
  GM_TEXT,
  GM_TEXT_SEC,
} from "../tokens";
import { ExerciseMediaBlock } from "./ExerciseMediaBlock";
import { LessonExerciseStepper } from "./LessonExerciseStepper";
import { MultipleChoiceExercise } from "./MultipleChoiceExercise";
import { RhythmTapExercise } from "./RhythmTapExercise";
import { prepareLessonRunner } from "./prepare-lesson-runner";
import type { ParsedExerciseView } from "./lesson-runner-types";
import { UnsupportedExercisePanel } from "./UnsupportedExercisePanel";
import { useLessonRunner } from "./useLessonRunner";
import type { LessonRunnerStatus } from "./lesson-runner-state";
import type { RunnerAttemptDraft } from "./lesson-runner-state";

export type LessonRunnerCompletionSummary = {
  points: number;
  streakDays: number;
  precisionPercent: number;
  stepCompleted: boolean;
};

export type LessonRunnerSubmissionView =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; summary: LessonRunnerCompletionSummary }
  | { status: "error"; message: string };

export interface LessonRunnerShellProps {
  session: LessonSessionResponse;
  nodeTitle: string;
  onExit: () => void;
  onPracticeFinished?: (attempts: RunnerAttemptDraft[]) => void;
  submission?: LessonRunnerSubmissionView;
  /** embedded = sin header técnico; usado dentro de PathLessonRunner suscriptor */
  variant?: "default" | "embedded";
}

type ShellPreparation =
  | { kind: "supported"; exercises: ParsedExerciseView[] }
  | { kind: "incompatible"; exerciseId: string; reason: string }
  | { kind: "unsafe"; message: string };

export function getLessonRunnerResetKey(sessionId: string): string {
  return sessionId;
}

export function isLessonRunnerInteractionDisabled(status: LessonRunnerStatus): boolean {
  return status === "expired";
}

export function canAdvanceLessonRunner(
  status: LessonRunnerStatus,
  selectedOptionId: string | null
): boolean {
  return status === "ready" && selectedOptionId !== null;
}

function prepareShellSession(session: LessonSessionResponse): ShellPreparation {
  try {
    return prepareLessonRunner(session);
  } catch (error) {
    if (error instanceof GmusicApiError && error.code === "UNSAFE_API_RESPONSE") {
      return { kind: "unsafe", message: error.message };
    }
    throw error;
  }
}

function useEscapeExit(onExit: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onExit();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onExit]);
}

function LessonRunnerShellFrame({
  nodeTitle,
  sessionIdLabel,
  onExit,
  children,
  showSessionId = true,
}: {
  nodeTitle: string;
  sessionIdLabel: string;
  onExit: () => void;
  children: ReactNode;
  showSessionId?: boolean;
}) {
  const titleId = useId();

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: GM_BG, color: GM_TEXT }}
      role="main"
      aria-labelledby={titleId}
    >
      <header
        className="sticky top-0 z-10 border-b px-4 py-4 md:px-6"
        style={{ background: GM_SURFACE, borderColor: GM_BORDER }}
      >
        <div className="mx-auto flex max-w-3xl items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className="text-[10px] font-medium tracking-[0.2em] uppercase mb-1"
              style={{ color: "rgba(212, 175, 55, 0.65)" }}
            >
              Práctica guiada
            </p>
            <h1
              id={titleId}
              className="text-xl md:text-2xl font-medium leading-snug truncate"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: GM_TEXT }}
            >
              {nodeTitle}
            </h1>
            {showSessionId ? (
              <p className="text-xs font-mono tracking-wide mt-1" style={{ color: GM_TEXT_SEC }}>
                Sesión {sessionIdLabel}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onExit}
            className="shrink-0 min-h-[44px]"
            aria-label="Volver al camino"
          >
            <X className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </div>
    </div>
  );
}

function LessonRunnerEmptyState({ onExit }: { onExit: () => void }) {
  return (
    <div
      className="rounded-lg border p-8 text-center"
      style={{ background: GM_SURFACE, borderColor: GM_BORDER }}
    >
      <h2 className="text-lg font-medium mb-2" style={{ color: GM_TEXT }}>
        Sin ejercicios en esta sesión
      </h2>
      <p className="text-sm mb-6" style={{ color: GM_TEXT_SEC }}>
        No hay ejercicios disponibles para practicar en este momento.
      </p>
      <Button
        type="button"
        onClick={onExit}
        className="w-full font-medium min-h-[44px] tracking-wide"
        style={{ background: GM_GOLD, color: "#0A0A0A" }}
      >
        Volver al camino
      </Button>
    </div>
  );
}

function LessonRunnerExpiredBanner() {
  return (
    <div
      role="status"
      className="rounded-lg border px-4 py-3 mb-6 text-sm"
      style={{
        borderColor: GM_GOLD_MATT,
        background: "rgba(212, 175, 55, 0.08)",
        color: GM_TEXT,
      }}
    >
      Sesión expirada. Puedes revisar el camino e iniciar una nueva práctica.
    </div>
  );
}

function LessonRunnerFinishedState({
  responseCount,
  submission = { status: "idle" },
  onExit,
}: {
  responseCount: number;
  submission?: LessonRunnerSubmissionView;
  onExit: () => void;
}) {
  if (submission.status === "loading") {
    return (
      <div
        className="rounded-lg border p-8 text-center"
        style={{ background: GM_SURFACE, borderColor: GM_BORDER }}
      >
        <h2 className="text-xl font-medium mb-2" style={{ color: GM_GOLD }}>
          Guardando tu práctica…
        </h2>
        <p className="text-sm" style={{ color: GM_TEXT_SEC }}>
          Estamos registrando tus respuestas y sumando XP.
        </p>
      </div>
    );
  }

  if (submission.status === "error") {
    return (
      <div
        className="rounded-lg border p-8 text-center"
        style={{ background: GM_SURFACE, borderColor: GM_BORDER }}
      >
        <h2 className="text-xl font-medium mb-2" style={{ color: GM_GOLD }}>
          No se pudo guardar
        </h2>
        <p className="text-sm mb-6" style={{ color: GM_TEXT_SEC }}>
          {submission.message}
        </p>
        <Button
          type="button"
          onClick={onExit}
          className="w-full font-medium min-h-[44px] tracking-wide"
          style={{ background: GM_GOLD, color: "#0A0A0A" }}
        >
          Volver al camino
        </Button>
      </div>
    );
  }

  if (submission.status === "success") {
    const { summary } = submission;
    return (
      <div
        className="rounded-lg border p-8 text-center"
        style={{ background: GM_SURFACE, borderColor: GM_BORDER }}
      >
        <h2 className="text-2xl font-medium mb-2" style={{ color: GM_GOLD }}>
          ¡Práctica completada!
        </h2>
        <p className="text-sm mb-4" style={{ color: GM_TEXT_SEC }}>
          +{summary.points} XP · Racha {summary.streakDays} días · {summary.precisionPercent}% precisión
        </p>
        {summary.stepCompleted ? (
          <p className="text-xs mb-6" style={{ color: GM_TEXT_SEC }}>
            Paso del camino marcado como completado.
          </p>
        ) : (
          <p className="text-xs mb-6" style={{ color: GM_TEXT_SEC }}>
            Sigue avanzando en tu camino.
          </p>
        )}
        <Button
          type="button"
          onClick={onExit}
          className="w-full font-medium min-h-[44px] tracking-wide"
          style={{ background: GM_GOLD, color: "#0A0A0A" }}
        >
          Volver al camino
        </Button>
      </div>
    );
  }

  const countLabel =
    responseCount === 1 ? "1 respuesta registrada" : `${responseCount} respuestas registradas`;

  return (
    <div
      className="rounded-lg border p-8 text-center"
      style={{ background: GM_SURFACE, borderColor: GM_BORDER }}
    >
      <h2 className="text-xl font-medium mb-2" style={{ color: GM_GOLD }}>
        Práctica lista
      </h2>
      <p className="text-sm mb-2" style={{ color: GM_TEXT_SEC }}>
        {countLabel}. Enviando al servidor…
      </p>
    </div>
  );
}

function LessonRunnerActive({
  exercises,
  expiresAt,
  onExit,
  onPracticeFinished,
  submission,
  showSecondaryExit = true,
}: {
  exercises: ParsedExerciseView[];
  expiresAt: string;
  onExit: () => void;
  onPracticeFinished?: (attempts: RunnerAttemptDraft[]) => void;
  submission?: LessonRunnerSubmissionView;
  showSecondaryExit?: boolean;
}) {
  const { state, currentExercise, selectOption, nextExercise, completeTap } = useLessonRunner({
    exercises,
    expiresAt,
  });

  const finishedSentRef = useRef(false);

  useEffect(() => {
    if (state.status !== "finished" || !onPracticeFinished || finishedSentRef.current) {
      return;
    }
    finishedSentRef.current = true;
    onPracticeFinished(state.attemptsDraft);
  }, [state.status, state.attemptsDraft, onPracticeFinished]);

  if (state.status === "finished") {
    return (
      <LessonRunnerFinishedState
        responseCount={state.attemptsDraft.length}
        submission={submission}
        onExit={onExit}
      />
    );
  }

  const interactionDisabled = isLessonRunnerInteractionDisabled(state.status);
  const isLastExercise =
    state.exercises.length > 0 && state.currentIndex === state.exercises.length - 1;
  const isTapExercise = currentExercise?.interaction.mode === "tap";
  const canAdvance =
    !isTapExercise && canAdvanceLessonRunner(state.status, state.selectedOptionId);

  return (
    <div className="space-y-6">
      {state.status === "expired" ? <LessonRunnerExpiredBanner /> : null}

      <LessonExerciseStepper
        currentIndex={state.currentIndex}
        total={state.exercises.length}
      />

      {currentExercise ? (
        isTapExercise ? (
          <RhythmTapExercise
            exercise={currentExercise}
            disabled={interactionDisabled}
            onComplete={completeTap}
          />
        ) : (
          <>
            <ExerciseMediaBlock media={currentExercise.media} />
            <MultipleChoiceExercise
              exercise={currentExercise}
              selectedOptionId={state.selectedOptionId}
              disabled={interactionDisabled}
              onSelect={selectOption}
            />
          </>
        )
      ) : null}

      <div className="flex flex-col gap-3 pt-2">
        {!isTapExercise ? (
          <Button
            type="button"
            onClick={nextExercise}
            disabled={!canAdvance}
            className="w-full font-medium min-h-[44px] tracking-wide"
            style={{ background: GM_GOLD, color: "#0A0A0A" }}
          >
            {isLastExercise ? "Finalizar práctica" : "Siguiente"}
          </Button>
        ) : null}
        {showSecondaryExit ? (
          <Button
            type="button"
            variant="outline"
            onClick={onExit}
            className="w-full font-medium min-h-[44px] tracking-wide"
          >
            Volver al camino
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function LessonRunnerShell({
  session,
  nodeTitle,
  onExit,
  onPracticeFinished,
  submission,
  variant = "default",
}: LessonRunnerShellProps) {
  const preparation = useMemo(() => prepareShellSession(session), [session]);
  const sessionIdLabel = abbreviateSessionId(session.sessionId);
  const embedded = variant === "embedded";

  useEscapeExit(onExit);

  const practiceRunner = (
    <LessonRunnerActive
      key={getLessonRunnerResetKey(session.sessionId)}
      exercises={preparation.kind === "supported" ? preparation.exercises : []}
      expiresAt={session.expiresAt}
      onExit={onExit}
      onPracticeFinished={onPracticeFinished}
      submission={submission}
      showSecondaryExit={!embedded}
    />
  );

  if (preparation.kind === "unsafe") {
    const panel = (
      <UnsupportedExercisePanel reason={preparation.message} onExit={onExit} />
    );
    if (embedded) return panel;
    return (
      <LessonRunnerShellFrame
        nodeTitle={nodeTitle}
        sessionIdLabel={sessionIdLabel}
        onExit={onExit}
      >
        {panel}
      </LessonRunnerShellFrame>
    );
  }

  if (preparation.kind === "incompatible") {
    const panel = (
      <UnsupportedExercisePanel
        reason={preparation.reason}
        exerciseId={preparation.exerciseId}
        onExit={onExit}
      />
    );
    if (embedded) return panel;
    return (
      <LessonRunnerShellFrame
        nodeTitle={nodeTitle}
        sessionIdLabel={sessionIdLabel}
        onExit={onExit}
      >
        {panel}
      </LessonRunnerShellFrame>
    );
  }

  if (preparation.exercises.length === 0) {
    const panel = <LessonRunnerEmptyState onExit={onExit} />;
    if (embedded) return panel;
    return (
      <LessonRunnerShellFrame
        nodeTitle={nodeTitle}
        sessionIdLabel={sessionIdLabel}
        onExit={onExit}
      >
        {panel}
      </LessonRunnerShellFrame>
    );
  }

  if (embedded) {
    return practiceRunner;
  }

  return (
    <LessonRunnerShellFrame
      nodeTitle={nodeTitle}
      sessionIdLabel={sessionIdLabel}
      onExit={onExit}
    >
      {practiceRunner}
    </LessonRunnerShellFrame>
  );
}
