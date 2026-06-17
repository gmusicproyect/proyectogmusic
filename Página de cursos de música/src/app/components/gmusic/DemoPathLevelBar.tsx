import { GM_GOLD, GM_TEXT, GM_TEXT_SEC } from "./tokens";

const GOLD = "#C9A84C";
const DEFAULT_TOTAL = 5;

export interface DemoPathLevelBarProps {
  completedCount: number;
  /** Clase activa (1–N); si todas completadas, N */
  activeClass: number;
  levelLabel?: string;
  totalClasses?: number;
  freeClassCount?: number;
  /** rail = franja compacta arriba de página; default = bloque con más aire */
  variant?: "default" | "rail";
  embedded?: boolean;
}

export function DemoPathLevelBar({
  completedCount,
  activeClass,
  levelLabel = "Fundamento",
  totalClasses = DEFAULT_TOTAL,
  freeClassCount,
  variant = "default",
  embedded = false,
}: DemoPathLevelBarProps) {
  const progressDenominator = freeClassCount ?? totalClasses;
  const progressPct = Math.min(100, (completedCount / progressDenominator) * 100);
  const showCompactNav = totalClasses > 12;

  if (variant === "rail") {
    return (
      <div
        className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center md:justify-between"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.65)",
            }}
          >
            Nivel
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(16px, 2.5vw, 20px)",
              fontWeight: 500,
              color: GM_TEXT,
            }}
          >
            {levelLabel}
          </span>
          <span style={{ fontSize: 12, color: GM_TEXT_SEC }}>
            {freeClassCount != null
              ? `${completedCount} / ${freeClassCount} gratis · ${totalClasses} total`
              : `${completedCount} / ${totalClasses} clases`}
          </span>
        </div>

        <div
          className="flex items-center gap-3 flex-1 md:max-w-md lg:max-w-lg md:mx-6"
          style={{ minWidth: 120 }}
        >
          <div
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
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
        </div>

        {showCompactNav ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: GOLD,
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}
          >
            Clase activa · {activeClass}
          </span>
        ) : (
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {Array.from({ length: totalClasses }, (_, i) => {
              const classNum = i + 1;
              const isCompleted = classNum <= completedCount;
              const isActive = classNum === activeClass && !isCompleted;

              return (
                <div
                  key={classNum}
                  title={`Clase ${classNum}`}
                  style={{
                    width: isActive ? 26 : 22,
                    height: isActive ? 26 : 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isActive ? 10 : 9,
                    fontWeight: 600,
                    color: isCompleted ? "#0A0A0A" : isActive ? GOLD : "rgba(255,255,255,0.35)",
                    background: isCompleted
                      ? GOLD
                      : isActive
                      ? "rgba(201,168,76,0.12)"
                      : "rgba(255,255,255,0.06)",
                    border: isActive
                      ? `2px solid ${GOLD}`
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isActive ? `0 0 12px rgba(201,168,76,0.3)` : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  {classNum}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={embedded ? "mt-0 pt-4" : "mt-8 lg:mt-10"}
      style={
        embedded
          ? undefined
          : {
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 20,
            }
      }
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
          {completedCount} de {totalClasses} clases
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

      <div className="flex justify-between gap-1" style={{ fontFamily: "Inter, sans-serif" }}>
        {Array.from({ length: totalClasses }, (_, i) => {
          const classNum = i + 1;
          const isCompleted = classNum <= completedCount;
          const isActive = classNum === activeClass && !isCompleted;
          const isFuture = classNum > completedCount && !isActive;

          return (
            <div key={classNum} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
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
