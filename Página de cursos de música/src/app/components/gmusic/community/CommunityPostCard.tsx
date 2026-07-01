import { motion } from "motion/react";
import { Avatar } from "../../ui/avatar";
import { COMMUNITY_LEVEL_LABELS } from "../../../data/community-level";
import {
  COMMUNITY_POST_TYPE_LABELS,
  FEEDBACK_CATEGORY_LABELS,
  communityPostActionLabel,
  type CommunityPost,
} from "../../../data/community-post-types";
import { CommunityExternalLinkCard } from "./CommunityExternalLinkCard";

const GOLD = "#C9A84C";

const POST_TYPE_COLORS: Record<
  CommunityPost["postType"],
  { bg: string; border: string; color: string }
> = {
  question: { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", color: "#E5E5E5" },
  progress: { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", color: "#D4D4D4" },
  music: { bg: "rgba(201,168,76,0.1)", border: "rgba(201,168,76,0.22)", color: GOLD },
  feedback: { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", color: "#D4D4D4" },
  collaboration: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)", color: "#999" },
  admin_featured: { bg: "rgba(201,168,76,0.12)", border: "rgba(201,168,76,0.28)", color: GOLD },
};

interface CommunityPostCardProps {
  post: CommunityPost;
  index: number;
  onLike: () => void;
  onPostAction?: (postId: string, action: string) => void;
  onExternalLinkOpen?: (provider: string) => void;
}

export function CommunityPostCard({
  post,
  index,
  onLike,
  onPostAction,
  onExternalLinkOpen,
}: CommunityPostCardProps) {
  const colors = POST_TYPE_COLORS[post.postType];
  const actionLabel = communityPostActionLabel(post.postType);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <Avatar src={post.authorImage} alt={post.author} size="medium" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{post.author}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {post.instrument} · {COMMUNITY_LEVEL_LABELS[post.level]} · {post.timeAgo}
          </div>
        </div>
        <span
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.color,
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {COMMUNITY_POST_TYPE_LABELS[post.postType]}
        </span>
      </div>

      {(post.lessonNumber || post.topicLabel) && (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", margin: "0 0 10px" }}>
          {post.lessonNumber ? `Clase ${post.lessonNumber}` : null}
          {post.lessonNumber && post.topicLabel ? " · " : null}
          {post.topicLabel ? `Tema: ${post.topicLabel}` : null}
        </p>
      )}

      <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
        {post.content}
      </p>

      {post.feedbackCategories && post.feedbackCategories.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {post.feedbackCategories.map((category) => (
            <span
              key={category}
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 999,
                padding: "3px 8px",
              }}
            >
              {FEEDBACK_CATEGORY_LABELS[category]}
            </span>
          ))}
        </div>
      )}

      <CommunityExternalLinkCard post={post} onOpen={onExternalLinkOpen} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          paddingTop: 14,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontSize: 13,
          color: "rgba(255,255,255,0.55)",
        }}
      >
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <button
            type="button"
            onClick={onLike}
            style={{
              background: "transparent",
              border: "none",
              color: post.isLiked ? "#EF4444" : "inherit",
              cursor: "pointer",
              padding: 0,
              fontSize: 13,
            }}
          >
            ♥ {post.likes}
          </button>
          <span>💬 {post.comments}</span>
        </div>
        {actionLabel && (
          <button
            type="button"
            onClick={() => onPostAction?.(post.id, actionLabel)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.78)",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </motion.article>
  );
}
