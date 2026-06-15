import { HeroSection } from "../components/marketing/sections/HeroSection";
import { AcademiaSection } from "../components/marketing/sections/AcademiaSection";
import { ComunidadSection } from "../components/marketing/sections/ComunidadSection";
import { PlanesSection } from "../components/marketing/sections/PlanesSection";
import { ContactoSection } from "../components/marketing/sections/ContactoSection";
import { FooterSection } from "../components/marketing/sections/FooterSection";
import type { PublicStudentSessionState } from "../hooks/usePublicStudentSession";

interface GmusicLandingProps {
  onPlay?: (track: any) => void;
  onPlayAlbum?: (album: any) => void;
  currentTrack?: any;
  playing?: boolean;
  setPage: (page: string) => void;
  setAlbum?: (album: any) => void;
  setLevel?: (level: string) => void;
  onSelectSemestralPlan: () => void;
  session: PublicStudentSessionState;
}

export function GmusicLanding({ setPage, setLevel, onSelectSemestralPlan, session }: GmusicLandingProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: "smooth" });
  };

  return (
    <div className="bg-obsidian min-h-screen">
      <HeroSection scrollTo={scrollTo} setPage={setPage} />
      <div style={{ marginTop: "-12vh", position: "relative", zIndex: 1 }}>
        <AcademiaSection setPage={setPage} setLevel={setLevel ?? (() => {})} session={session} />
      </div>
      <ComunidadSection setPage={setPage} />
      <PlanesSection onSelectSemestralPlan={onSelectSemestralPlan} />
      <ContactoSection setPage={setPage} />
      <FooterSection scrollTo={scrollTo} />
    </div>
  );
}
