import { GM_GOLD, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export type SubscriberLessonPhase = "video" | "practice" | "complete";

const STATIONS: Array<{ id: SubscriberLessonPhase; label: string }> = [
  { id: "video", label: "Video" },
  { id: "practice", label: "Ejercicio" },
  { id: "complete", label: "Éxito" },
];

export function resolveSubscriberLessonStations(hasVideo: boolean) {
  return hasVideo ? STATIONS : STATIONS.filter((station) => station.id !== "video");
}

interface SubscriberLessonStepperProps {
  phase: SubscriberLessonPhase;
  hasVideo: boolean;
}

export function SubscriberLessonStepper({ phase, hasVideo }: SubscriberLessonStepperProps) {
  const stations = resolveSubscriberLessonStations(hasVideo);
  const activeIndex = stations.findIndex((station) => station.id === phase);

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={stations.length}
      aria-valuenow={activeIndex + 1}
      aria-label={`Etapa ${activeIndex + 1} de ${stations.length}`}
      className="flex flex-wrap items-center justify-center gap-2 w-full"
    >
      {stations.map((station, index) => {
        const isActive = station.id === phase;
        const isComplete = index < activeIndex;
        return (
          <div key={station.id} className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 rounded-full border px-3 py-1"
              style={{
                borderColor: isActive
                  ? "rgba(201,168,76,0.4)"
                  : isComplete
                    ? "rgba(201,168,76,0.2)"
                    : "rgba(255,255,255,0.07)",
                background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
              }}
            >
              <span
                className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  color: isActive || isComplete ? "#080808" : "rgba(255,255,255,0.35)",
                  background: isActive || isComplete ? GM_GOLD : "rgba(255,255,255,0.07)",
                }}
              >
                {isComplete ? "✓" : index + 1}
              </span>
              <span
                className="text-[11px] font-medium tracking-wide"
                style={{ color: isActive ? GM_GOLD : isComplete ? GM_TEXT : GM_TEXT_SEC }}
              >
                {station.label}
              </span>
            </div>
            {index < stations.length - 1 ? (
              <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.15)" }}>
                →
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
