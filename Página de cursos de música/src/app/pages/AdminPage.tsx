import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, CircleDashed, FileText, Plus, Rocket, Trash2, XCircle } from "lucide-react";
import { AdminLayout } from "../components/gmusic/admin/AdminLayout";
import {
  BLOCK_STARTER_TITLES,
  STAGE_HINTS,
  computeAdminStats,
  extractYoutubeId,
  isSafeMaterialUrl,
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
  deleteAdminModule,
  fetchAdminModuleDetail,
  fetchAdminModules,
  fetchAdminNodeAttempts,
  publishAdminModule,
  updateAdminSlot,
  type AdminModuleDetailResponse,
  type AdminModuleListItem,
  type AdminNodeAttemptsResponse,
} from "../services/gmusic-api/admin";
import "./admin-page.css";

interface AdminPageProps {
  setPage: (page: string) => void;
}

type AdminView =
  | { kind: "list" }
  | { kind: "detail"; moduleId: string }
  | { kind: "edit"; moduleId: string; slotOrder: number }
  | { kind: "attempts"; moduleId: string; nodeId: string; slotOrder: number };

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
  const [slotGuidePdfUrl, setSlotGuidePdfUrl] = useState("");
  const [slotGuideText, setSlotGuideText] = useState("");
  const [slotCompletionCriteria, setSlotCompletionCriteria] = useState("");
  const [slotCtaLabel, setSlotCtaLabel] = useState("Continuar");
  const [attemptsData, setAttemptsData] = useState<AdminNodeAttemptsResponse | null>(null);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const stats = useMemo(() => computeAdminStats(modules), [modules]);

  const activeModuleId =
    view.kind === "detail" || view.kind === "edit" || view.kind === "attempts"
      ? view.moduleId
      : null;
  const activeModuleTitle =
    detail?.module.id === activeModuleId ? detail.module.title : modules.find((m) => m.id === activeModuleId)?.title ?? null;

  const navView =
    view.kind === "list"
      ? "list"
      : view.kind === "edit"
        ? "edit"
        : view.kind === "attempts"
          ? "attempts"
          : "detail";

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
    setDetail(null);
    try {
      const response = await fetchAdminModuleDetail(moduleId);
      setDetail(response);
    } catch (error) {
      setDetail(null);
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
    if (view.kind === "detail" || view.kind === "edit" || view.kind === "attempts") {
      void loadDetail(view.moduleId);
    }
  }, [view, loadDetail]);

  const loadAttempts = useCallback(async (nodeId: string) => {
    setAttemptsError(null);
    setAttemptsLoading(true);
    try {
      const response = await fetchAdminNodeAttempts(nodeId);
      setAttemptsData(response);
    } catch (error) {
      setAttemptsError(
        error instanceof GmusicApiError ? error.message : "No pudimos cargar las respuestas."
      );
      setAttemptsData(null);
    } finally {
      setAttemptsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view.kind === "attempts") {
      void loadAttempts(view.nodeId);
    }
  }, [view, loadAttempts]);

  useEffect(() => {
    if (view.kind !== "detail") {
      setDeleteConfirming(false);
      setDeleteError(null);
    }
  }, [view]);

  useEffect(() => {
    if (view.kind !== "edit" || !detail) return;
    const slot = detail.slots.find((entry) => entry.order === view.slotOrder);
    const node = slot?.node;
    setSlotTitle(node?.title ?? "");
    setSlotVideoUrl(node?.videoUrl ?? "");
    setSlotGuidePdfUrl(node?.guidePdfUrl ?? "");
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

    const existing = modules.find(
      (module) => module.title.localeCompare(title, "es", { sensitivity: "accent" }) === 0
    );
    if (existing) {
      setNewBlockTitle("");
      setView({ kind: "detail", moduleId: existing.id });
      showToast(`"${existing.title}" ya existe (B${existing.order}) — abriéndolo para editar.`);
      return;
    }

    setBusy(true);
    setListError(null);
    try {
      const created = await createAdminModule(title);
      setNewBlockTitle("");
      await loadList();
      setView({ kind: "detail", moduleId: created.module.id });
      showToast("Bloque creado — completa las 5 etapas.");
    } catch (error) {
      const message =
        error instanceof GmusicApiError ? error.message : "No pudimos crear el bloque.";
      setListError(message);
      showToast(message, "error");
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
        guidePdfUrl: slotGuidePdfUrl || null,
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

  const handleDeleteBlock = async (): Promise<boolean> => {
    if (view.kind !== "detail" || !detail) {
      setDeleteError("No pudimos leer el bloque. Vuelve a abrirlo e intenta de nuevo.");
      return false;
    }
    if (detail.module.status === "PUBLISHED") {
      const message = "Solo puedes eliminar bloques en borrador.";
      setDeleteError(message);
      showToast(message, "error");
      return false;
    }

    const deletedTitle = detail.module.title;
    setDeleteError(null);
    setDeleteBusy(true);
    try {
      await deleteAdminModule(detail.module.id);
      setDetail(null);
      setDetailError(null);
      setDeleteConfirming(false);
      await loadList();
      setView({ kind: "list" });
      showToast(`Bloque «${deletedTitle}» eliminado.`);
      return true;
    } catch (error) {
      const message =
        error instanceof GmusicApiError
          ? error.message
          : "No pudimos eliminar el bloque. ¿Está corriendo la API local?";
      setDeleteError(message);
      showToast(message, "error");
      return false;
    } finally {
      setDeleteBusy(false);
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
              {view.kind === "edit" || view.kind === "attempts" ? (
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
        {view.kind === "attempts" && detail ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                Respuestas · {detail.slots.find((s) => s.order === view.slotOrder)?.stageLabel}
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
          <CardDescription>
            Escribe un título y pulsa Crear — o usa un atajo. Si el bloque ya está en la tabla
            de abajo, haz clic en esa fila para editarlo (no hace falta crearlo de nuevo).
          </CardDescription>
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
            <CardDescription>
              Haz clic en una fila (o en Recientes del menú lateral) para abrir el bloque y
              completar sus 5 etapas.
            </CardDescription>
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
                      role="button"
                      tabIndex={0}
                      onClick={() => setView({ kind: "detail", moduleId: module.id })}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setView({ kind: "detail", moduleId: module.id });
                        }
                      }}
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
    if (view.kind !== "detail") return null;

    if (detailLoading) {
      return <AdminLoading message="Cargando bloque…" />;
    }

    if (detailError && (!detail || detail.module.id !== view.moduleId)) {
      return (
        <>
          <Alert variant="destructive" className="admin-alert">
            <AlertDescription>{detailError}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => void loadDetail(view.moduleId)}>
            Reintentar
          </Button>
          <Button variant="ghost" className="admin-ml-btn" onClick={() => setView({ kind: "list" })}>
            Volver a la lista
          </Button>
        </>
      );
    }

    if (!detail || detail.module.id !== view.moduleId) {
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

        <Card className="admin-panel-card admin-evaluation-card">
          <CardHeader>
            <CardTitle className="admin-card-title">Evaluación</CardTitle>
            <CardDescription>
              Respuestas de ejercicios por etapa — quién acertó y quién no (solo lectura).
            </CardDescription>
          </CardHeader>
          <CardContent className="admin-evaluation-card__body">
            {detail.slots.map((slot) =>
              slot.node ? (
                <Button
                  key={slot.order}
                  variant="outline"
                  className="admin-evaluation-chip"
                  onClick={() =>
                    setView({
                      kind: "attempts",
                      moduleId: detail.module.id,
                      nodeId: slot.node!.id,
                      slotOrder: slot.order,
                    })
                  }
                >
                  Etapa {slot.order} · {slot.stageLabel}
                </Button>
              ) : null
            )}
          </CardContent>
        </Card>

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

        {detail.module.status !== "PUBLISHED" ? (
          <Card className="admin-panel-card admin-delete-card">
            <CardContent className="admin-delete-card__body">
              <div className="admin-delete-card__text">
                <p className="admin-delete-card__title">Eliminar borrador</p>
                <p className="admin-delete-card__copy">
                  Quita este bloque de la biblioteca. Solo disponible mientras esté en borrador
                  y sin actividad de alumnos.
                </p>
              </div>
              {deleteConfirming ? (
                <div className="admin-delete-confirm">
                  <p className="admin-delete-confirm__prompt">
                    ¿Eliminar «{detail.module.title}»? Se borran las 5 etapas. No se puede deshacer.
                  </p>
                  {deleteError ? (
                    <p className="admin-delete-confirm__error" role="alert">
                      {deleteError}
                    </p>
                  ) : null}
                  <div className="admin-delete-confirm__actions">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={deleteBusy}
                      onClick={() => {
                        setDeleteConfirming(false);
                        setDeleteError(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="admin-delete-btn"
                      disabled={deleteBusy}
                      onClick={() => void handleDeleteBlock()}
                    >
                      {deleteBusy ? "Eliminando…" : "Sí, eliminar"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  className="admin-delete-btn"
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteConfirming(true);
                  }}
                >
                  <Trash2 aria-hidden="true" />
                  <span>Eliminar bloque</span>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : null}
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
              <Label htmlFor="slot-pdf">Material PDF (URL)</Label>
              <p className="admin-field-hint">
                Opcional — enlace https a PDF (Drive, Dropbox, Supabase Storage…).
              </p>
              <Input
                id="slot-pdf"
                className="admin-shadcn-input"
                value={slotGuidePdfUrl}
                onChange={(e) => setSlotGuidePdfUrl(e.target.value)}
                placeholder="https://..."
              />
              {slotGuidePdfUrl && isSafeMaterialUrl(slotGuidePdfUrl) ? (
                <a
                  href={slotGuidePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-pdf-link"
                >
                  <FileText aria-hidden="true" /> Abrir PDF de prueba
                </a>
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
              {slot?.node ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    setView({
                      kind: "attempts",
                      moduleId: editView.moduleId,
                      nodeId: slot.node!.id,
                      slotOrder: editView.slotOrder,
                    })
                  }
                >
                  Ver respuestas
                </Button>
              ) : null}
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

  const renderAttempts = () => {
    if (view.kind !== "attempts") return null;
    if (attemptsLoading) return <AdminLoading message="Cargando respuestas…" />;

    const slotLabel = detail?.slots.find((s) => s.order === view.slotOrder)?.stageLabel;

    return (
      <>
        {renderBreadcrumb()}
        <header className="admin-page-header">
          <div>
            <p className="admin-eyebrow">Evaluación · Etapa {view.slotOrder}</p>
            <h1 className="admin-title">{slotLabel ?? "Respuestas"}</h1>
            <p className="admin-subtitle">
              Intentos registrados en ejercicios de esta etapa (calificación en servidor).
            </p>
          </div>
        </header>

        {attemptsError ? (
          <Alert variant="destructive" className="admin-alert">
            <AlertDescription>{attemptsError}</AlertDescription>
          </Alert>
        ) : null}

        {attemptsData ? (
          <>
            <div className="admin-stats-grid admin-stats-grid--attempts">
              <Card className="admin-stat-card">
                <CardHeader className="pb-2">
                  <CardDescription>Total intentos</CardDescription>
                  <CardTitle className="admin-stat-value">{attemptsData.summary.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="admin-stat-card">
                <CardHeader className="pb-2">
                  <CardDescription>Correctos</CardDescription>
                  <CardTitle className="admin-stat-value admin-stat-value--green">
                    {attemptsData.summary.correct}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="admin-stat-card">
                <CardHeader className="pb-2">
                  <CardDescription>Incorrectos</CardDescription>
                  <CardTitle className="admin-stat-value admin-stat-value--gold">
                    {attemptsData.summary.incorrect}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="admin-panel-card">
              <CardContent className="admin-table-wrap" style={{ paddingTop: "1.25rem" }}>
                {attemptsData.attempts.length === 0 ? (
                  <p className="admin-empty__text">Aún no hay respuestas en esta etapa.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alumno</TableHead>
                        <TableHead>Ejercicio</TableHead>
                        <TableHead>Respuesta</TableHead>
                        <TableHead>Resultado</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attemptsData.attempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell>
                            <span className="admin-table-title">{attempt.student.name}</span>
                            <br />
                            <span style={{ fontSize: 12, color: "#888" }}>{attempt.student.email}</span>
                          </TableCell>
                          <TableCell>#{attempt.exercise.order}</TableCell>
                          <TableCell>{attempt.selectedAnswer}</TableCell>
                          <TableCell>
                            {attempt.isCorrect ? (
                              <Badge className="admin-badge-ok">
                                <CheckCircle2 aria-hidden="true" /> Correcto
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="admin-badge-fail">
                                <XCircle aria-hidden="true" /> Incorrecto
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(attempt.createdAt).toLocaleString("es-CL")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}

        <div className="admin-form-actions" style={{ marginTop: "1rem" }}>
          <Button variant="outline" onClick={() => setView({ kind: "detail", moduleId: view.moduleId })}>
            Volver al bloque
          </Button>
        </div>
      </>
    );
  };

  let content: ReactNode;
  if (view.kind === "list") content = renderList();
  else if (view.kind === "detail") content = renderDetail();
  else if (view.kind === "attempts") content = renderAttempts();
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
