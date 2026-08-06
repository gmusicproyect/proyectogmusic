import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "../../ui/button";
import { LessonFretboard } from "../lesson/LessonFretboard";
import type { FretboardStringId } from "../lesson/lesson-fretboard";
import { GM_BORDER, GM_GOLD, GM_TEXT_SEC } from "../tokens";
import { PathPracticaBody, PathPracticaImmersiveActions } from "./PathPracticaBody";
import { usePathPracticaLayout } from "./path-practica-layout";

export interface PathPracticaReposoProps {
  canStart: boolean;
  isLoading: boolean;
  onStart: () => void;
}

export function PathPracticaReposo({ canStart, isLoading, onStart }: PathPracticaReposoProps) {
  const [previewStringId, setPreviewStringId] = useState<FretboardStringId | null>(null);
  const layoutMode = usePathPracticaLayout();
  const immersive = layoutMode === "immersive";

  return (
    <PathPracticaBody>
      <LessonFretboard
        selectedStringId={previewStringId}
        interactive
        onSelectStringId={setPreviewStringId}
      />

      {immersive ? (
        <p className="path-practica-immersive-hint">
          Toca la cuerda en pantalla para responder.
        </p>
      ) : null}

      <PathPracticaImmersiveActions>
        <div className={immersive ? "" : "mt-4"}>
          {canStart ? (
            <Button
              type="button"
              disabled={isLoading}
              onClick={onStart}
              className="min-h-[44px] w-full text-sm font-bold uppercase tracking-[0.08em]"
              style={{ background: GM_GOLD, color: "#0A0A0A" }}
            >
              {isLoading ? "Abriendo sesión…" : "Iniciar práctica"}
            </Button>
          ) : (
            <div
              className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm"
              style={{ borderColor: GM_BORDER, color: GM_TEXT_SEC }}
            >
              <Lock className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
              Completa las etapas anteriores para desbloquear la práctica.
            </div>
          )}
        </div>
      </PathPracticaImmersiveActions>
    </PathPracticaBody>
  );
}
