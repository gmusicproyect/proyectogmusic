import { Flame, Mic } from "lucide-react";
import { PremiumCard } from "./PremiumCard";
import { STUDIO_PANEL_SHELL_STYLE } from "./studio-panel-shell";
import { GM_GOLD, GM_TEXT_SEC } from "../tokens";

export type StreakChipEmphasis = "none" | "active" | "recover";

export interface StudentHeroPanelProps {
  userName: string;
  eyebrow: string;
  situationLine: string;
  streakChipLabel: string;
  streakEmphasis: StreakChipEmphasis;
  audioLabel: string;
  audioState: "pending" | "granted" | "denied";
  isCheckingPermission: boolean;
  onRequestAudio: () => void;
}

export function StudentHeroPanel({
  userName,
  eyebrow,
  situationLine,
  streakChipLabel,
  streakEmphasis,
  audioLabel,
  audioState,
  isCheckingPermission,
  onRequestAudio,
}: StudentHeroPanelProps) {
  const streakFlameFilled = streakEmphasis === "active";

  return (
    <PremiumCard
      className="student-hero-panel w-full"
      padding="24px 28px"
      style={STUDIO_PANEL_SHELL_STYLE}
    >
      <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 text-left">
          <p
            className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "rgba(201, 168, 76, 0.72)" }}
          >
            {eyebrow}
          </p>
          <h1
            className="text-xl font-normal leading-tight text-white lg:text-[30px]"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: 0,
            }}
          >
            Hola, {userName}.
          </h1>
          <p
            className="mt-2.5 max-w-2xl text-sm leading-relaxed md:text-[15px]"
            style={{ color: GM_TEXT_SEC }}
          >
            {situationLine}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:max-w-md lg:shrink-0 lg:justify-end">
          <div
            className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
            style={{
              color: streakEmphasis === "none" ? GM_TEXT_SEC : GM_GOLD,
              borderColor:
                streakEmphasis === "active"
                  ? "rgba(201, 168, 76, 0.22)"
                  : "rgba(255, 255, 255, 0.06)",
              background:
                streakEmphasis === "active"
                  ? "rgba(201, 168, 76, 0.08)"
                  : "rgba(255, 255, 255, 0.02)",
            }}
          >
            <Flame
              className="h-4 w-4 shrink-0"
              style={{ color: streakEmphasis === "none" ? GM_TEXT_SEC : "#C9A84C" }}
              fill={streakFlameFilled ? "currentColor" : "none"}
              aria-hidden
            />
            <span>{streakChipLabel}</span>
          </div>

          {!isCheckingPermission && (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
              style={{
                background:
                  audioState === "granted"
                    ? "rgba(201, 168, 76, 0.08)"
                    : "rgba(255, 255, 255, 0.03)",
                border:
                  audioState === "granted"
                    ? "1px solid rgba(201, 168, 76, 0.2)"
                    : "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <span
                className={`inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${audioState === "granted" ? "bg-[#C9A84C]" : "bg-zinc-600"}`}
                aria-hidden
              />
              <Mic
                className="h-3.5 w-3.5 shrink-0"
                style={{ color: audioState === "granted" ? GM_GOLD : GM_TEXT_SEC }}
              />
              <span
                className="text-[11px] font-semibold"
                style={{ color: audioState === "granted" ? GM_GOLD : GM_TEXT_SEC }}
              >
                {audioLabel}
              </span>
              {audioState === "pending" && (
                <button
                  type="button"
                  onClick={onRequestAudio}
                  className="ml-1.5 cursor-pointer rounded-md px-2 py-0.5 text-[9px] font-bold transition-colors hover:bg-[#C9A84C]/25"
                  style={{ background: "rgba(201, 168, 76, 0.12)", color: GM_GOLD }}
                >
                  Activar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}
