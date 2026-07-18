/**
 * PD-3 — feature flag de persistencia durable H1.
 *
 * GMUSIC_H1_DURABLE=1 → servicios H1 leen/escriben DB (local/Docker).
 * Ausente/0 → puentes en memoria (tests unitarios P0 y default).
 * Prod: no activar sin mandato (R-OPS-01).
 */
export function isH1DurableEnabled(): boolean {
  const raw = (process.env.GMUSIC_H1_DURABLE ?? "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

export type H1EventSourceMeta = "memory_bridge_h1" | "db" | "db_with_rebuild";

export function h1EventSourceMeta(): H1EventSourceMeta {
  return isH1DurableEnabled() ? "db" : "memory_bridge_h1";
}
