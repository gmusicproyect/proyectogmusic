/**
 * T-FLOW-03 · D-GOV-17 Opción B — Badge «Publicado legacy».
 * Módulos seed B1/B2 publicados sin las 5 etapas completas (3+2 nodos)
 * se muestran en admin como «Publicado legacy». El alumno no ve este badge.
 */
export function isLegacyPublishedModule(input: {
  published: boolean;
  completeSlots: number;
  totalSlots: number;
}): boolean {
  if (!input.published) return false;
  if (input.totalSlots <= 0) return false;
  return input.completeSlots < input.totalSlots;
}

/** Etiqueta del chip de estado en admin (detalle y listado). */
export function adminModuleStatusLabel(input: {
  published: boolean;
  completeSlots: number;
  totalSlots: number;
}): string {
  if (!input.published) return "Borrador";
  return isLegacyPublishedModule(input) ? "Publicado legacy" : "Publicado";
}
