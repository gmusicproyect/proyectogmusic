import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, CircleDashed, Plus, Rocket } from "lucide-react";
import { AdminLayout } from "../components/gmusic/admin/AdminLayout";
import {
  BLOCK_STARTER_TITLES,
  STAGE_HINTS,
  computeAdminStats,
  extractYoutubeId,
  statusLabel,
} from "../components/gmusic/admin/admin-utils";
import {
  AuthFormShell,
  authInputStyle,
  authPrimaryButtonStyle,
} from "../components/gmusic/DemoAuthGuard";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import { loginAccount, logoutAccount } from "../services/gmusic-api/auth";
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
import "./admin-page.css";

interface AdminPageProps {
  setPage: (page: string) => void;
}

type AdminView =
  | { kind: "list" }
  | { kind: "detail"; moduleId: string }
  | { kind: "edit"; moduleId: string; slotOrder: number };

type Toast = { message: string; tone: "success" | "error" } | null;

function listStatusBadgeVariant(status: AdminModuleListItem["listStatus"]) {
  if (status === "published") return "default" as const;
  if (status === "draft") return "secondary" as const;
  return "outline" as const;
}

function AdminLoading({ message }: { message: string }) {
  return (
    <div className="admin-loading" role="status">
      <span className="admin-loading__dot" aria-hidden="true" />
      <span className="admin-loading__dot" aria-hidden="true" />
      <span className="admin-loading__dot" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export function AdminPage({ setPage }: AdminPageProps) {
  const [view, setView] = useState<AdminView>({ kind: "list" });
  const [authState, setAuthState] = useState<"checking" | "ready" | "login">("checking");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("admin@gmusic.academy");
  const [loginPassword, setLoginPassword] = useState("");
  const [modules, setModules] = useState<AdminModuleListItem[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminModuleDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [newBlockTitle, setNewBlockTitle] = useState("");

  const [slotTitle, setSlotTitle] = useState("");
  const [slotVideoUrl, setSlotVideoUrl] = useState("");
  const [slotGuideText, setSlotGuideText] = useState("");
  const [slotCompletionCriteria, setSlotCompletionCriteria] = useState("");
  const [slotCtaLabel, setSlotCtaLabel] = useState("Continuar");

  const stats = useMemo(() => computeAdminStats(modules), [modules]);

  const activeModuleId =
    view.kind === "detail" || view.kind === "edit" ? view.moduleId : null;
  const activeModuleTitle =
    detail?.module.id === activeModuleId ? detail.module.title : modules.find((m) => m.id === activeModuleId)?.title ?? null;

  const navView = view.kind === "list" ? "list" : view.kind === "edit" ? "edit" : "detail";

  const showToast = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

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
    setDetailLoading(true);
    try {
      const response = await fetchAdminModuleDetail(moduleId);
      setDetail(response);
    } catch (error) {
      setDetailError(
        error instanceof GmusicApiError ? error.message : "No pudimos cargar el bloque."
      );
    } finally {
      setDetailLoading(false);
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
  }, [view, detail]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setBusy(true);
    try {
      await loginAccount({ email: loginEmail.trim(), password: loginPassword });
      await loadList();
    } catch (error) {
      setLoginError(
        error instanceof GmusicApiError ? error.message : "Correo o contraseña incorrectos."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAccount();
    } catch {
      // Si falla el logout remoto, igual volvemos al login local.
    }
    setView({ kind: "list" });
    setDetail(null);
    setAuthState("login");
  };

  const handleCreateBlock = async (event?: FormEvent, titleOverride?: string) => {
    event?.preventDefault();
    const title = (titleOverride ?? newBlockTitle).trim();
    if (!title) return;
    setBusy(true);
    try {
      const created = await createAdminModule(title);
      setNewBlockTitle("");
      await loadList();
      setView({ kind: "detail", moduleId: created.module.id });
      showToast("Bloque creado — completa las 5 etapas.");
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
    if (!slotTitle.trim()) {
      showToast("La etapa necesita un título visible.", "error");
      return;
    }
    if (!slotCompletionCriteria.trim()) {
      showToast("Agrega un criterio de completado para publicar después.", "error");
      return;
    }
    setBusy(true);
    try {
      await updateAdminSlot(view.moduleId, view.slotOrder, {
        title: slotTitle,
        videoUrl: slotVideoUrl || null,
        guideText: slotGuideText || null,
        completionCriteria: slotCompletionCriteria || null,
        ctaLabel: slotCtaLabel || null,
      });
      await loadDetail(view.moduleId);
      await loadList();
      showToast("Etapa guardada como borrador.");
    } catch (error) {
      showToast(
        error instanceof GmusicApiError ? error.message : "No pudimos guardar la etapa.",
        "error"
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
      showToast("¡Bloque publicado! Ya visible en Mi Camino.");
    } catch (error) {
      setDetailError(
        error instanceof GmusicApiError ? error.message : "No pudimos publicar el bloque."
      );
    } finally {
      setBusy(false);
    }
  };

  const toastNode = toast ? (
    <div
      className={`admin-toast${toast.tone === "error" ? " admin-toast--error" : ""}`}
      role="status"
    >
      {toast.message}
    </div>
  ) : null;

  if (authState === "checking") {
    return (
      <div className="admin-app admin-app--standalone">
        <AdminLoading message="Verificando acceso de administrador…" />
      </div>
    );
  }

  if (authState === "login") {
    return (
      <>
        <AuthFormShell
          title="Admin Creador"
          subtitle="Publica bloques de 5 etapas para Mi Camino — sin tocar código."
        >
          <form onSubmit={handleLogin}>
            <label style={{ display: "block", marginBottom: "0.75rem" }}>
              <span style={{ color: "#A0A0A5", fontSize: 14 }}>Correo</span>
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
              <span style={{ color: "#A0A0A5", fontSize: 14 }}>Contraseña</span>
              <input
                style={authInputStyle}
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {loginError ? (
              <p style={{ color: "#f87171", marginBottom: "1rem", fontSize: 14 }}>{loginError}</p>
            ) : null}
            <button type="submit" style={authPrimaryButtonStyle} disabled={busy}>
              {busy ? "Entrando…" : "Entrar al admin"}
            </button>
            <button
              type="button"
              style={{ ...authPrimaryButtonStyle, marginTop: "0.75rem", background: "transparent" }}
              onClick={() => setPage("home")}
            >
              Volver al inicio
            </button>
            <p className="admin-login-hint">
              Cuenta seed local: <strong>admin@gmusic.academy</strong>
              <br />
              Tras <code>npx prisma db seed</code>: contraseña <strong>GmusicAdmin2026!</strong>
            </p>
          </form>
        </AuthFormShell>
        {toastNode}
      </>
    );
  }

  const renderBreadcrumb = () => (
    <Breadcrumb className="admin-page-breadcrumb">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <button type="button" className="admin-breadcrumb-btn" onClick={() => setView({ kind: "list" })}>
              Bloques
            </button>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {view.kind !== "list" && detail ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {view.kind === "edit" ? (
                <BreadcrumbLink asChild>
                  <button
                    type="button"
                    className="admin-breadcrumb-btn"
                    onClick={() => setView({ kind: "detail", moduleId: detail.module.id })}
                  >
                    {detail.module.title}
                  </button>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{detail.module.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        ) : null}
        {view.kind === "edit" && detail ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {detail.slots.find((s) => s.order === view.slotOrder)?.stageLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );

  const renderList = () => (
    <>
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Panel de materia</p>
          <h1 className="admin-title">Tus bloques de guitarra</h1>
          <p className="admin-subtitle">
            Cada bloque = 5 etapas fijas. Publica sin pedir un commit a Cursor.
          </p>
        </div>
      </header>

      <div className="admin-stats-grid">
        <Card className="admin-stat-card">
          <CardHeader className="pb-2">
            <CardDescription>Total bloques</CardDescription>
            <CardTitle className="admin-stat-value">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="admin-stat-card">
          <CardHeader className="pb-2">
            <CardDescription>Publicados</CardDescription>
            <CardTitle className="admin-stat-value admin-stat-value--green">{stats.published}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="admin-stat-card">
          <CardHeader className="pb-2">
            <CardDescription>En borrador</CardDescription>
            <CardTitle className="admin-stat-value admin-stat-value--gold">{stats.draft}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {listError ? (
        <Alert variant="destructive" className="admin-alert">
          <AlertDescription>{listError}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="admin-panel-card">
        <CardHeader>
          <CardTitle className="admin-card-title">Nuevo bloque</CardTitle>
          <CardDescription>Empieza con un título alineado al mapa D-GOV-04.</CardDescription>
        </CardHeader>
        <CardContent className="admin-create-section">
          <form className="admin-create-form" onSubmit={handleCreateBlock}>
            <Input
              value={newBlockTitle}
              onChange={(event) => setNewBlockTitle(event.target.value)}
              placeholder="Ej. Tu primer acorde: La menor"
              aria-label="Título del nuevo bloque"
              className="admin-shadcn-input"
            />
            <Button type="submit" disabled={busy || !newBlockTitle.trim()} className="admin-gold-btn">
              <Plus aria-hidden="true" />
              Crear bloque
            </Button>
          </form>
          <div className="admin-starters">
            <p className="admin-starters__label">Atajos sugeridos</p>
            <div className="admin-starters__chips">
              {BLOCK_STARTER_TITLES.map((title) => (
                <Button
                  key={title}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="admin-starter-chip"
                  disabled={busy}
                  onClick={() => void handleCreateBlock(undefined, title)}
                >
                  {title}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {modules.length === 0 ? (
        <Card className="admin-panel-card admin-empty-card">
          <CardContent className="admin-empty-card__body">
            <div className="admin-empty__icon" aria-hidden="true">
              🎸
            </div>
            <p className="admin-empty__title">Aún no hay bloques</p>
            <p className="admin-empty__text">
              Crea tu primer bloque post-demo o usa un atajo sugerido arriba.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="admin-panel-card">
          <CardHeader>
            <CardTitle className="admin-card-title">Biblioteca de bloques</CardTitle>
            <CardDescription>Haz clic en una fila para editar las 5 etapas.</CardDescription>
          </CardHeader>
          <CardContent className="admin-table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => {
                  const pct =
                    module.totalSlots > 0
                      ? Math.round((module.completeSlots / module.totalSlots) * 100)
                      : 0;
                  return (
                    <TableRow
                      key={module.id}
                      className="admin-table-row"
                      onClick={() => setView({ kind: "detail", moduleId: module.id })}
                    >
                      <TableCell className="admin-table-num">B{module.order}</TableCell>
                      <TableCell className="admin-table-title">{module.title}</TableCell>
                      <TableCell>
                        <div className="admin-table-progress">
                          <Progress value={pct} className="admin-progress-bar" />
                          <span className="admin-table-progress-label">
                            {module.completeSlots}/{module.totalSlots}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={listStatusBadgeVariant(module.listStatus)}>
                          {statusLabel(module.listStatus)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );

  const renderDetail = () => {
    if (detailLoading || !detail) {
      return <AdminLoading message="Cargando bloque…" />;
    }

    const pct =
      detail.totalSlots > 0
        ? Math.round((detail.completeSlots / detail.totalSlots) * 100)
        : 0;

    return (
      <>
        {renderBreadcrumb()}
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Bloque {detail.module.order}</p>
            <h1 className="admin-title">{detail.module.title}</h1>
            <p className="admin-subtitle">
              Completa las 5 etapas del microciclo antes de publicar en Mi Camino.
            </p>
          </div>
          <Badge variant={detail.module.status === "PUBLISHED" ? "default" : "secondary"}>
            {detail.module.status === "PUBLISHED" ? "Publicado" : "Borrador"}
          </Badge>
        </header>

        <Card className="admin-panel-card admin-progress-card">
          <CardContent className="admin-progress-card__body">
            <div className="admin-progress-card__meta">
              <span>{detail.completeSlots} de {detail.totalSlots} etapas listas</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="admin-progress-bar" />
          </CardContent>
        </Card>

        {detailError ? (
          <Alert variant="destructive" className="admin-alert">
            <AlertDescription>{detailError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="admin-stage-grid admin-stage-grid--pipeline">
          {detail.slots.map((slot) => (
            <button
              key={slot.order}
              type="button"
              className={`admin-stage-tile${slot.node?.complete ? " admin-stage-tile--complete" : ""}`}
              onClick={() =>
                setView({ kind: "edit", moduleId: detail.module.id, slotOrder: slot.order })
              }
            >
              <span className="admin-stage-tile__num">{slot.order}</span>
              <span className="admin-stage-tile__label">{slot.stageLabel}</span>
              <span className="admin-stage-tile__title">
                {slot.node?.title?.trim() ? slot.node.title : "Sin título aún"}
              </span>
              <span className="admin-stage-tile__status">
                {slot.node?.complete ? (
                  <>
                    <CheckCircle2 aria-hidden="true" /> Lista
                  </>
                ) : (
                  <>
                    <CircleDashed aria-hidden="true" /> Pendiente
                  </>
                )}
              </span>
            </button>
          ))}
        </div>

        <Card className="admin-panel-card admin-publish-card">
          <CardContent className="admin-publish-card__body">
            <div>
              <p className="admin-publish-card__title">Publicación</p>
              <p className="admin-publish-card__copy">
                {detail.canPublish
                  ? "Las 5 etapas están completas. Al publicar, el bloque aparece en Mi Camino."
                  : detail.publishBlockReason ?? "Completa todas las etapas para publicar."}
              </p>
            </div>
            <Button
              className="admin-gold-btn"
              disabled={!detail.canPublish || busy}
              onClick={() => void handlePublish()}
            >
              <Rocket aria-hidden="true" />
              {busy ? "Publicando…" : "Publicar bloque"}
            </Button>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderEdit = () => {
    if (view.kind !== "edit") return null;
    const editView = view;

    if (!detail) return <AdminLoading message="Cargando etapa…" />;
    const slot = detail.slots.find((entry) => entry.order === editView.slotOrder);
    const youtubeId = slotVideoUrl ? extractYoutubeId(slotVideoUrl) : null;

    return (
      <>
        {renderBreadcrumb()}
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">
              Etapa {editView.slotOrder} de 5 · {detail.module.title}
            </p>
            <h1 className="admin-title">{slot?.stageLabel ?? `Etapa ${editView.slotOrder}`}</h1>
            <p className="admin-subtitle">{STAGE_HINTS[editView.slotOrder]}</p>
          </div>
        </header>

        <Card className="admin-panel-card">
          <CardContent className="admin-form-stack">
            <div className="admin-form-field">
              <Label htmlFor="slot-title">Título visible para el alumno</Label>
              <Input
                id="slot-title"
                className="admin-shadcn-input"
                value={slotTitle}
                onChange={(e) => setSlotTitle(e.target.value)}
                placeholder="Ej. Qué es un acorde y por qué Am es la puerta"
              />
            </div>

            <div className="admin-form-field">
              <Label htmlFor="slot-video">Video (URL YouTube)</Label>
              <p className="admin-field-hint">Opcional — puedes publicar sin video al inicio.</p>
              <Input
                id="slot-video"
                className="admin-shadcn-input"
                value={slotVideoUrl}
                onChange={(e) => setSlotVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {youtubeId ? (
                <div className="admin-video-preview">
                  <iframe
                    title="Preview video"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : null}
            </div>

            <div className="admin-form-field">
              <Label htmlFor="slot-guide">Texto guía</Label>
              <Textarea
                id="slot-guide"
                className="admin-shadcn-textarea"
                value={slotGuideText}
                onChange={(e) => setSlotGuideText(e.target.value)}
                placeholder="Qué observar, qué practicar, qué escuchar…"
                rows={4}
              />
            </div>

            <div className="admin-form-field">
              <Label htmlFor="slot-criteria">Criterio de completado</Label>
              <p className="admin-field-hint">Obligatorio para publicar el bloque.</p>
              <Textarea
                id="slot-criteria"
                className="admin-shadcn-textarea"
                value={slotCompletionCriteria}
                onChange={(e) => setSlotCompletionCriteria(e.target.value)}
                placeholder="Ej. Am suena limpio 4 tiempos al pulso"
                rows={3}
              />
            </div>

            <div className="admin-form-field">
              <Label htmlFor="slot-cta">Texto del botón (CTA)</Label>
              <Input
                id="slot-cta"
                className="admin-shadcn-input"
                value={slotCtaLabel}
                onChange={(e) => setSlotCtaLabel(e.target.value)}
              />
            </div>

            <div className="admin-form-actions">
              <Button variant="outline" onClick={() => setView({ kind: "detail", moduleId: editView.moduleId })}>
                Cancelar
              </Button>
              <Button className="admin-gold-btn" disabled={busy} onClick={() => void handleSaveSlot()}>
                {busy ? "Guardando…" : "Guardar borrador"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  let content: ReactNode;
  if (view.kind === "list") content = renderList();
  else if (view.kind === "detail") content = renderDetail();
  else content = renderEdit();

  return (
    <AdminLayout
      setPage={setPage}
      navView={navView}
      modules={modules}
      activeModuleId={activeModuleId}
      activeModuleTitle={activeModuleTitle}
      onGoList={() => setView({ kind: "list" })}
      onGoModule={(moduleId) => setView({ kind: "detail", moduleId })}
      onLogout={() => void handleLogout()}
      toast={toastNode}
    >
      {content}
    </AdminLayout>
  );
}
