import { ChevronRight } from "lucide-react";
import { ChunkyButton } from "./ChunkyButton";
import { PremiumCard } from "./PremiumCard";
import { STUDIO_PANEL_SHELL_STYLE } from "./studio-panel-shell";
import { GM_GOLD, GM_TEXT_SEC } from "../tokens";

export interface PracticeCardProps {
  /** Usado para accesibilidad; el hero ya muestra el título al alumno (B2). */
  title: string;
  typeLabel: string;
  description: string;
  onContinue: () => void;
  isLoading?: boolean;
}

export function PracticeCard({
  title,
  typeLabel,
  description,
  onContinue,
  isLoading = false,
}: PracticeCardProps) {
  return (
    <PremiumCard
      className="practice-card w-full"
      padding="24px 28px"
      style={STUDIO_PANEL_SHELL_STYLE}
    >
      <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 text-left">
          <p
            className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "rgba(201, 168, 76, 0.72)" }}
          >
            Próxima práctica
          </p>
          {!isLoading && (
            <span className="sr-only">{title}</span>
          )}
          <p
            className="text-base font-semibold leading-snug text-white md:text-lg"
            style={{ color: isLoading ? GM_TEXT_SEC : GM_GOLD }}
          >
            {typeLabel}
          </p>
          <p
            className="mt-2 max-w-2xl text-sm leading-relaxed md:text-[15px]"
            style={{ color: GM_TEXT_SEC }}
          >
            {description}
          </p>
        </div>

        <div className="flex shrink-0 lg:justify-end">
          <ChunkyButton
            onClick={onContinue}
            isLoading={isLoading}
            disabled={isLoading}
            icon={<ChevronRight className="h-5 w-5 shrink-0" />}
          >
            Continuar mi Camino
          </ChunkyButton>
        </div>
      </div>
    </PremiumCard>
  );
}
