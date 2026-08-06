import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { buildLessonResultFeedback } from "./lesson-result-feedback";
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
import { LessonFretboard } from "./LessonFretboard";
import {
  exerciseOptionsAreFretboardStrings,
  type FretboardStringId,
} from "./lesson-fretboard";
import {
  buildLessonPracticeChipItems,
  LessonPracticeChips,
} from "./LessonPracticeChips";
import { LessonPracticePanel } from "./LessonPracticePanel";
import { MultipleChoiceExercise } from "./MultipleChoiceExercise";
import { RhythmTapExercise } from "./RhythmTapExercise";
import { prepareLessonRunner } from "./prepare-lesson-runner";
import type { ParsedExerciseView } from "./lesson-runner-types";
import { UnsupportedExercisePanel } from "./UnsupportedExercisePanel";
import { useLessonRunner } from "./useLessonRunner";
import type { LessonRunnerStatus } from "./lesson-runner-state";
import type { RunnerAttemptDraft } from "./lesson-runner-state";
import { PathPracticaBody } from "../path/PathPracticaBody";
import { usePathPracticaLayout } from "../path/path-practica-layout";

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
  /** Progreso completado (índice actual = ejercicios ya superados en pantalla). */
  onExerciseProgress?: (completedCount: number, totalExercises: number) => void;
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

function useEscapeExit(onExit: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onExit();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, onExit]);
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
        <p role="status" className="text-xs mb-6" style={{ color: GM_TEXT_SEC }}>
          {buildLessonResultFeedback(summary)}
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
  nodeTitle,
  onExit,
  onPracticeFinished,
  submission,
  showSecondaryExit = true,
  embedded = false,
  onExerciseProgress,
}: {
  exercises: ParsedExerciseView[];
  expiresAt: string;
  nodeTitle: string;
  onExit: () => void;
  onPracticeFinished?: (attempts: RunnerAttemptDraft[]) => void;
  submission?: LessonRunnerSubmissionView;
  showSecondaryExit?: boolean;
  embedded?: boolean;
  onExerciseProgress?: (completedCount: number, totalExercises: number) => void;
}) {
  const { state, currentExercise, selectOption, selectFretboardString, nextExercise, completeTap } =
    useLessonRunner({
      exercises,
      expiresAt,
    });

  const layoutMode = usePathPracticaLayout();
  const immersiveLayout = layoutMode === "immersive";

  const finishedSentRef = useRef(false);
  const [visualPoints, setVisualPoints] = useState(0);
  const [visualCombo, setVisualCombo] = useState(0);
  const prevIndexRef = useRef(0);

  useEffect(() => {
    if (!embedded || !onExerciseProgress || state.exercises.length === 0) return;
    if (state.status === "finished") {
      onExerciseProgress(state.exercises.length, state.exercises.length);
      return;
    }
    onExerciseProgress(state.currentIndex, state.exercises.length);
  }, [
    embedded,
    onExerciseProgress,
    state.currentIndex,
    state.exercises.length,
    state.status,
  ]);

  useEffect(() => {
    if (!embedded || state.status === "finished") return;
    if (state.currentIndex > prevIndexRef.current) {
      setVisualPoints((value) => value + 20);
      setVisualCombo((value) => value + 1);
    }
    prevIndexRef.current = state.currentIndex;
  }, [embedded, state.currentIndex, state.status]);

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
  const isFretboardAnswer = currentExercise?.answerInput === "fretboard";
  const isStringOptionsExercise = currentExercise
    ? exerciseOptionsAreFretboardStrings(currentExercise.options)
    : false;
  const fretboardInteractive = isFretboardAnswer || isStringOptionsExercise;

  const handleFretboardTap = (stringId: FretboardStringId) => {
    if (!currentExercise || interactionDisabled) return;

    if (isFretboardAnswer) {
      selectFretboardString(stringId);
      return;
    }

    if (isStringOptionsExercise) {
      const match = currentExercise.options.find(
        (option) => option.text.trim() === stringId || option.id === stringId
      );
      if (match) selectOption(match.id);
    }
  };

  const canAdvance =
    !isTapExercise &&
    !fretboardInteractive &&
    canAdvanceLessonRunner(state.status, state.selectedOptionId);

  const chipItems = buildLessonPracticeChipItems(
    state.exercises.length,
    state.currentIndex,
    false
  );
  const footLabel =
    state.exercises.length > 0
      ? `Ejercicio ${state.currentIndex + 1} de ${state.exercises.length}`
      : null;

  const fretboardBlock =
    currentExercise && !isTapExercise ? (
      <LessonFretboard
        selectedStringId={
          isFretboardAnswer
            ? state.selectedOptionId
            : isStringOptionsExercise
              ? currentExercise.options.find((option) => option.id === state.selectedOptionId)
                  ?.text.trim() ?? null
              : null
        }
        interactive={fretboardInteractive}
        disabled={interactionDisabled}
        onSelectStringId={handleFretboardTap}
      />
    ) : null;

  const exerciseBody = currentExercise ? (
    isTapExercise ? (
      <RhythmTapExercise
        exercise={currentExercise}
        disabled={interactionDisabled}
        onComplete={completeTap}
      />
    ) : (
      <>
        {!immersiveLayout ? fretboardBlock : null}
        <ExerciseMediaBlock media={currentExercise.media} />
        <MultipleChoiceExercise
          exercise={currentExercise}
          selectedOptionId={state.selectedOptionId}
          disabled={interactionDisabled}
          showOptions={!fretboardInteractive}
          layout={embedded ? "pills" : "list"}
          hideInstruction={embedded}
          onSelect={selectOption}
        />
      </>
    )
  ) : null;

  const actionButtons = (
    <div className="flex flex-col gap-3 pt-2">
      {!isTapExercise && !fretboardInteractive ? (
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
  );

  if (embedded) {
    const panelWrapClass = immersiveLayout ? "path-practica-immersive-panel space-y-4" : "space-y-4";

    return (
      <PathPracticaBody>
        {state.status === "expired" ? <LessonRunnerExpiredBanner /> : null}
        {immersiveLayout ? fretboardBlock : null}
        <div className={panelWrapClass}>
          <LessonPracticeChips items={chipItems} />
          <LessonPracticePanel
            title={nodeTitle}
            prompt={currentExercise?.instruction ?? null}
            visualPoints={visualPoints}
            visualCombo={visualCombo}
            hideTitle
            footLabel={footLabel}
          >
            {exerciseBody}
            {actionButtons}
          </LessonPracticePanel>
        </div>
      </PathPracticaBody>
    );
  }

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
              showOptions={!fretboardInteractive}
              onSelect={selectOption}
            />
            <LessonFretboard
              selectedStringId={
                isFretboardAnswer
                  ? state.selectedOptionId
                  : isStringOptionsExercise
                    ? currentExercise.options.find((option) => option.id === state.selectedOptionId)
                        ?.text.trim() ?? null
                    : null
              }
              interactive={fretboardInteractive}
              disabled={interactionDisabled}
              onSelectStringId={handleFretboardTap}
            />
          </>
        )
      ) : null}

      {actionButtons}
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
  onExerciseProgress,
}: LessonRunnerShellProps) {
  const preparation = useMemo(() => prepareShellSession(session), [session]);
  const sessionIdLabel = abbreviateSessionId(session.sessionId);
  const embedded = variant === "embedded";

  useEscapeExit(onExit, !embedded);

  const practiceRunner = (
    <LessonRunnerActive
      key={getLessonRunnerResetKey(session.sessionId)}
      exercises={preparation.kind === "supported" ? preparation.exercises : []}
      expiresAt={session.expiresAt}
      nodeTitle={nodeTitle}
      onExit={onExit}
      onPracticeFinished={onPracticeFinished}
      submission={submission}
      showSecondaryExit={!embedded}
      embedded={embedded}
      onExerciseProgress={onExerciseProgress}
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
