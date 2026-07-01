import {
  COMMUNITY_FEED_FILTERS,
  type CommunityFeedFilter,
} from "../../../data/community-post-types";

const GOLD = "#C9A84C";

interface CommunityFeedFilterRowProps {
  activeFilter: CommunityFeedFilter;
  onFilterChange: (filter: CommunityFeedFilter) => void;
}

export function CommunityFeedFilterRow({
  activeFilter,
  onFilterChange,
}: CommunityFeedFilterRowProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 14,
        paddingTop: 14,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {COMMUNITY_FEED_FILTERS.map((filter) => {
        const active = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            style={{
              background: active ? "rgba(255,255,255,0.08)" : "transparent",
              border: active
                ? "1px solid rgba(201,168,76,0.35)"
                : "1px solid rgba(255,255,255,0.08)",
              color: active ? GOLD : "rgba(255,255,255,0.58)",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
