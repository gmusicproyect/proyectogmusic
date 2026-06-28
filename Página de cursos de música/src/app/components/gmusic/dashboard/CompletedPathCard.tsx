import { ChevronRight } from "lucide-react";
import { ChunkyButton } from "./ChunkyButton";
import { PremiumCard } from "./PremiumCard";
import { STUDIO_PANEL_SHELL_STYLE } from "./studio-panel-shell";
import { GM_GOLD, GM_TEXT_SEC } from "../tokens";

export interface CompletedPathCardProps {
  onViewPath: () => void;
}

export function CompletedPathCard({ onViewPath }: CompletedPathCardProps) {
  return (
    <PremiumCard className="practice-card w-full" padding="24px 28px" style={STUDIO_PANEL_SHELL_STYLE}>
      <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 text-left">
          <p
            className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "rgba(201, 168, 76, 0.72)" }}
          >
            Próxima práctica
          </p>
          <p className="text-base font-semibold leading-snug text-white md:text-lg">Camino completado</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: GM_GOLD }}>
            Sin nodos pendientes por ahora
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed md:text-[15px]" style={{ color: GM_TEXT_SEC }}>
            Has completado todos los nodos disponibles en tu camino actual. Puedes revisar tu progreso
            cuando quieras.
          </p>
        </div>

        <div className="flex shrink-0 lg:justify-end">
          <ChunkyButton onClick={onViewPath} icon={<ChevronRight className="h-5 w-5 shrink-0" />}>
            Ver mi Camino
          </ChunkyButton>
        </div>
      </div>
    </PremiumCard>
  );
}
