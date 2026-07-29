/**
 * Oleada D · D1 — Mensaje legible para MODULE_INCOMPLETE.
 * Deriva del propio detalle (slots con node null) qué etapas faltan,
 * sin tocar el contrato del servidor.
 */
export function buildMissingStagesMessage(
  slots: Array<{ stageLabel: string; node: unknown | null }>
): string | null {
  const missing = slots.filter((slot) => slot.node === null).map((slot) => slot.stageLabel);
  if (missing.length === 0) return null;
  const plural = missing.length === 1 ? "esta etapa" : "estas etapas";
  return `Para publicar el bloque completa ${plural}: ${missing.join(", ")}.`;
}
