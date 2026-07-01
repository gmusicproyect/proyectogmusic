import type { CommunityWeeklyChallenge } from "../../../data/mock-community-data";
import { COMMUNITY_LEVEL_LABELS } from "../../../data/community-level";

const GOLD = "#C9A84C";

interface CommunityWeeklyChallengeCardProps {
  challenge: CommunityWeeklyChallenge;
  readOnly: boolean;
  onDeliver?: () => void;
  onView?: () => void;
}

export function CommunityWeeklyChallengeCard({
  challenge,
  readOnly,
  onDeliver,
  onView,
}: CommunityWeeklyChallengeCardProps) {
  return (
    <article
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: 14,
        padding: 20,
        marginBottom: 20,
      }}
      onMouseEnter={onView}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: GOLD,
        }}
      >
        Reto semanal
      </p>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
        Nivel: {COMMUNITY_LEVEL_LABELS[challenge.level]} · Clase {challenge.lessonNumber}
      </p>
      <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "#fff" }}>
        {challenge.title}
      </h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
        {challenge.description}
      </p>
      {!readOnly && (
        <button
          type="button"
          onClick={onDeliver}
          style={{
            background: "transparent",
            border: `1px solid rgba(201,168,76,0.45)`,
            color: GOLD,
            padding: "8px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Entregar progreso
        </button>
      )}
    </article>
  );
}
