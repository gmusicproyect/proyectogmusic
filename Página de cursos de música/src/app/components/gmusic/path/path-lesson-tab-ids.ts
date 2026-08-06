export type PathLessonTabId = "tarjetas" | "practica" | "resumen-pdf";

export const PATH_LESSON_TAB_DEFINITIONS = [
  { id: "tarjetas" as const, label: "Tarjetas (Mi Camino)" },
  { id: "practica" as const, label: "Práctica" },
  { id: "resumen-pdf" as const, label: "Resumen PDF" },
] as const;

export function isPathLessonTabId(value: string): value is PathLessonTabId {
  return PATH_LESSON_TAB_DEFINITIONS.some((tab) => tab.id === value);
}
