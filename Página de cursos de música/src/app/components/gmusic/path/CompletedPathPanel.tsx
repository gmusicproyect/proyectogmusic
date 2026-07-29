import { GM_GOLD, GM_TEXT, GM_TEXT_SEC, GM_SURFACE, GM_BORDER } from "../tokens";

export function CompletedPathPanel({
  compact,
  setPage,
  onReviewPath,
}: {
  compact?: boolean;
  /** T-FLOW-04: CTA primario «Ir a Mi Estudio». */
  setPage?: (page: string) => void;
  /** T-FLOW-04: CTA secundario «Seguir en Mi Camino» (revisión sin replay). */
  onReviewPath?: () => void;
}) {
  return (
    <div
      className={`rounded-lg border p-5 md:p-6 ${compact ? "" : "lg:sticky lg:top-6"}`}
      style={{
        background: GM_SURFACE,
        borderColor: GM_BORDER,
        borderLeftWidth: 3,
        borderLeftColor: GM_GOLD,
      }}
    >
      <p
        className="text-[10px] font-medium tracking-[0.2em] uppercase mb-3"
        style={{ color: "rgba(212, 175, 55, 0.65)" }}
      >
        Camino completado
      </p>
      <h2
        className={`font-medium mb-2 leading-snug ${compact ? "text-lg" : "text-xl"}`}
        style={{ color: GM_TEXT, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Completaste lo publicado
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: GM_TEXT_SEC }}>
        No hay más clases publicadas por ahora. Puedes revisar los pasos completados cuando
        quieras.
      </p>
      {(setPage || onReviewPath) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {setPage && (
            <button
              type="button"
              onClick={() => setPage("mi-estudio")}
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.08em] cursor-pointer transition-colors hover:opacity-90"
              style={{ background: GM_GOLD, color: "#121212" }}
            >
              Ir a Mi Estudio
            </button>
          )}
          {onReviewPath && (
            <button
              type="button"
              onClick={onReviewPath}
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.08em] cursor-pointer transition-colors hover:bg-[#C9A84C]/15"
              style={{
                color: GM_GOLD,
                border: "1px solid rgba(201, 168, 76, 0.4)",
                background: "transparent",
              }}
            >
              Seguir en Mi Camino
            </button>
          )}
        </div>
      )}
    </div>
  );
}
