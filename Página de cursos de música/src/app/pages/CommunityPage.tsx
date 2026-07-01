import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CommunityAdminCuratedPanel } from "../components/gmusic/community/CommunityAdminCuratedPanel";
import { CommunityConductModal } from "../components/gmusic/community/CommunityConductModal";
import { CommunityFeedFilterRow } from "../components/gmusic/community/CommunityFeedFilterRow";
import { CommunityLevelBadge } from "../components/gmusic/community/CommunityLevelBadge";
import { CommunityMentorshipPanel } from "../components/gmusic/community/CommunityMentorshipPanel";
import { CommunityPeersPanel } from "../components/gmusic/community/CommunityPeersPanel";
import { CommunityPostCard } from "../components/gmusic/community/CommunityPostCard";
import { COMMUNITY_LEVEL_LABELS } from "../data/community-level";
import {
  filterCommunityPostsForFeed,
  shouldShowCuratedInFeed,
  type CommunityFeedFilter,
  type CommunityPost,
} from "../data/community-post-types";
import {
  curatedForLevel,
  DEFAULT_MENTORSHIP_PROGRESS,
  peersForLevel,
} from "../data/mock-community-data";
import { MOCK_COMMUNITY_POSTS } from "../data/mock-community-posts";
import { buildCommunityPostCreateContext } from "../utils/community-access";
import type { CommunityEnrollment } from "../utils/community-enrollment";
import { analytics } from "../utils/analytics";
import { getStudentCommunityLevel } from "../utils/get-student-community-level";

interface CommunityPageProps {
  setPage: (page: string) => void;
  embedded?: boolean;
  enrollment?: CommunityEnrollment | null;
  enrollmentLoading?: boolean;
}

const GOLD = "#C9A84C";

export function CommunityPage({
  setPage: _setPage,
  embedded = false,
  enrollment = null,
  enrollmentLoading = false,
}: CommunityPageProps) {
  const studentLevel = getStudentCommunityLevel(enrollment);
  const [feedFilter, setFeedFilter] = useState<CommunityFeedFilter>("all");
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showConduct, setShowConduct] = useState(false);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (enrollmentLoading || !enrollment || viewedRef.current) return;
    viewedRef.current = true;
    analytics.communityViewed(studentLevel, enrollment.programLabel);
  }, [studentLevel, enrollment, enrollmentLoading]);

  const postCreateContext = useMemo(
    () => (enrollment ? buildCommunityPostCreateContext(enrollment) : null),
    [enrollment]
  );

  const visiblePosts = useMemo(
    () => filterCommunityPostsForFeed(posts, studentLevel, feedFilter),
    [posts, studentLevel, feedFilter]
  );

  const peers = useMemo(() => peersForLevel(studentLevel), [studentLevel]);
  const curatedItems = useMemo(() => curatedForLevel(studentLevel), [studentLevel]);

  const handleLike = (postId: string) => {
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked,
        };
      })
    );
  };

  const levelSubtitle = enrollmentLoading
    ? "Cargando…"
    : enrollment
      ? `${enrollment.programLabel} · Clase ${enrollment.currentLessonNumber ?? "—"}`
      : "Comunidad por nivel";

  const curatedPlacement = shouldShowCuratedInFeed(feedFilter);

  const handlePostAction = useCallback((postId: string) => {
    analytics.commentCreated(postId);
  }, []);

  const emptyFeedMessage =
    feedFilter === "all"
      ? `Aún no hay publicaciones en Comunidad ${COMMUNITY_LEVEL_LABELS[studentLevel]}. Sé el primero en compartir una pregunta, tu progreso o música.`
      : `No hay publicaciones para este filtro en ${COMMUNITY_LEVEL_LABELS[studentLevel]}.`;

  return (
    <div className={embedded ? "community-page" : undefined}>
      <header className={embedded ? "community-toolbar" : undefined}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "20px clamp(16px,4vw,40px)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 600, color: "#fff", margin: 0, marginBottom: 4 }}>
                Comunidad
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.58)", margin: 0 }}>{levelSubtitle}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShowConduct(true)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                  padding: "10px 14px",
                  borderRadius: 999,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Reglas
              </button>
              <button
                type="button"
                onClick={() => setShowCreatePost(!showCreatePost)}
                style={{
                  background: GOLD,
                  color: "#0A0A0A",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Crear publicación
              </button>
            </div>
          </div>

          <CommunityLevelBadge enrollment={enrollment} loading={enrollmentLoading} />

          <CommunityFeedFilterRow activeFilter={feedFilter} onFilterChange={setFeedFilter} />
        </div>
      </header>

      <div
        className={embedded ? "community-page__content" : undefined}
        style={
          embedded
            ? {
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) 300px",
                gap: 28,
              }
            : {
                maxWidth: 1120,
                margin: "0 auto",
                padding: "28px clamp(16px,4vw,40px) 48px",
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) 300px",
                gap: 28,
              }
        }
      >
        <main>
          {curatedPlacement === "top" && (
            <CommunityAdminCuratedPanel items={curatedItems} />
          )}

          {showCreatePost && postCreateContext && (
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 18,
                marginBottom: 20,
                fontSize: 13,
                color: "rgba(255,255,255,0.58)",
              }}
            >
              Formulario de publicación — ciclo C2. Se guardará automáticamente en{" "}
              <strong style={{ color: GOLD }}>{COMMUNITY_LEVEL_LABELS[postCreateContext.level]}</strong>
              {" · "}
              {postCreateContext.instrument}
              {postCreateContext.lessonNumber != null
                ? ` · Clase ${postCreateContext.lessonNumber}`
                : null}
              .
            </div>
          )}

          {visiblePosts.length === 0 &&
          !(curatedPlacement === "bottom" && curatedItems.length > 0) ? (
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14,
                padding: 28,
                textAlign: "center",
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              {emptyFeedMessage}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {visiblePosts.map((post, index) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  index={index}
                  onLike={() => handleLike(post.id)}
                  onPostAction={handlePostAction}
                  onExternalLinkOpen={(provider) =>
                    analytics.externalLinkClicked(provider, post.postType)
                  }
                />
              ))}
            </div>
          )}

          {curatedPlacement === "bottom" && curatedItems.length > 0 && (
            <div style={{ marginTop: visiblePosts.length > 0 ? 28 : 0 }}>
              <CommunityAdminCuratedPanel items={curatedItems} />
            </div>
          )}
        </main>

        <aside>
          <CommunityPeersPanel level={studentLevel} peers={peers} loading={enrollmentLoading} />
          <CommunityMentorshipPanel progress={DEFAULT_MENTORSHIP_PROGRESS} />
        </aside>
      </div>

      <CommunityConductModal open={showConduct} onClose={() => setShowConduct(false)} />
    </div>
  );
}
