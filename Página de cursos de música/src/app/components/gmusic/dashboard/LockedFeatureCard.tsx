import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";
import { PremiumCard } from "./PremiumCard";

export interface LockedFeatureCardProps {
  icon: LucideIcon;
  eyebrow: string;
  description: string;
}

export function LockedFeatureCard({ icon: Icon, eyebrow, description }: LockedFeatureCardProps) {
  return (
    <PremiumCard padding="30px 32px" className="dash-locked-card group">
      <div className="flex items-start justify-between mb-6">
        <div className="dash-locked-card__icon-wrap w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:border-[rgba(201,168,76,0.2)]">
          <Icon className="dash-locked-card__icon w-5 h-5 transition-colors duration-300" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="dash-locked-card__badge text-[9px] uppercase tracking-[0.18em] font-bold px-3 py-1.5 rounded-full">
            Próximamente
          </span>
          <Lock
            className="dash-locked-card__lock w-[18px] h-[18px] transition-colors duration-300"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      </div>
      <p className="dash-locked-card__eyebrow text-[10px] uppercase tracking-[0.2em] mb-2 font-bold whitespace-normal break-words">
        {eyebrow}
      </p>
      <h3 className="dash-locked-card__title text-xl font-semibold mb-2.5 transition-colors duration-300">
        Próximamente
      </h3>
      <p className="dash-locked-card__description transition-colors duration-300">{description}</p>
    </PremiumCard>
  );
}
