import { AcademiaOnboardingWizard } from "../components/marketing/AcademiaOnboardingWizard";
import type { PublicStudentSessionState } from "../hooks/usePublicStudentSession";

interface OnboardingAcademiaPageProps {
  setPage: (page: string) => void;
  setLevel: (level: string) => void;
  session: PublicStudentSessionState;
}

export function OnboardingAcademiaPage({
  setPage,
  setLevel,
  session,
}: OnboardingAcademiaPageProps) {
  return (
    <div
      style={{
        position: "relative",
        background: "#0D0D0D",
        minHeight: "100vh",
        padding: "120px 0 80px",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(180deg, rgba(13, 13, 13, 0.2) 0%, rgba(13, 13, 13, 0.5) 100%), url('/hero/threshold/fondoacademia.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 600,
          background: "radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 65%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <AcademiaOnboardingWizard setPage={setPage} setLevel={setLevel} session={session} />
    </div>
  );
}
