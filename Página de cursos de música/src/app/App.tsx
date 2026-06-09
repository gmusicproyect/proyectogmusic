import { useState, useEffect } from "react";
import { TRACKS, ALBUMS, COURSES } from "./data/music-data";
import { Navbar } from "./components/music/Navbar";
import { MusicPlayer } from "./components/music/MusicPlayer";
import { GmusicLanding } from "./pages/GmusicLanding";
import { GmusicWelcome } from "./pages/GmusicWelcome";
import { GmusicPath } from "./pages/GmusicPath";
import { CoursesPage } from "./pages/legacy/AlbumCoursesPages";
import { AlbumPage } from "./pages/legacy/AlbumCoursesPages";
import { InstrumentCoursesPage } from "./pages/legacy/InstrumentCoursesPage";
import { CourseDetailPage } from "./pages/legacy/CourseDetailPage";
import { CheckoutPage } from "./pages/legacy/CheckoutPage";
import { CommunityPage } from "./pages/CommunityPage";
import { ProbarPage } from "./pages/ProbarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LessonPage } from "./pages/LessonPage";
import { CurriculumPage } from "./pages/CurriculumPage";
import { FundamentoPreviewPage } from "./pages/FundamentoPreviewPage";
import { FreeFundamentoLessonPage } from "./pages/FreeFundamentoLessonPage";
import { AuthModal } from "./components/music/AuthModal";
import { preloadCriticalImages } from "./utils/image-config";
import {
  getInitialPageFromPath,
  initStudentZoneRouting,
  navigateStudentZoneAware,
} from "./utils/student-zone-routing";
import "../styles/animations.css";

const DEV_LEGACY = import.meta.env.DEV;

// v4.0 - Sistema completo de monetización
export default function App() {
  // Music player state
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [playing, setPlaying] = useState(false);
  const [playlist] = useState(TRACKS);

  // Navigation state
  const [currentPage, setCurrentPage] = useState(getInitialPageFromPath);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("fundamento");
  const [selectedInstrument, setSelectedInstrument] = useState("guitarra");
  const [selectedCourse, setSelectedCourse] = useState(null);

  // User state
  const [userState, setUserState] = useState<"anonymous" | "registered" | "premium">("anonymous");
  const [userData, setUserData] = useState(null);

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

  // Music player functions
  const onPlay = (track) => { setCurrentTrack(track); setPlaying(true); };
  const onPlayAlbum = (album) => {
    const t = album.tracklist[0];
    setCurrentTrack({ id:album.id*100, title:t.title, artist:album.artist, album:album.title, image:album.image, duration:t.duration });
    setPlaying(true);
  };
  const onSkip = (dir) => {
    const idx = playlist.findIndex(t=>t.id===currentTrack.id);
    const next = playlist[(idx+dir+playlist.length)%playlist.length];
    setCurrentTrack(next); setPlaying(true);
  };

  // Auth handlers
  const handleAuthSuccess = (user) => {
    setUserData(user);
    setUserState("registered");
    setShowAuthModal(false);
  };

  const handleCheckoutSuccess = () => {
    setUserState("premium");
    setCurrentPage("course-detail"); // Redirigir de vuelta al curso
    alert("¡Pago completado! Ahora tienes acceso completo al curso.");
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCurrentPage("course-detail");
  };

  // Precargar imágenes críticas al montar
  useEffect(() => {
    const criticalImages = [
      TRACKS[0]?.image,
      ALBUMS[0]?.image,
      COURSES[0]?.image,
    ].filter(Boolean);

    if (criticalImages.length > 0) {
      preloadCriticalImages(criticalImages);
    }
  }, []);

  useEffect(() => {
    const cleanup = initStudentZoneRouting(setCurrentPage);
    return cleanup;
  }, []);

  const handlePageChange = (page: string) => {
    navigateStudentZoneAware(page, setCurrentPage, currentPage);
  };

  return (
    <div style={{ fontFamily:"'Inter','Outfit',sans-serif", background:"#080808", minHeight:"100vh", color:"#fff" }}>
      {!["curriculum","lesson","dashboard","welcome","mi-estudio","mi-camino"].includes(currentPage) && (
        <Navbar currentPage={currentPage} setPage={handlePageChange} />
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
        />
      )}

      {(currentPage === "welcome" || currentPage === "mi-estudio") && (
        <GmusicWelcome setPage={handlePageChange} />
      )}

      {currentPage === "mi-camino" && (
        <GmusicPath setPage={handlePageChange} />
      )}

      {currentPage === "album" && selectedAlbum && (
        <AlbumPage
          album={selectedAlbum}
          setPage={setCurrentPage}
          onPlay={onPlay}
          currentTrack={currentTrack}
          playing={playing}
        />
      )}

      {currentPage === "courses" && (
        <CoursesPage setPage={setCurrentPage} onCourseClick={handleCourseClick} />
      )}

      {(currentPage === "instrument-selector" || currentPage === "instrument-courses") && (
        <InstrumentCoursesPage
          level={selectedLevel}
          instrument={selectedInstrument}
          setPage={setCurrentPage}
        />
      )}

      {currentPage === "course-detail" && selectedCourse && (
        <CourseDetailPage
          course={selectedCourse}
          setPage={setCurrentPage}
          onShowAuth={() => setShowAuthModal(true)}
          onShowCheckout={() => {
            if (userState === "anonymous") {
              setShowAuthModal(true);
            } else {
              setCurrentPage("checkout");
            }
          }}
          userState={userState}
        />
      )}

      {currentPage === "checkout" && selectedCourse && userData && (
        <CheckoutPage
          course={selectedCourse}
          user={userData}
          onClose={() => setCurrentPage("course-detail")}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {currentPage === "community" && (
        <CommunityPage setPage={setCurrentPage} />
      )}

      {currentPage === "probar" && (
        <ProbarPage setPage={setCurrentPage} />
      )}

      {currentPage === "fundamento-preview" && (
        <FundamentoPreviewPage setPage={handlePageChange} />
      )}

      {currentPage === "fundamento-free-lesson" && (
        <FreeFundamentoLessonPage setPage={handlePageChange} />
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
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        defaultTab="register"
      />

      {currentPage !== "home" && currentPage !== "probar" && currentPage !== "dashboard" && currentPage !== "lesson" && currentPage !== "curriculum" && currentPage !== "welcome" && currentPage !== "mi-estudio" && currentPage !== "mi-camino" && (
        <MusicPlayer
          track={currentTrack}
          playlist={playlist}
          playing={playing}
          onToggle={()=>setPlaying(!playing)}
          onSkip={onSkip}
          onSelect={(t)=>{ setCurrentTrack(t); setPlaying(true); }}
        />
      )}
    </div>
  );
}
