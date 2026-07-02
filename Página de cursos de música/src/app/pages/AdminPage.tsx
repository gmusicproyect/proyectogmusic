import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from "react";
import {
  AuthFormShell,
  authInputStyle,
  authPrimaryButtonStyle,
} from "../components/gmusic/DemoAuthGuard";
import { GM_BORDER, GM_GOLD, GM_TEXT, GM_TEXT_SEC } from "../components/gmusic/tokens";
import { useAuth } from "../hooks/useAuth";
import { GmusicApiError } from "../services/gmusic-api/client";
import {
  createAdminModule,
  fetchAdminModuleDetail,
  fetchAdminModules,
  publishAdminModule,
  updateAdminSlot,
  type AdminModuleDetailResponse,
  type AdminModuleListItem,
} from "../services/gmusic-api/admin";

interface AdminPageProps {
  setPage: (page: string) => void;
}

type AdminView =
  | { kind: "list" }
  | { kind: "detail"; moduleId: string }
  | { kind: "edit"; moduleId: string; slotOrder: number };

const panelStyle: CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  padding: "2rem 1.25rem 4rem",
  color: GM_TEXT,
};

const cardStyle: CSSProperties = {
  border: `1px solid ${GM_BORDER}`,
  borderRadius: 12,
  padding: "1rem 1.25rem",
  background: "rgba(255,255,255,0.03)",
};

function statusLabel(status: AdminModuleListItem["listStatus"]) {
  if (status === "published") return "Publicado";
  if (status === "draft") return "Borrador";
  return "Vacío";
}

function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

export function AdminPage({ setPage }: AdminPageProps) {
  const { login } = useAuth();
  const [view, setView] = useState<AdminView>({ kind: "list" });
  const [authState, setAuthState] = useState<"checking" | "ready" | "login">("checking");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("admin@gmusic.academy");
  const [loginPassword, setLoginPassword] = useState("");
  const [modules, setModules] = useState<AdminModuleListItem[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminModuleDetailResponse | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newBlockTitle, setNewBlockTitle] = useState("");
  const [slotTitle, setSlotTitle] = useState("");
  const [slotVideoUrl, setSlotVideoUrl] = useState("");
  const [slotGuideText, setSlotGuideText] = useState("");
  const [slotCompletionCriteria, setSlotCompletionCriteria] = useState("");
  const [slotCtaLabel, setSlotCtaLabel] = useState("Continuar");
  const [slotMessage, setSlotMessage] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setListError(null);
    try {
      const response = await fetchAdminModules();
      setModules(response.modules);
      setAuthState("ready");
    } catch (error) {
      if (error instanceof GmusicApiError && (error.status === 401 || error.status === 403)) {
        setAuthState("login");
        return;
      }
      setListError(
        error instanceof GmusicApiError ? error.message : "No pudimos cargar los bloques."
      );
      setAuthState("ready");
    }
  }, []);

  const loadDetail = useCallback(async (moduleId: string) => {
    setDetailError(null);
    try {
      const response = await fetchAdminModuleDetail(moduleId);
      setDetail(response);
    } catch (error) {
      setDetailError(
        error instanceof GmusicApiError ? error.message : "No pudimos cargar el bloque."
      );
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (view.kind === "detail" || view.kind === "edit") {
      void loadDetail(view.moduleId);
    }
  }, [view, loadDetail]);

  useEffect(() => {
    if (view.kind !== "edit" || !detail) return;
    const slot = detail.slots.find((entry) => entry.order === view.slotOrder);
    const node = slot?.node;
    setSlotTitle(node?.title ?? "");
    setSlotVideoUrl(node?.videoUrl ?? "");
    setSlotGuideText(node?.guideText ?? "");
    setSlotCompletionCriteria(node?.completionCriteria ?? "");
    setSlotCtaLabel(node?.ctaLabel ?? "Continuar");
    setSlotMessage(null);
  }, [view, detail]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setBusy(true);
    try {
      await login({ email: loginEmail.trim(), password: loginPassword });
      await loadList();
    } catch (error) {
      setLoginError(
        error instanceof GmusicApiError ? error.message : "No pudimos iniciar sesión."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCreateBlock = async () => {
    const title = newBlockTitle.trim();
    if (!title) return;
    setBusy(true);
    try {
      const created = await createAdminModule(title);
      setNewBlockTitle("");
      await loadList();
      setView({ kind: "detail", moduleId: created.module.id });
    } catch (error) {
      setListError(
        error instanceof GmusicApiError ? error.message : "No pudimos crear el bloque."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSaveSlot = async () => {
    if (view.kind !== "edit") return;
    setBusy(true);
    setSlotMessage(null);
    try {
      await updateAdminSlot(view.moduleId, view.slotOrder, {
        title: slotTitle,
        videoUrl: slotVideoUrl || null,
        guideText: slotGuideText || null,
        completionCriteria: slotCompletionCriteria || null,
        ctaLabel: slotCtaLabel || null,
      });
      await loadDetail(view.moduleId);
      setSlotMessage("Slot guardado como borrador.");
    } catch (error) {
      setSlotMessage(
        error instanceof GmusicApiError ? error.message : "No pudimos guardar el slot."
      );
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    if (view.kind !== "detail" || !detail) return;
    setBusy(true);
    try {
      const response = await publishAdminModule(detail.module.id);
      setDetail(response);
      await loadList();
    } catch (error) {
      setDetailError(
        error instanceof GmusicApiError ? error.message : "No pudimos publicar el bloque."
      );
    } finally {
      setBusy(false);
    }
  };

  if (authState === "checking") {
    return (
      <div style={panelStyle}>
        <p style={{ color: GM_TEXT_SEC }}>Verificando acceso de administrador…</p>
      </div>
    );
  }

  if (authState === "login") {
    return (
      <AuthFormShell
        title="Admin Creador"
        subtitle="Inicia sesión con tu cuenta ADMIN para publicar bloques."
      >
        <form onSubmit={handleLogin}>
          <label style={{ display: "block", marginBottom: "0.75rem" }}>
            <span style={{ color: GM_TEXT_SEC, fontSize: 14 }}>Correo</span>
            <input
              style={authInputStyle}
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ color: GM_TEXT_SEC, fontSize: 14 }}>Contraseña</span>
            <input
              style={authInputStyle}
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {loginError ? <p style={{ color: "#f87171", marginBottom: "1rem" }}>{loginError}</p> : null}
          <button type="submit" style={authPrimaryButtonStyle} disabled={busy}>
            Entrar al admin
          </button>
          <button
            type="button"
            style={{ ...authPrimaryButtonStyle, marginTop: "0.75rem", background: "transparent" }}
            onClick={() => setPage("home")}
          >
            Volver al inicio
          </button>
        </form>
      </AuthFormShell>
    );
  }

  if (view.kind === "edit" && detail) {
    const slot = detail.slots.find((entry) => entry.order === view.slotOrder);
    const youtubeId = slotVideoUrl ? extractYoutubeId(slotVideoUrl) : null;

    return (
      <div style={panelStyle}>
        <button
          type="button"
          onClick={() => setView({ kind: "detail", moduleId: view.moduleId })}
          style={{ color: GM_GOLD, background: "none", border: "none", cursor: "pointer" }}
        >
          ← Volver al bloque
        </button>
        <h1 style={{ marginTop: "1rem" }}>
          {detail.module.title} · {slot?.stageLabel ?? `Slot ${view.slotOrder}`}
        </h1>
        <div style={{ ...cardStyle, marginTop: "1.5rem", display: "grid", gap: "1rem" }}>
          <label>
            <span style={{ color: GM_TEXT_SEC }}>Título visible</span>
            <input style={authInputStyle} value={slotTitle} onChange={(e) => setSlotTitle(e.target.value)} />
          </label>
          <label>
            <span style={{ color: GM_TEXT_SEC }}>URL de video (YouTube)</span>
            <input
              style={authInputStyle}
              value={slotVideoUrl}
              onChange={(e) => setSlotVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>
          {youtubeId ? (
            <iframe
              title="Preview video"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              style={{ width: "100%", aspectRatio: "16 / 9", border: "none", borderRadius: 8 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : null}
          <label>
            <span style={{ color: GM_TEXT_SEC }}>Texto guía</span>
            <textarea
              style={{ ...authInputStyle, minHeight: 96, resize: "vertical" }}
              value={slotGuideText}
              onChange={(e) => setSlotGuideText(e.target.value)}
            />
          </label>
          <label>
            <span style={{ color: GM_TEXT_SEC }}>Criterio de completado</span>
            <textarea
              style={{ ...authInputStyle, minHeight: 72, resize: "vertical" }}
              value={slotCompletionCriteria}
              onChange={(e) => setSlotCompletionCriteria(e.target.value)}
            />
          </label>
          <label>
            <span style={{ color: GM_TEXT_SEC }}>CTA label</span>
            <input
              style={authInputStyle}
              value={slotCtaLabel}
              onChange={(e) => setSlotCtaLabel(e.target.value)}
            />
          </label>
          {slotMessage ? <p style={{ color: GM_TEXT_SEC }}>{slotMessage}</p> : null}
          <button type="button" style={authPrimaryButtonStyle} disabled={busy} onClick={() => void handleSaveSlot()}>
            Guardar borrador
          </button>
        </div>
      </div>
    );
  }

  if (view.kind === "detail" && detail) {
    return (
      <div style={panelStyle}>
        <button
          type="button"
          onClick={() => setView({ kind: "list" })}
          style={{ color: GM_GOLD, background: "none", border: "none", cursor: "pointer" }}
        >
          ← Lista de bloques
        </button>
        <h1 style={{ marginTop: "1rem" }}>{detail.module.title}</h1>
        <p style={{ color: GM_TEXT_SEC }}>
          {detail.completeSlots}/{detail.totalSlots} slots completos · {detail.percentComplete}%
        </p>
        {detailError ? <p style={{ color: "#f87171" }}>{detailError}</p> : null}
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1.5rem" }}>
          {detail.slots.map((slot) => (
            <button
              key={slot.order}
              type="button"
              style={{
                ...cardStyle,
                textAlign: "left",
                cursor: "pointer",
                borderColor: slot.node?.complete ? GM_GOLD : GM_BORDER,
              }}
              onClick={() => setView({ kind: "edit", moduleId: detail.module.id, slotOrder: slot.order })}
            >
              <strong>{slot.stageLabel}</strong>
              <div style={{ color: GM_TEXT_SEC, marginTop: 4 }}>
                {slot.node?.title?.trim() ? slot.node.title : "Sin título"}
                {slot.node?.complete ? " · Completo" : " · Incompleto"}
              </div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: "1.5rem" }}>
          <button
            type="button"
            style={authPrimaryButtonStyle}
            disabled={!detail.canPublish || busy}
            onClick={() => void handlePublish()}
          >
            Publicar bloque
          </button>
          {!detail.canPublish && detail.publishBlockReason ? (
            <p style={{ color: GM_TEXT_SEC, marginTop: "0.75rem" }}>{detail.publishBlockReason}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <h1>Admin Creador</h1>
      <p style={{ color: GM_TEXT_SEC }}>
        Publica bloques de 5 etapas para Mi Camino sin tocar código.
      </p>
      {listError ? <p style={{ color: "#f87171" }}>{listError}</p> : null}
      <div style={{ ...cardStyle, marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
        <input
          style={{ ...authInputStyle, flex: 1 }}
          value={newBlockTitle}
          onChange={(event) => setNewBlockTitle(event.target.value)}
          placeholder="Nuevo bloque, ej. Tu primer acorde: La menor"
        />
        <button type="button" style={authPrimaryButtonStyle} disabled={busy} onClick={() => void handleCreateBlock()}>
          Crear bloque
        </button>
      </div>
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "1.5rem" }}>
        {modules.map((module) => (
          <button
            key={module.id}
            type="button"
            style={{ ...cardStyle, textAlign: "left", cursor: "pointer" }}
            onClick={() => setView({ kind: "detail", moduleId: module.id })}
          >
            <strong>
              Bloque {module.order} · {module.title}
            </strong>
            <div style={{ color: GM_TEXT_SEC, marginTop: 4 }}>
              {statusLabel(module.listStatus)} · {module.completeSlots}/{module.totalSlots} slots ·{" "}
              {module.percentComplete}%
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
