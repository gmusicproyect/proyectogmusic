import { GmusicInternalHeader } from "../components/gmusic/GmusicInternalHeader";
import { StudioAtmosphere } from "../components/gmusic/dashboard";
import { CommunityPage } from "./CommunityPage";
import { useAuth } from "../hooks/useAuth";
import { useCommunityEnrollment } from "../hooks/useCommunityEnrollment";
import { resolveStudentDisplayName } from "../utils/student-zone-identity";
import { COMMUNITY_LEVEL_LABELS } from "../data/community-level";

interface GmusicCommunityProps {
  setPage: (page: string) => void;
}

export function GmusicCommunity({ setPage }: GmusicCommunityProps) {
  const { session } = useAuth();
  const { enrollment, isLoading } = useCommunityEnrollment();
  const userName = resolveStudentDisplayName(
    session.status === "authenticated" ? session.user.name : undefined
  );
  const headerSubtitle = isLoading
    ? "Comunidad · Guitarra"
    : `Comunidad · ${enrollment.instrument} · ${COMMUNITY_LEVEL_LABELS[enrollment.communityLevel]}`;

  return (
    <StudioAtmosphere className="gmusic-community-shell">
      <GmusicInternalHeader
        activeNav="comunidad"
        userName={userName}
        userSubtitle={headerSubtitle}
        setPage={setPage}
        onPlaceholder={() => {}}
      />
      <CommunityPage
        setPage={setPage}
        embedded
        enrollment={enrollment}
        enrollmentLoading={isLoading}
      />
    </StudioAtmosphere>
  );
}
