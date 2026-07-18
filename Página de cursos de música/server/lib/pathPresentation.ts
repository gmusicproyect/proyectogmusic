/**
 * Presentación controlada de badge/focus en GET /me/path.
 * Contrato editorial (T-F6-ANTI-DEMO-01 / D-F6-ANTI-DEMO):
 * - instrument: mapa controlado por slug/título del Course (sin inventar instrumento).
 * - level: título del Module activo (dato Prisma).
 * - month: Module.order real → etiqueta "Mes N" (nunca índice del array map).
 * - focus: sin campo Prisma → string vacío (no inventar pedagogía). Copy futuro = columna/editorial.
 * - duration: vacío hasta duración editorial real (no estimar por nº de ejercicios).
 */

const INSTRUMENT_RULES: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /guitarra/i, label: "Guitarra" },
  { pattern: /teclado|piano/i, label: "Teclado" },
  { pattern: /canto|voz/i, label: "Canto" },
];

/** Fallback cuando el slug/título no matchea un instrumento conocido. */
export const PATH_INSTRUMENT_FALLBACK = "Ruta";

/** Label neutro cuando no hay progreso/módulo (dashboard sin path). */
export const PATH_LABEL_NEUTRAL = "Tu ruta";

export function resolvePathInstrument(
  courseSlug: string,
  courseTitle?: string | null
): string {
  const haystack = `${courseSlug} ${courseTitle ?? ""}`;
  for (const rule of INSTRUMENT_RULES) {
    if (rule.pattern.test(haystack)) return rule.label;
  }
  return PATH_INSTRUMENT_FALLBACK;
}

export function resolvePathBadgeMonth(moduleOrder: number | null | undefined): string {
  const order =
    typeof moduleOrder === "number" && Number.isFinite(moduleOrder) && moduleOrder >= 1
      ? Math.floor(moduleOrder)
      : 1;
  return `Mes ${order}`;
}

/** Nivel visible = título de módulo publicado (no copy inventado tipo "Fundamento"). */
export function resolvePathBadgeLevel(
  moduleTitle: string | null | undefined,
  courseTitle?: string | null
): string {
  const fromModule = moduleTitle?.trim();
  if (fromModule) return fromModule;
  const fromCourse = courseTitle?.trim();
  if (fromCourse) return fromCourse;
  return "Tu ruta";
}

/**
 * pathLabel de dashboard: Mes desde Module.order (Prisma), no desde index del array.
 */
export function resolvePathProgressLabel(input: {
  moduleOrder: number | null | undefined;
  nodeOrdinal: number;
  nodesTotal: number;
  completed?: boolean;
}): string {
  const month = resolvePathBadgeMonth(input.moduleOrder);
  if (input.completed) return `${month} · Camino completado`;
  const total = Math.max(1, Math.floor(input.nodesTotal) || 1);
  const node = Math.min(total, Math.max(1, Math.floor(input.nodeOrdinal) || 1));
  return `${month} · Nodo ${node} de ${total}`;
}

/**
 * Duración visible en nodos del path: vacío hasta campo editorial real.
 * Prohibido inventar "N min" desde exercises.length.
 */
export function resolveNodeDurationLabel(_node?: {
  exercises?: unknown[];
}): string {
  return "";
}

/**
 * Focus de módulo: sin columna en schema → vacío seguro.
 * UI no debe inventar "Postura, primeros acordes…".
 */
export function resolveModuleFocus(_module: {
  title?: string | null;
  id?: string;
}): string {
  return "";
}
