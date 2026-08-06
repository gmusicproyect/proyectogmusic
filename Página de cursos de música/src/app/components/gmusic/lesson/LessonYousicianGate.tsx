import { MicOff } from "lucide-react";
import { GM_GOLD_MATT, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export function LessonYousicianGate() {
  return (
    <aside
      className="rounded-lg border px-4 py-4 md:px-5 md:py-5"
      style={{
        borderColor: GM_GOLD_MATT,
        background: "rgba(212, 175, 55, 0.06)",
      }}
      aria-label="Aviso sobre modo escucha"
    >
      <div className="flex items-start gap-3">
        <MicOff
          className="mt-0.5 h-5 w-5 shrink-0"
          style={{ color: "rgba(212, 175, 55, 0.75)" }}
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold tracking-wide" style={{ color: GM_TEXT }}>
            Modo escucha — próximamente
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: GM_TEXT_SEC }}>
            Hoy practicas respondiendo en pantalla; el servidor califica al finalizar.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: GM_TEXT_SEC }}>
            La app escuchando tu guitarra en vivo está en evaluación (D-GOV-AUDIO-01 · fase 1).
          </p>
          <p className="text-xs italic leading-relaxed" style={{ color: GM_TEXT_SEC }}>
            No se activa el micrófono en esta versión.
          </p>
        </div>
      </div>
    </aside>
  );
}
