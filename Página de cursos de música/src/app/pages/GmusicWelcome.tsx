import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Target, Dumbbell, TrendingUp, Activity } from "lucide-react";
import { GmusicInternalHeader, isLockedNav, LOCKED_NAV_MODAL } from "../components/gmusic/GmusicInternalHeader";
import { GmusicPlaceholderModal } from "../components/gmusic/GmusicPlaceholderModal";
import {
  DashboardGrid,
  DashboardShell,
  StudentHeroPanel,
  StudioAtmosphere,
  PracticeCard,
  CompletedPathCard,
  DashboardErrorBanner,
  MetricCard,
  QuoteCard,
  LockedFeatureCard,
  WeeklyChestCelebrationShell,
  type WeeklyChestCelebrationState,
} from "../components/gmusic/dashboard";
import { useDashboard } from "../hooks/useDashboard";
import {
  deriveStreakChipCopy,
  deriveStudentHeroEyebrow,
  deriveStudentHeroSituationLine,
  deriveWelcomeHeaderSubtitle,
  resolveStudentDisplayName,
} from "../utils/student-zone-identity";

interface GmusicWelcomeProps {
  setPage: (page: string) => void;
}

type AudioState = "pending" | "granted" | "denied";

const DAILY_QUOTE =
  "La constancia le gana al talento cuando el talento no practica.";

export function GmusicWelcome({ setPage }: GmusicWelcomeProps) {
  const [audioState, setAudioState] = useState<AudioState>("pending");
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [chestState, setChestState] = useState<WeeklyChestCelebrationState>({ status: "idle" });
  const [chestOpen, setChestOpen] = useState(false);
  const chestTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const dashboard = useDashboard();

  const clearChestTimers = useCallback(() => {
    for (const timerId of chestTimersRef.current) {
      clearTimeout(timerId);
    }
    chestTimersRef.current = [];
  }, []);

  useEffect(() => () => clearChestTimers(), [clearChestTimers]);

  const handleNavPlaceholder = (key: string) => {
    if (isLockedNav(key)) setShowLockedModal(true);
  };

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
        if (result.state === "granted") setAudioState("granted");
        else if (result.state === "denied") setAudioState("denied");
        else setAudioState("pending");
        result.onchange = () => {
          if (result.state === "granted") setAudioState("granted");
          else if (result.state === "denied") setAudioState("denied");
          else setAudioState("pending");
        };
      } catch {
        setAudioState("pending");
      } finally {
        setIsCheckingPermission(false);
      }
    };
    checkPermission();
  }, []);

  const handleRequestAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioState("granted");
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setAudioState("denied");
    }
  };

  const goToCamino = () => setPage("mi-camino");

  const audioLabel = (() => {
    if (isCheckingPermission) return "Comprobando audio…";
    if (audioState === "granted") return "Audio listo";
    if (audioState === "denied") return "Micrófono bloqueado";
    return "Preparar estudio";
  })();

  const isLoading = dashboard.status === "loading";
  const viewModel = dashboard.status === "success" ? dashboard.viewModel : null;
  const headerUserName = resolveStudentDisplayName(
    isLoading ? undefined : viewModel?.userName
  );
  const headerUserSubtitle = deriveWelcomeHeaderSubtitle(viewModel?.phaseLabel, isLoading);

  const heroEyebrow = deriveStudentHeroEyebrow(viewModel?.phaseLabel, isLoading);
  const heroSituationLine = deriveStudentHeroSituationLine({
    isLoading,
    pathComplete: viewModel?.pathComplete ?? false,
    nextPracticeTitle: viewModel?.nextPractice?.title,
    currentNodeTitle: viewModel?.currentNodeTitle,
  });
  const streakChip = useMemo(
    () =>
      deriveStreakChipCopy(
        isLoading ? 0 : (viewModel?.streakDays ?? 0),
        isLoading ? false : (viewModel?.streakActiveToday ?? false)
      ),
    [isLoading, viewModel?.streakDays, viewModel?.streakActiveToday]
  );

  const handleOpenChest = useCallback(() => {
    const xpReward = viewModel?.weeklyChest?.xpReward ?? 50;
    clearChestTimers();
    setChestOpen(true);
    setChestState({ status: "opening" });
    const revealTimer = setTimeout(() => {
      setChestState({ status: "reward-revealed", xpReward });
    }, 700);
    chestTimersRef.current.push(revealTimer);
  }, [clearChestTimers, viewModel?.weeklyChest?.xpReward]);

  const handleChestClose = useCallback(
    (open: boolean) => {
      if (open) return;
      clearChestTimers();
      setChestState({ status: "closing" });
      setChestOpen(false);
      const resetTimer = setTimeout(() => {
        setChestState({ status: "idle" });
      }, 300);
      chestTimersRef.current.push(resetTimer);
    },
    [clearChestTimers]
  );

  return (
    <StudioAtmosphere>
      <GmusicInternalHeader
        activeNav="estudio"
        userName={headerUserName}
        userSubtitle={headerUserSubtitle}
        setPage={setPage}
        onPlaceholder={handleNavPlaceholder}
      />

      <DashboardShell>
        <DashboardGrid>
          {dashboard.status === "error" && (
            <div className="lg:col-span-12">
              <DashboardErrorBanner message={dashboard.message} onRetry={dashboard.retry} />
            </div>
          )}

          <div className="lg:col-span-12">
            <StudentHeroPanel
              userName={resolveStudentDisplayName(isLoading ? undefined : viewModel?.userName)}
              eyebrow={heroEyebrow}
              situationLine={heroSituationLine}
              streakChipLabel={isLoading ? "…" : streakChip.label}
              streakEmphasis={isLoading ? "none" : streakChip.emphasis}
              audioLabel={audioLabel}
              audioState={audioState}
              isCheckingPermission={isCheckingPermission}
              onRequestAudio={handleRequestAudio}
            />
          </div>

          {dashboard.status !== "error" && (
            <div className="lg:col-span-12">
              {isLoading ? (
                <PracticeCard
                  title="Cargando práctica"
                  typeLabel="Conectando con tu estudio"
                  description="Estamos preparando tu próxima sesión."
                  onContinue={goToCamino}
                  isLoading
                />
              ) : viewModel?.pathComplete ? (
                <CompletedPathCard onViewPath={goToCamino} />
              ) : viewModel?.nextPractice ? (
                <PracticeCard
                  title={viewModel.nextPractice.title}
                  typeLabel={viewModel.nextPractice.typeLabel}
                  description={viewModel.nextPractice.description}
                  onContinue={goToCamino}
                />
              ) : null}
            </div>
          )}

          {dashboard.status !== "error" && (
            <>
              <MetricCard
                variant="progress"
                icon={TrendingUp}
                eyebrow="Progreso del módulo"
                value={isLoading ? "…" : (viewModel?.progressPercentLabel ?? "—")}
                suffix="completado"
                progressPercent={isLoading ? 0 : (viewModel?.progressPercent ?? 0)}
                nodeTitle={isLoading ? "…" : (viewModel?.currentNodeTitle ?? "—")}
                phaseLabel={isLoading ? "…" : (viewModel?.phaseLabel ?? "—")}
              />
              <MetricCard
                variant="xp"
                icon={Activity}
                eyebrow="XP y constancia"
                xpTotal={isLoading ? 0 : (viewModel?.xpTotal ?? 0)}
                weeklyGain={isLoading ? 0 : (viewModel?.weeklyGain ?? 0)}
                consistencyStatus={isLoading ? "…" : (viewModel?.consistencyStatus ?? "—")}
                exercisesUntilChest={viewModel?.weeklyChest?.exercisesUntilChest ?? undefined}
                onChestClick={viewModel?.weeklyChest?.isReady ? handleOpenChest : undefined}
              />
              <QuoteCard quote={DAILY_QUOTE} />
            </>
          )}

          <div className="lg:col-span-6">
            <LockedFeatureCard
              icon={Target}
              eyebrow="Desafío del Día"
              description="Reto rápido diario para mantener tu racha sin presión de avance en el camino."
            />
          </div>
          <div className="lg:col-span-6">
            <LockedFeatureCard
              icon={Dumbbell}
              eyebrow="Laboratorio de Práctica"
              description="Repaso libre de oído, lectura y técnica — sin presión de avanzar en el camino."
            />
          </div>
        </DashboardGrid>
      </DashboardShell>

      <GmusicPlaceholderModal
        open={showLockedModal}
        onClose={() => setShowLockedModal(false)}
        title={LOCKED_NAV_MODAL.title}
        subtitle={LOCKED_NAV_MODAL.subtitle}
        footer={LOCKED_NAV_MODAL.footer}
      />

      <WeeklyChestCelebrationShell
        state={chestState}
        open={chestOpen}
        onOpenChange={handleChestClose}
      />
    </StudioAtmosphere>
  );
}
