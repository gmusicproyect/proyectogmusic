import { HeroSection } from "../components/marketing/sections/HeroSection";
import { AcademiaSection } from "../components/marketing/sections/AcademiaSection";
import { ComunidadSection } from "../components/marketing/sections/ComunidadSection";
import { PlanesSection } from "../components/marketing/sections/PlanesSection";
import { ContactoSection } from "../components/marketing/sections/ContactoSection";
import { FooterSection } from "../components/marketing/sections/FooterSection";

interface GmusicLandingProps {
  onPlay?: (track: any) => void;
  onPlayAlbum?: (album: any) => void;
  currentTrack?: any;
  playing?: boolean;
  setPage: (page: string) => void;
  setAlbum?: (album: any) => void;
  setLevel?: (level: string) => void;
  onSelectSemestralPlan: () => void;
}

export function GmusicLanding({ setPage, setLevel, onSelectSemestralPlan }: GmusicLandingProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: "smooth" });
  };

  return (
    <div style={{ background: "#080808" }}>
      <HeroSection setPage={setPage} scrollTo={scrollTo} />
      <AcademiaSection setPage={setPage} setLevel={setLevel ?? (() => {})} />
      <ComunidadSection setPage={setPage} />
      <PlanesSection setPage={setPage} onSelectSemestralPlan={onSelectSemestralPlan} />
      <ContactoSection setPage={setPage} />
      <FooterSection scrollTo={scrollTo} />
    </div>
  );
}
