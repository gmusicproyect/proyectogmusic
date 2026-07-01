import { COMMUNITY_LEVEL_LABELS } from "../../../data/community-level";
import { getCommunitySectorForLevel } from "../../../data/community-sectors";
import type { CommunityEnrollment } from "../../../utils/community-enrollment";

const GOLD = "#C9A84C";

interface CommunityLevelBadgeProps {
  enrollment: CommunityEnrollment | null;
  loading?: boolean;
}

/** Muestra solo el sector activo del alumno — sin selector de otros niveles. */
export function CommunityLevelBadge({ enrollment, loading = false }: CommunityLevelBadgeProps) {
  if (loading) {
    return (
      <p style={{ margin: "12px 0 0", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
        Cargando tu sector de comunidad…
      </p>
    );
  }

  if (!enrollment) return null;

  const sector = getCommunitySectorForLevel(enrollment.communityLevel);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(201,168,76,0.12)",
            border: "1px solid rgba(201,168,76,0.45)",
            color: GOLD,
            padding: "10px 16px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {enrollment.programLabel}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#0A0A0A",
              background: GOLD,
              padding: "2px 8px",
              borderRadius: 999,
            }}
          >
            TU NIVEL
          </span>
        </div>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
        Comunidad {COMMUNITY_LEVEL_LABELS[enrollment.communityLevel]} — {sector.description}
      </p>
    </div>
  );
}
