import type { CommunityMentorshipProgress } from "../../../data/mock-community-data";

const GOLD = "#C9A84C";

interface CommunityMentorshipPanelProps {
  progress: CommunityMentorshipProgress;
}

function ProgressLine({ label, current, target }: { label: string; current: number; target: number }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
        {current} / {target}
      </div>
    </div>
  );
}

export function CommunityMentorshipPanel({ progress }: CommunityMentorshipPanelProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 18,
        marginTop: 16,
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: GOLD,
        }}
      >
        Progreso hacia mentoría en vivo
      </p>
      <ProgressLine
        label="Progresos enviados"
        current={progress.progressSubmissions}
        target={progress.progressSubmissionsTarget}
      />
      <ProgressLine
        label="Feedbacks útiles dados"
        current={progress.helpfulFeedbacksGiven}
        target={progress.helpfulFeedbacksTarget}
      />
    </div>
  );
}
