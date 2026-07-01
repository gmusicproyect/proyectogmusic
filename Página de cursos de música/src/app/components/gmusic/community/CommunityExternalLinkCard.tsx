import type { CommunityPost } from "../../../data/community-post-types";
import {
  externalLinkCardCopy,
  type ExternalLinkCardCopy,
} from "../../../utils/community-external-link";

const GOLD = "#C9A84C";

interface CommunityExternalLinkCardProps {
  post: Pick<CommunityPost, "externalUrl" | "externalProvider" | "postType">;
  onOpen?: (provider: string) => void;
}

function resolveCopy(post: CommunityExternalLinkCardProps["post"]): ExternalLinkCardCopy | null {
  if (!post.externalUrl) return null;
  const provider = post.externalProvider ?? "other";
  const postType =
    post.postType === "music"
      ? "music"
      : post.postType === "admin_featured"
        ? "admin_featured"
        : "progress";
  return externalLinkCardCopy(provider, postType);
}

export function CommunityExternalLinkCard({ post, onOpen }: CommunityExternalLinkCardProps) {
  const copy = resolveCopy(post);
  if (!post.externalUrl || !copy) return null;

  return (
    <a
      href={post.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onOpen?.(copy.provider)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 16,
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        textDecoration: "none",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>
          {copy.headline}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{copy.provider}</div>
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#0A0A0A",
          background: GOLD,
          padding: "6px 12px",
          borderRadius: 999,
          whiteSpace: "nowrap",
        }}
      >
        {copy.ctaLabel}
      </span>
    </a>
  );
}
