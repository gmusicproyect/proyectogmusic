import { useCallback, useEffect, useState } from "react";
import { PathLessonRunner } from "./PathLessonRunner";
import { PathPracticaReposo } from "./PathPracticaReposo";
import { PathPracticaShell } from "./PathPracticaShell";
import { canStartLessonFromNode } from "./path-lesson-start";
import type { PathNodeData } from "../../../data/gmusic-path-types";
import type { LessonSessionResponse } from "../../../services/gmusic-api/types";

const DEFAULT_EXERCISE_TOTAL = 5;

export interface PathPracticaTabProps {
  activeRunner: {
    session: LessonSessionResponse;
    nodeTitle: string;
    nodeId: string;
    videoUrl: string | null;
    nodeDuration?: string;
    lessonNode: PathNodeData;
  } | null;
  activeNode: PathNodeData | null;
  onStartActiveNode: () => void;
  onExitPractice: () => void;
  onSessionCompleted: () => void;
  loadingNodeId: string | null;
}

export function PathPracticaTab({
  activeRunner,
  activeNode,
  onStartActiveNode,
  onExitPractice,
  onSessionCompleted,
  loadingNodeId,
}: PathPracticaTabProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalExercises, setTotalExercises] = useState(DEFAULT_EXERCISE_TOTAL);

  const canStart = activeNode ? canStartLessonFromNode(activeNode) : false;
  const isLoading = activeNode ? loadingNodeId === activeNode.id : false;

  useEffect(() => {
    if (activeRunner) {
      setTotalExercises(activeRunner.session.exercises.length || DEFAULT_EXERCISE_TOTAL);
      setCompletedCount(0);
    } else {
      setTotalExercises(DEFAULT_EXERCISE_TOTAL);
      setCompletedCount(0);
      setIsFullscreen(false);
    }
  }, [activeRunner?.session.sessionId, activeRunner]);

  const handleExerciseProgress = useCallback((completed: number, total: number) => {
    setCompletedCount(completed);
    setTotalExercises(total);
  }, []);

  const handleExitPractice = useCallback(() => {
    setIsFullscreen(false);
    onExitPractice();
  }, [onExitPractice]);

  return (
    <PathPracticaShell
      completedCount={completedCount}
      totalExercises={totalExercises}
      isFullscreen={isFullscreen}
      onToggleFullscreen={() => setIsFullscreen((value) => !value)}
    >
      {activeRunner ? (
        <PathLessonRunner
          key={activeRunner.session.sessionId}
          variant="embedded"
          practiceOnly
          session={activeRunner.session}
          nodeTitle={activeRunner.nodeTitle}
          lessonNode={activeRunner.lessonNode}
          videoUrl={activeRunner.videoUrl}
          nodeDuration={activeRunner.nodeDuration}
          onExit={handleExitPractice}
          onSessionCompleted={onSessionCompleted}
          onExerciseProgress={handleExerciseProgress}
        />
      ) : (
        <PathPracticaReposo canStart={canStart} isLoading={isLoading} onStart={onStartActiveNode} />
      )}
    </PathPracticaShell>
  );
}
