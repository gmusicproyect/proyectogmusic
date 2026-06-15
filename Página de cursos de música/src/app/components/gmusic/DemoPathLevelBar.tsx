import { GM_GOLD, GM_TEXT, GM_TEXT_SEC } from "./tokens";

const GOLD = "#C9A84C";
const TOTAL_CLASSES = 5;

export interface DemoPathLevelBarProps {
  completedCount: number;
  /** Clase activa (1–5); si todas completadas, 5 */
  activeClass: number;
  levelLabel?: string;
}

export function DemoPathLevelBar({
  completedCount,
  activeClass,
  levelLabel = "Fundamento",
}: DemoPathLevelBarProps) {
  const progressPct = Math.min(100, (completedCount / TOTAL_CLASSES) * 100);

  return (
    <div
      className="mt-8 lg:mt-10"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 20,
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 mb-4"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.65)",
            }}
          >
            Nivel
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(18px, 3vw, 22px)",
              fontWeight: 500,
              color: GM_TEXT,
            }}
          >
            {levelLabel}
          </p>
        </div>
        <span style={{ fontSize: 12, color: GM_TEXT_SEC }}>
          {completedCount} de {TOTAL_CLASSES} clases
        </span>
      </div>

      <div
        style={{
          position: "relative",
          height: 6,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${GOLD} 0%, rgba(201,168,76,0.75) 100%)`,
            transition: "width 0.45s ease",
          }}
        />
      </div>

      <div
        className="flex justify-between gap-1"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {Array.from({ length: TOTAL_CLASSES }, (_, i) => {
          const classNum = i + 1;
          const isCompleted = classNum <= completedCount;
          const isActive = classNum === activeClass && !isCompleted;
          const isFuture = classNum > completedCount && !isActive;

          return (
            <div
              key={classNum}
              className="flex flex-col items-center gap-1.5 flex-1 min-w-0"
            >
              <div
                style={{
                  width: isActive ? 28 : 22,
                  height: isActive ? 28 : 22,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isActive ? 11 : 10,
                  fontWeight: 600,
                  color: isCompleted
                    ? "#0A0A0A"
                    : isActive
                    ? GOLD
                    : "rgba(255,255,255,0.35)",
                  background: isCompleted
                    ? GOLD
                    : isActive
                    ? "rgba(201,168,76,0.12)"
                    : "rgba(255,255,255,0.06)",
                  border: isActive
                    ? `2px solid ${GOLD}`
                    : isFuture
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "none",
                  boxShadow: isActive ? `0 0 16px rgba(201,168,76,0.35)` : "none",
                  transition: "all 0.25s ease",
                }}
              >
                {classNum}
              </div>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: isActive ? GM_GOLD : "rgba(255,255,255,0.28)",
                  whiteSpace: "nowrap",
                }}
              >
                Clase {classNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
