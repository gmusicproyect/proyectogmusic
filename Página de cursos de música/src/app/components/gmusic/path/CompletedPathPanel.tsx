import { GM_GOLD, GM_TEXT, GM_TEXT_SEC, GM_SURFACE, GM_BORDER } from "../tokens";

export function CompletedPathPanel({ compact }: { compact?: boolean }) {
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
        Has recorrido todos los pasos disponibles
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: GM_TEXT_SEC }}>
        No hay lecciones pendientes en tu camino actual. Puedes revisar los pasos completados cuando
        quieras.
      </p>
    </div>
  );
}
