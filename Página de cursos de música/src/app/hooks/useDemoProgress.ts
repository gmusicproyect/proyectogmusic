import { useState, useCallback, useEffect } from "react";
import { DEMO_FREE_LESSON_COUNT } from "../data/demo-path-catalog";
import { ANONYMOUS_FUNNEL_RESET_EVENT } from "../utils/anonymous-funnel-storage";

const DEMO_STORAGE_KEY = "gmusic:demo_v1";

interface DemoProgressData {
  completed: number[];
}

function readProgress(): DemoProgressData {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return { completed: [] };
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "completed" in parsed &&
      Array.isArray((parsed as DemoProgressData).completed)
    ) {
      return {
        completed: (parsed as DemoProgressData).completed.filter(
          (n): n is number => typeof n === "number"
        ),
      };
    }
    return { completed: [] };
  } catch {
    return { completed: [] };
  }
}

function writeProgress(data: DemoProgressData): void {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage indisponible (navegación privada, cuota llena)
  }
}

export function useDemoProgress() {
  const [completedLessons, setCompletedLessons] = useState<number[]>(
    () => readProgress().completed
  );

  const markComplete = useCallback((lessonNumber: number) => {
    setCompletedLessons((prev) => {
      if (prev.includes(lessonNumber)) return prev;
      const next = [...prev, lessonNumber];
      writeProgress({ completed: next });
      return next;
    });
  }, []);

  const isLessonComplete = useCallback(
    (lessonNumber: number): boolean => completedLessons.includes(lessonNumber),
    [completedLessons]
  );

  const demoFinished =
    completedLessons.filter((n) => n >= 1 && n <= DEMO_FREE_LESSON_COUNT).length >=
    DEMO_FREE_LESSON_COUNT;
  const nextLessonNumber = Math.min(
    completedLessons.filter((n) => n >= 1 && n <= DEMO_FREE_LESSON_COUNT).length + 1,
    DEMO_FREE_LESSON_COUNT
  );

  const resetProgress = useCallback(() => {
    writeProgress({ completed: [] });
    setCompletedLessons([]);
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      setCompletedLessons(readProgress().completed);
    };
    window.addEventListener(ANONYMOUS_FUNNEL_RESET_EVENT, syncFromStorage);
    return () => window.removeEventListener(ANONYMOUS_FUNNEL_RESET_EVENT, syncFromStorage);
  }, []);

  return { completedLessons, markComplete, isLessonComplete, demoFinished, nextLessonNumber, resetProgress };
}
