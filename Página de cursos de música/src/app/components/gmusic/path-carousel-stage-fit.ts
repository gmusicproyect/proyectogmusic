/** Máximo de nodos en ventana fit (tramo actual suscriptor). */
export const STAGE_FIT_MAX_NODES = 8;

/** Por debajo de este viewport se mantiene swipe mobile. */
export const STAGE_FIT_MOBILE_MAX_VIEWPORT = 767;

const FIT_ROW_BUFFER_PX = 14;

/**
 * Ancho estimado de la fila de tarjetas para decidir si caben sin scroll.
 * Side/focus escalan con el contenedor, no con viewport fijo 1024px.
 */
export function estimateStageRowWidth(cardCount: number, containerWidth: number): number {
  if (cardCount <= 0) return 0;
  const side = Math.min(148, Math.max(100, containerWidth * 0.112));
  const focused = Math.min(196, Math.max(142, containerWidth * 0.148));
  const gap = containerWidth < 920 ? 7 : 9;
  const gaps = Math.max(0, cardCount - 1);
  return gaps * side + focused + gaps * gap;
}

export function shouldStageContainerFit(
  containerWidth: number,
  cardCount: number,
  viewportWidth: number
): boolean {
  if (cardCount <= 0 || cardCount > STAGE_FIT_MAX_NODES) return false;
  if (viewportWidth <= STAGE_FIT_MOBILE_MAX_VIEWPORT) return false;
  if (containerWidth <= 0) return false;
  return containerWidth >= estimateStageRowWidth(cardCount, containerWidth) + FIT_ROW_BUFFER_PX;
}
