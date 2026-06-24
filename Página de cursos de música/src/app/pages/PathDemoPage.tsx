import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DemoAcademyNav } from "../components/gmusic/DemoAcademyNav";
import { DemoPathCards } from "../components/gmusic/DemoPathCards";
import { DemoPathCompletedFab } from "../components/gmusic/DemoPathCompletedFab";
import { DemoPathLevelBar } from "../components/gmusic/DemoPathLevelBar";
import { Button } from "../components/ui/button";
import {
  DEMO_ACADEMY_MORE_COUNT,
  DEMO_CAROUSEL_LESSON_COUNT,
  DEMO_FREE_LESSON_COUNT,
  DEMO_PATH_TOTAL_LESSONS,
  isFreeDemoLesson,
  isSubscriptionLockedLesson,
} from "../data/demo-path-catalog";
import { useDemoProgress } from "../hooks/useDemoProgress";
import { GM_BG, GM_BORDER, GM_GOLD, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../components/gmusic/tokens";
import { navigateToHomeSection } from "../utils/public-home-navigation";
import { ANONYMOUS_FUNNEL_RESET_EVENT } from "../utils/anonymous-funnel-storage";
import { buildDemoModules, countFreeDemoCompleted } from "./demo-path-build";

export { buildDemoModules } from "./demo-path-build";
export const DEMO_PATH_NODE_ID = "demo-node-1";

interface LockedDemoNodePanelProps {
  title: string;
  subscriptionLock: boolean;
  onViewPlans: () => void;
}

function LockedDemoNodePanel({ title, subscriptionLock, onViewPlans }: LockedDemoNodePanelProps) {
  return (
    <div
      className="rounded-lg border p-5 md:p-6"
      style={{
        background: GM_SURFACE,
        borderColor: GM_BORDER,
        borderLeftWidth: 3,
        borderLeftColor: "rgba(201, 168, 76, 0.35)",
      }}
    >
      <p
        className="text-[10px] font-medium tracking-[0.2em] uppercase mb-3"
        style={{ color: "rgba(212, 175, 55, 0.65)" }}
      >
        {subscriptionLock ? "Contenido de academia" : "Clase bloqueada"}
      </p>
      <h2
        className="text-xl font-medium mb-2 leading-snug"
        style={{ color: GM_TEXT, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h2>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: GM_TEXT_SEC }}>
        {subscriptionLock
          ? `Esta lección forma parte del camino completo (${DEMO_PATH_TOTAL_LESSONS} clases). Las primeras ${DEMO_FREE_LESSON_COUNT} son gratuitas; ${DEMO_ACADEMY_MORE_COUNT} más te esperan con un plan.`
          : "Esta clase se desbloquea al completar las anteriores del bloque gratuito."}
      </p>
      <Button
        onClick={onViewPlans}
        className="w-full font-medium min-h-[44px] tracking-wide"
        style={{ background: GM_GOLD, color: "#0A0A0A" }}
      >
        Ver planes
      </Button>
    </div>
  );
}

function DemoPathCompletedBanner({ onInscribirse }: { onInscribirse: () => void }) {
  return (
    <div
      className="max-w-[1400px] mx-auto w-full px-4 md:px-8 lg:px-12 pt-4 md:pt-6"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 20px",
          borderRadius: 10,
          border: "1px solid rgba(201,168,76,0.35)",
          background: "rgba(201,168,76,0.08)",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.85)",
            }}
          >
            {DEMO_FREE_LESSON_COUNT}/{DEMO_FREE_LESSON_COUNT} gratuitas completadas
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(17px, 2.5vw, 20px)",
              fontWeight: 500,
              color: GM_TEXT,
              lineHeight: 1.35,
            }}
          >
            Continúa en la academia — más de {DEMO_ACADEMY_MORE_COUNT} clases te esperan
          </p>
        </div>
        <button
          type="button"
          onClick={onInscribirse}
          style={{
            flexShrink: 0,
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            background: GM_GOLD,
            color: "#0A0A0A",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 4px 0 rgba(140,100,20,0.6)",
          }}
        >
          Elegir plan
        </button>
      </div>
    </div>
  );
}

function getWelcomeCopy(freeCompleted: number) {
  if (freeCompleted === 0) {
    return {
      title: "Tu camino con la guitarra empieza aquí",
      description: `${DEMO_FREE_LESSON_COUNT} clases gratuitas para empezar. Preview de ${DEMO_CAROUSEL_LESSON_COUNT} lecciones; ${DEMO_PATH_TOTAL_LESSONS} en la academia completa.`,
    };
  }
  return {
    title: "Sigue tu camino musical",
    description: `Continúa con la siguiente clase gratuita. ${DEMO_ACADEMY_MORE_COUNT} lecciones más te esperan con un plan.`,
  };
}

interface PathDemoPageProps {
  setPage: (page: string) => void;
}

export function PathDemoPage({ setPage }: PathDemoPageProps) {
  const { completedLessons, demoFinished, resetProgress } = useDemoProgress();
  const [previewAsFirstVisit, setPreviewAsFirstVisit] = useState(false);
  const [lockedSelection, setLockedSelection] = useState<{
    title: string;
    lessonNumber: number;
  } | null>(null);
  const lockedPanelRef = useRef<HTMLDivElement>(null);

  const displayCompleted = previewAsFirstVisit ? [] : completedLessons;
  const showCompletedState = demoFinished && !previewAsFirstVisit;
  const freeCompleted = countFreeDemoCompleted(displayCompleted);

  const demoModules = useMemo(
    () => buildDemoModules(displayCompleted),
    [displayCompleted]
  );
  const allNodes = useMemo(() => demoModules.flatMap((mod) => mod.nodes), [demoModules]);

  const activeClass = showCompletedState
    ? DEMO_FREE_LESSON_COUNT
    : Math.min(freeCompleted + 1, DEMO_FREE_LESSON_COUNT);

  const welcomeCopy = getWelcomeCopy(freeCompleted);

  const handleViewPlans = useCallback(() => {
    navigateToHomeSection(setPage, "planes");
  }, [setPage]);

  const handleInscripcion = useCallback(() => {
    if (demoFinished) {
      setPage("inscripcion-gate");
    }
  }, [demoFinished, setPage]);

  const handleAcademyTeaser = useCallback(() => {
    if (demoFinished) {
      setPage("inscripcion-gate");
      return;
    }
    const nextFree = Math.min(freeCompleted + 1, DEMO_FREE_LESSON_COUNT);
    setPage(`demo-clase-${nextFree}`);
  }, [demoFinished, freeCompleted, setPage]);

  const handleTabChange = useCallback(
    (tab: "inicio" | "mi-camino" | "mi-estudio" | "mi-progreso") => {
      if (tab === "inicio") setPage("home");
      if (tab === "mi-estudio") setPage("inscripcion-gate");
    },
    [setPage]
  );

  const handleStartLesson = useCallback(
    (lessonNumber: number) => {
      if (isFreeDemoLesson(lessonNumber)) {
        setPage(`demo-clase-${lessonNumber}`);
      }
    },
    [setPage]
  );

  const handleLockedClick = useCallback((title: string, lessonNumber: number) => {
    setLockedSelection({ title, lessonNumber });
  }, []);

  useEffect(() => {
    if (!lockedSelection) return;
    const frame = requestAnimationFrame(() => {
      lockedPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [lockedSelection]);

  useEffect(() => {
    const onFunnelReset = () => {
      setLockedSelection(null);
      setPreviewAsFirstVisit(false);
    };
    window.addEventListener(ANONYMOUS_FUNNEL_RESET_EVENT, onFunnelReset);
    return () => window.removeEventListener(ANONYMOUS_FUNNEL_RESET_EVENT, onFunnelReset);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: GM_BG, color: GM_TEXT }}>
      <DemoAcademyNav
        activeTab="mi-camino"
        completedCount={completedLessons.length}
        onTabChange={handleTabChange}
      />

      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(8,8,8,0.6)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-3 md:py-4">
          <DemoPathLevelBar
            completedCount={freeCompleted}
            activeClass={activeClass}
            levelLabel="Camino Gmusic"
            totalClasses={DEMO_PATH_TOTAL_LESSONS}
            freeClassCount={DEMO_FREE_LESSON_COUNT}
            variant="rail"
          />
        </div>
      </div>

      <main className="flex-1 flex flex-col w-full">
        {previewAsFirstVisit && (
          <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 lg:px-12 pt-4">
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid rgba(201,168,76,0.35)",
                background: "rgba(201,168,76,0.08)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: GM_TEXT_SEC,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Vista previa: alumno que entra por primera vez. Tu progreso real (
                {countFreeDemoCompleted(completedLessons)}/{DEMO_FREE_LESSON_COUNT} gratuitas) sigue
                guardado.
              </p>
              <button
                type="button"
                onClick={() => setPreviewAsFirstVisit(false)}
                style={{
                  background: GM_GOLD,
                  color: "#0A0A0A",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                  padding: "8px 14px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Volver a mi progreso
              </button>
            </div>
          </div>
        )}

        {showCompletedState && (
          <DemoPathCompletedBanner onInscribirse={handleInscripcion} />
        )}

        {!showCompletedState && (
          <header className="max-w-[1400px] mx-auto w-full px-4 md:px-8 lg:px-12 pt-6 md:pt-8 pb-2 md:pb-4">
            <p
              className="text-[10px] font-medium tracking-[0.2em] uppercase mb-2"
              style={{ color: "rgba(201,168,76,0.55)" }}
            >
              {DEMO_FREE_LESSON_COUNT} gratuitas · preview {DEMO_CAROUSEL_LESSON_COUNT} ·{" "}
              {DEMO_PATH_TOTAL_LESSONS} en academia
            </p>
            <h1
              className="text-xl md:text-2xl lg:text-3xl font-medium mb-2 tracking-tight max-w-2xl"
              style={{ color: GM_TEXT, fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {welcomeCopy.title}
            </h1>
            <p
              className="text-sm md:text-base max-w-xl leading-relaxed"
              style={{ color: GM_TEXT_SEC, fontFamily: "Inter, sans-serif" }}
            >
              {welcomeCopy.description}
            </p>
            <p
              className="text-xs mt-3"
              style={{ color: "rgba(255,255,255,0.28)", fontFamily: "Inter, sans-serif" }}
            >
              {freeCompleted} de {DEMO_FREE_LESSON_COUNT} clases gratuitas · más de{" "}
              {DEMO_ACADEMY_MORE_COUNT} con plan
            </p>
          </header>
        )}

        <section className="flex-1 flex flex-col justify-center w-full py-6 md:py-10 lg:py-12 min-h-[320px]">
          <DemoPathCards
            nodes={allNodes}
            fullBleed
            reviewCompleted={showCompletedState}
            allowLockedSelection
            onStartLesson={handleStartLesson}
            onLockedClick={handleLockedClick}
            onAcademyTeaserClick={handleAcademyTeaser}
            hintText={
              showCompletedState
                ? "Desliza — 5 gratuitas completadas · preview del camino"
                : "Desliza el camino · clases 6–15 requieren plan"
            }
          />
        </section>

        {lockedSelection && (
          <div
            ref={lockedPanelRef}
            className="max-w-[600px] mx-auto px-4 pb-8 w-full"
          >
            <LockedDemoNodePanel
              title={lockedSelection.title}
              subscriptionLock={isSubscriptionLockedLesson(lockedSelection.lessonNumber)}
              onViewPlans={handleViewPlans}
            />
          </div>
        )}
      </main>

      {showCompletedState && (
        <DemoPathCompletedFab
          onInscribirse={handleInscripcion}
          onPreviewFirst={() => setPreviewAsFirstVisit(true)}
          onReset={() => resetProgress()}
        />
      )}
    </div>
  );
}
