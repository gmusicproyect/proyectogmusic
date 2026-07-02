import { useState, useEffect, useRef, useCallback } from "react";
import { TRACKS, ALBUMS, COURSES } from "./data/music-data";
import { Navbar } from "./components/music/Navbar";
import { MusicPlayer } from "./components/music/MusicPlayer";
import { GmusicLanding } from "./pages/GmusicLanding";
import { GmusicWelcome } from "./pages/GmusicWelcome";
import { GmusicPath } from "./pages/GmusicPath";
import { PathDemoPage } from "./pages/PathDemoPage";
import { DemoLessonPage } from "./pages/DemoLessonPage";
import { InscripcionGatePage } from "./pages/InscripcionGatePage";
import { InscripcionRegistroPage } from "./pages/InscripcionRegistroPage";
import { StudentZoneGuard } from "./components/gmusic/StudentZoneGuard";
import { DemoAuthGuard } from "./components/gmusic/DemoAuthGuard";
import {
  LoginCuentaPage,
  RegistroCuentaPage,
  RegistroExitoPage,
} from "./pages/RegistroCuentaPage";
import { CoursesPage } from "./pages/legacy/AlbumCoursesPages";
import { AlbumPage } from "./pages/legacy/AlbumCoursesPages";
import { InstrumentCoursesPage } from "./pages/legacy/InstrumentCoursesPage";
import { CourseDetailPage } from "./pages/legacy/CourseDetailPage";
import { CheckoutPage } from "./pages/legacy/CheckoutPage";
import { GmusicCommunity } from "./pages/GmusicCommunity";
import { AdminPage } from "./pages/AdminPage";
import { ProbarPage } from "./pages/ProbarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LessonPage } from "./pages/LessonPage";
import { CurriculumPage } from "./pages/CurriculumPage";
import { TemperamentQuizPage } from "./pages/TemperamentQuizPage";
import { OnboardingAcademiaPage } from "./pages/OnboardingAcademiaPage";
import { FreeFundamentoLessonPage } from "./pages/FreeFundamentoLessonPage";
import { AuthModal } from "./components/music/AuthModal";
import { isPublicFreeLessonPage } from "./utils/academia-track-matrix";
import { SEMESTRAL_CHECKOUT_COURSE, isSemestralCheckoutCourse } from "./utils/public-subscription-flow";
import { activateSemestralWithAccessVerification } from "./services/gmusic-api/activate-semestral";
import { shouldAcceptLogoutSubmission } from "./services/gmusic-api/public-logout";
import { GmusicApiError } from "./services/gmusic-api/client";
import { useAuth } from "./hooks/useAuth";
import { analytics } from "./utils/analytics";
import { flushPendingTemperamentQuizSync } from "./utils/temperament-quiz-storage";
import { clearAnonymousFunnelLocalStorage } from "./utils/anonymous-funnel-storage";
import { preloadCriticalImages } from "./utils/image-config";
import {
  isAnonymousSession,
  requiresAccountForPage,
  resolveDemoEntryPage,
} from "./utils/demo-auth-gate";
import {
  getInitialPageFromPath,
  initStudentZoneRouting,
  navigateStudentZoneAware,
  pathnameForPage,
} from "./utils/student-zone-routing";
import type { Album, Course, Track, UserData } from "./types/music-app";
import "../styles/animations.css";

const DEV_LEGACY = import.meta.env.DEV;

// v4.0 - Sistema completo de monetización
export default function App() {
  // Music player state
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [playing, setPlaying] = useState(false);
  const [playlist] = useState(TRACKS);

  // Navigation state
  const [currentPage, setCurrentPage] = useState(getInitialPageFromPath);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedLevel, setSelectedLevel] = useState("fundamento");
  const [selectedInstrument, setSelectedInstrument] = useState("guitarra");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // User state
  const [userState, setUserState] = useState<"anonymous" | "registered" | "premium">("anonymous");
  const [userData, setUserData] = useState<UserData | null>(null);

  // Course progress state
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [userTier] = useState<"free" | "pro">("free"); // mock: free tier for paywall demo
  const baseXp = 220;
  const totalXp = baseXp + completedLessons.length * 80;

  const handleLessonComplete = (lessonId: number = 1) => {
    setCompletedLessons(prev => prev.includes(lessonId) ? prev : [...prev, lessonId]);
  };

  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("register");
  const [pendingSemestralCheckout, setPendingSemestralCheckout] = useState(false);
  const [logoutProcessing, setLogoutProcessing] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const { session: publicSession, refresh: refreshPublicSession, logout: authLogout } = useAuth();
  const hasAppliedAuthenticatedLandingRef = useRef(false);
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;

  const handlePageChange = useCallback((page: string) => {
    const gated = resolveDemoEntryPage(publicSession.status, page);
    navigateStudentZoneAware(gated, setCurrentPage, currentPage);
  }, [currentPage, publicSession.status]);

  // Music player functions
  const onPlay = (track: Track) => { setCurrentTrack(track); setPlaying(true); };
  const onPlayAlbum = (album: Album) => {
    const t = album.tracklist[0];
    if (!t) return;
    setCurrentTrack({ id: album.id * 100, title: t.title, artist: album.artist, album: album.title, image: album.image, duration: t.duration });
    setPlaying(true);
  };
  const onSkip = (dir: number) => {
    const idx = playlist.findIndex(t=>t.id===currentTrack.id);
    const next = playlist[(idx+dir+playlist.length)%playlist.length];
    if (!next) return;
    setCurrentTrack(next); setPlaying(true);
  };

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  const handleSemestralPlanSelect = () => {
    analytics.semestralCtaClicked();
    handlePageChange("inscripcion-gate");
  };

  // Auth handlers
  const handleAuthSuccess = (user: UserData) => {
    setUserData(user);
    setUserState("registered");
    setShowAuthModal(false);
    if (pendingSemestralCheckout) {
      setPendingSemestralCheckout(false);
      handlePageChange("checkout");
    }
  };

  const handleCheckoutSuccess = async () => {
    if (!userData) {
      throw new GmusicApiError(
        "Debes registrarte antes de completar la compra.",
        400,
        "VALIDATION_ERROR"
      );
    }

    if (!selectedCourse || !isSemestralCheckoutCourse(selectedCourse)) {
      throw new GmusicApiError(
        "Solo el plan Semestral admite activación local en este flujo.",
        400,
        "VALIDATION_ERROR"
      );
    }

    await activateSemestralWithAccessVerification({
      name: userData.name,
      email: userData.email,
    });

    setUserState("premium");
    const sessionOutcome = await refreshPublicSession();
    if (sessionOutcome.type !== "authenticated") {
      throw new GmusicApiError(
        "La activación no actualizó la sesión pública.",
        200,
        "SESSION_REFRESH_FAILED"
      );
    }
    handlePageChange("mi-estudio");
  };

  const handlePublicLogout = async () => {
    if (!shouldAcceptLogoutSubmission(logoutProcessing)) return;

    setLogoutProcessing(true);
    setLogoutError(null);

    try {
      await authLogout();
      const sessionOutcome = await refreshPublicSession();
      if (sessionOutcome.type !== "anonymous") {
        throw new GmusicApiError(
          "No se pudo confirmar el cierre de sesión.",
          200,
          "LOGOUT_VERIFICATION_FAILED"
        );
      }
      setUserState("anonymous");
      setUserData(null);
      handlePageChange("home");
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "No pudimos cerrar sesión. Intenta de nuevo.";
      setLogoutError(message);
    } finally {
      setLogoutProcessing(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    handlePageChange("course-detail");
  };

  // Precargar imágenes críticas al montar
  useEffect(() => {
    const criticalImages = [
      TRACKS[0]?.image,
      ALBUMS[0]?.image,
      COURSES[0]?.image,
    ].filter((url): url is string => Boolean(url));

    if (criticalImages.length > 0) {
      preloadCriticalImages(criticalImages);
    }
  }, []);

  useEffect(() => {
    if (publicSession.status === "authenticated") {
      clearAnonymousFunnelLocalStorage();
    }
  }, [publicSession.status]);

  useEffect(() => {
    void flushPendingTemperamentQuizSync();
  }, []);

  useEffect(() => {
    const applyRoutedPage = (page: string) => {
      navigateStudentZoneAware(page, setCurrentPage, currentPageRef.current);
    };

    return initStudentZoneRouting(applyRoutedPage, (page) =>
      resolveDemoEntryPage(publicSession.status, page)
    );
  }, [publicSession.status]);

  useEffect(() => {
    if (publicSession.status === "loading") return;
    if (!requiresAccountForPage(currentPage)) return;
    if (!isAnonymousSession(publicSession.status)) return;
    navigateStudentZoneAware("registro-cuenta", setCurrentPage, currentPage);
  }, [publicSession.status, currentPage]);

  useEffect(() => {
    const pathname =
      pathnameForPage(currentPage) ??
      (currentPage === "home" ? "/" : window.location.pathname);
    analytics.pageViewed(pathname, currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (hasAppliedAuthenticatedLandingRef.current) return;
    if (publicSession.status === "loading") return;
    if (
      publicSession.status === "authenticated" &&
      currentPage === "home" &&
      window.location.pathname === "/"
    ) {
      hasAppliedAuthenticatedLandingRef.current = true;
      handlePageChange("mi-estudio");
    } else {
      hasAppliedAuthenticatedLandingRef.current = true;
    }
  }, [publicSession.status, currentPage, handlePageChange]);

  const demoLessonId = (() => {
    const m = /^demo-clase-([1-5])$/.exec(currentPage);
    return m && m[1] ? parseInt(m[1], 10) : null;
  })();

  return (
    <div style={{ fontFamily:"'Inter','Outfit',sans-serif", background:"#080808", minHeight:"100vh", color:"#fff" }}>
      {!["curriculum","lesson","dashboard","welcome","mi-estudio","mi-camino","community","admin","mi-camino-demo","onboarding-quiz","onboarding-academia","inscripcion-gate","inscripcion-registro","registro-cuenta","login-cuenta","registro-exito"].includes(currentPage) &&
        !isPublicFreeLessonPage(currentPage) &&
        demoLessonId === null && (
        <Navbar
          currentPage={currentPage}
          setPage={handlePageChange}
          onSignIn={() => handlePageChange("login-cuenta")}
          onRegister={() => handlePageChange("registro-cuenta")}
          session={publicSession}
          onGoToStudio={() => handlePageChange("mi-estudio")}
          onLogout={handlePublicLogout}
          onRetrySession={async () => {
            await refreshPublicSession();
          }}
          logoutError={logoutError}
          logoutProcessing={logoutProcessing}
        />
      )}

      {currentPage === "home" && (
        <GmusicLanding
          onPlay={onPlay}
          onPlayAlbum={onPlayAlbum}
          currentTrack={currentTrack}
          playing={playing}
          setPage={handlePageChange}
          setAlbum={setSelectedAlbum}
          setLevel={setSelectedLevel}
          onSelectSemestralPlan={handleSemestralPlanSelect}
          session={publicSession}
        />
      )}

      {(currentPage === "welcome" || currentPage === "mi-estudio") && (
        <StudentZoneGuard setPage={handlePageChange} currentPage={currentPage}>
          <GmusicWelcome setPage={handlePageChange} />
        </StudentZoneGuard>
      )}

      {currentPage === "mi-camino" && (
        <StudentZoneGuard setPage={handlePageChange} currentPage={currentPage}>
          <GmusicPath setPage={handlePageChange} />
        </StudentZoneGuard>
      )}

      {currentPage === "onboarding-quiz" && (
        <DemoAuthGuard setPage={handlePageChange}>
          <TemperamentQuizPage
            setPage={handlePageChange}
            instrumentSlug={selectedInstrument}
            isSubscribedStudent={publicSession.status === "authenticated"}
          />
        </DemoAuthGuard>
      )}

      {currentPage === "onboarding-academia" && (
        <DemoAuthGuard setPage={handlePageChange}>
          <OnboardingAcademiaPage
            setPage={handlePageChange}
            setLevel={setSelectedLevel}
            session={publicSession}
          />
        </DemoAuthGuard>
      )}

      {currentPage === "mi-camino-demo" && (
        <DemoAuthGuard setPage={handlePageChange}>
          <PathDemoPage setPage={handlePageChange} />
        </DemoAuthGuard>
      )}

      {demoLessonId !== null && (
        <DemoAuthGuard setPage={handlePageChange}>
          <DemoLessonPage lessonId={demoLessonId} setPage={handlePageChange} />
        </DemoAuthGuard>
      )}

      {currentPage === "registro-cuenta" && (
        <RegistroCuentaPage setPage={handlePageChange} />
      )}

      {currentPage === "login-cuenta" && (
        <LoginCuentaPage setPage={handlePageChange} />
      )}

      {currentPage === "registro-exito" && (
        <RegistroExitoPage setPage={handlePageChange} />
      )}

      {currentPage === "inscripcion-gate" && (
        <InscripcionGatePage setPage={handlePageChange} />
      )}

      {currentPage === "inscripcion-registro" && (
        <InscripcionRegistroPage setPage={handlePageChange} />
      )}

      {currentPage === "album" && selectedAlbum && (
        <AlbumPage
          album={selectedAlbum}
          setPage={handlePageChange}
          onPlay={onPlay}
          currentTrack={currentTrack}
          playing={playing}
        />
      )}

      {currentPage === "courses" && (
        <CoursesPage setPage={handlePageChange} onCourseClick={handleCourseClick} />
      )}

      {(currentPage === "instrument-selector" || currentPage === "instrument-courses") && (
        <InstrumentCoursesPage
          level={selectedLevel}
          instrument={selectedInstrument}
          setPage={handlePageChange}
        />
      )}

      {currentPage === "course-detail" && selectedCourse && (
        <CourseDetailPage
          course={selectedCourse}
          setPage={handlePageChange}
          onShowAuth={() => setShowAuthModal(true)}
          onShowCheckout={() => {
            if (userState === "anonymous") {
              setShowAuthModal(true);
            } else {
              handlePageChange("checkout");
            }
          }}
          userState={userState}
        />
      )}

      {currentPage === "checkout" && selectedCourse && userData && (
        <CheckoutPage
          course={selectedCourse}
          user={userData}
          onClose={() => handlePageChange(isSemestralCheckoutCourse(selectedCourse) ? "home" : "course-detail")}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {currentPage === "community" && (
        <StudentZoneGuard setPage={handlePageChange} currentPage={currentPage}>
          <GmusicCommunity setPage={handlePageChange} />
        </StudentZoneGuard>
      )}

      {currentPage === "admin" && <AdminPage setPage={handlePageChange} />}

      {currentPage === "probar" && (
        <ProbarPage setPage={handlePageChange} />
      )}

      {isPublicFreeLessonPage(currentPage) && (
        <DemoAuthGuard setPage={handlePageChange}>
          <FreeFundamentoLessonPage setPage={handlePageChange} />
        </DemoAuthGuard>
      )}

      {DEV_LEGACY && currentPage === "dashboard" && (
        <DashboardPage setPage={setCurrentPage} />
      )}

      {DEV_LEGACY && currentPage === "lesson" && (
        <LessonPage setPage={setCurrentPage} onComplete={() => handleLessonComplete(1)} />
      )}

      {DEV_LEGACY && currentPage === "curriculum" && (
        <CurriculumPage
          setPage={setCurrentPage}
          xp={totalXp}
          streak={11}
          completedLessons={completedLessons}
          userTier={userTier}
        />
      )}

      {/* Modal de autenticación */}
      <AuthModal
        key={authModalTab}
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingSemestralCheckout(false);
        }}
        onSuccess={handleAuthSuccess}
        defaultTab={authModalTab}
        registrationOnly={pendingSemestralCheckout}
      />

      {currentPage !== "home" && currentPage !== "probar" && currentPage !== "dashboard" && currentPage !== "lesson" && currentPage !== "curriculum" && currentPage !== "welcome" && currentPage !== "mi-estudio" && currentPage !== "mi-camino" && currentPage !== "community" && currentPage !== "admin" && currentPage !== "mi-camino-demo" && currentPage !== "onboarding-quiz" && currentPage !== "inscripcion-gate" && currentPage !== "inscripcion-registro" && currentPage !== "registro-cuenta" && currentPage !== "login-cuenta" && currentPage !== "registro-exito" && !isPublicFreeLessonPage(currentPage) && demoLessonId === null && (
        <MusicPlayer
          track={currentTrack}
          playlist={playlist}
          playing={playing}
          onToggle={()=>setPlaying(!playing)}
          onSkip={onSkip}
          onSelect={(t: Track) => { setCurrentTrack(t); setPlaying(true); }}
        />
      )}
    </div>
  );
}
