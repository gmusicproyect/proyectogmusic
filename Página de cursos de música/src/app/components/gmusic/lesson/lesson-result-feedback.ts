/**
 * Oleada B · B1 — Feedback mínimo de acierto al terminar la práctica.
 * Fuente única: la calificación que devuelve el SERVIDOR al cerrar la práctica
 * (porcentaje de precisión y si el paso quedó completado).
 * Sin límites de retry, sin scoring en cliente, sin motor pedagógico nuevo.
 */
export function buildLessonResultFeedback(summary: {
  precisionPercent: number;
  stepCompleted: boolean;
}): string {
  if (!summary.stepCompleted) {
    return "Algunas respuestas fueron incorrectas y el paso aún no quedó completado. Inténtalo de nuevo cuando quieras.";
  }
  if (summary.precisionPercent < 100) {
    return "Paso completado. Tuviste algunas respuestas incorrectas — repásalas en tu próxima práctica.";
  }
  return "Paso del camino marcado como completado.";
}
