import type { CommunityAdminCurated } from "../../../data/mock-community-data";
import { CommunityExternalLinkCard } from "./CommunityExternalLinkCard";

const GOLD = "#C9A84C";

const KIND_EYEBROWS = {
  song_of_month: "Curado por Gmusic",
  album_of_week: "Curado por Gmusic",
  support_launch: "Curado por Gmusic",
} as const;

interface CommunityAdminCuratedPanelProps {
  items: CommunityAdminCurated[];
}

export function CommunityAdminCuratedPanel({ items }: CommunityAdminCuratedPanelProps) {
  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      {items.map((item) => (
        <article
          key={item.id}
          style={{
            background: "rgba(201,168,76,0.06)",
            border: "1px solid rgba(201,168,76,0.18)",
            borderRadius: 14,
            padding: 18,
            marginBottom: 12,
          }}
        >
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            {KIND_EYEBROWS[item.kind]}
          </p>
          <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#fff" }}>
            {item.title}
          </h3>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            {item.description}
          </p>
          <CommunityExternalLinkCard
            post={{
              externalUrl: item.externalUrl,
              externalProvider: item.externalProvider,
              postType: "admin_featured",
            }}
          />
        </article>
      ))}
    </div>
  );
}
