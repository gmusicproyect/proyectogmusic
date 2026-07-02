import { useState, type FormEvent } from "react";
import type { CommunityPostType, ExternalLinkProvider } from "../../../data/community-post-types";
import { COMMUNITY_POST_TYPE_LABELS } from "../../../data/community-post-types";
import { createCommunityPost } from "../../../services/gmusic-api/community";
import {
  buildCreateCommunityPostBody,
  mapCommunityPostApiRecord,
} from "../../../services/gmusic-api/map-community-post";
import { formatAuthFormError } from "../../../services/gmusic-api/client";
import type { CommunityPostCreateContext } from "../../../utils/community-access";
import type { CommunityPost } from "../../../data/community-post-types";

const GOLD = "#C9A84C";

const CREATE_POST_TYPES: CommunityPostType[] = ["question", "progress", "music"];

interface CommunityCreatePostFormProps {
  context: CommunityPostCreateContext;
  onCreated: (post: CommunityPost) => void;
  onCancel: () => void;
}

export function CommunityCreatePostForm({
  context,
  onCreated,
  onCancel,
}: CommunityCreatePostFormProps) {
  const [postType, setPostType] = useState<CommunityPostType>("question");
  const [content, setContent] = useState("");
  const [topicLabel, setTopicLabel] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [externalProvider, setExternalProvider] = useState<ExternalLinkProvider>("youtube");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const body = buildCreateCommunityPostBody(
        {
          postType,
          content,
          topicLabel: topicLabel || undefined,
          externalUrl: postType === "music" ? externalUrl : undefined,
          externalProvider: postType === "music" ? externalProvider : undefined,
        },
        context
      );
      const created = await createCommunityPost(body);
      onCreated(mapCommunityPostApiRecord(created));
    } catch (err) {
      setError(formatAuthFormError(err, "No pudimos publicar. Inténtalo de nuevo."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 18,
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.58)" }}>
        Publicar en <strong style={{ color: GOLD }}>{context.programLabel}</strong>
        {context.lessonNumber != null ? ` · Clase ${context.lessonNumber}` : null}
      </p>

      <label style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
        Tipo
        <select
          value={postType}
          onChange={(event) => setPostType(event.target.value as CommunityPostType)}
          style={{
            display: "block",
            width: "100%",
            marginTop: 6,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
          }}
        >
          {CREATE_POST_TYPES.map((type) => (
            <option key={type} value={type}>
              {COMMUNITY_POST_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <label style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
        Contenido
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          rows={4}
          maxLength={2000}
          placeholder="Comparte tu pregunta, progreso o enlace..."
          style={{
            display: "block",
            width: "100%",
            marginTop: 6,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            resize: "vertical",
          }}
        />
      </label>

      <label style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
        Tema (opcional)
        <input
          value={topicLabel}
          onChange={(event) => setTopicLabel(event.target.value)}
          maxLength={80}
          placeholder="Ej. Acordes, Rasgueo..."
          style={{
            display: "block",
            width: "100%",
            marginTop: 6,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
          }}
        />
      </label>

      {postType === "music" && (
        <>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            Enlace externo
            <input
              type="url"
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              required
              placeholder="https://..."
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.35)",
                color: "#fff",
              }}
            />
          </label>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            Plataforma
            <select
              value={externalProvider}
              onChange={(event) =>
                setExternalProvider(event.target.value as ExternalLinkProvider)
              }
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.35)",
                color: "#fff",
              }}
            >
              <option value="youtube">YouTube</option>
              <option value="soundcloud">SoundCloud</option>
              <option value="spotify">Spotify</option>
              <option value="drive">Drive</option>
              <option value="other">Otro</option>
            </select>
          </label>
        </>
      )}

      {error ? (
        <p style={{ margin: 0, fontSize: 13, color: "#f87171" }} role="alert">
          {error}
        </p>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: GOLD,
            color: "#0A0A0A",
            border: "none",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Publicando…" : "Publicar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            background: "transparent",
            color: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
