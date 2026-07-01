import type { CommunityPeer } from "../../../data/mock-community-data";
import { COMMUNITY_LEVEL_LABELS, type CommunityLevel } from "../../../data/community-level";

interface CommunityPeersPanelProps {
  level: CommunityLevel;
  peers: CommunityPeer[];
  loading?: boolean;
}

export function CommunityPeersPanel({ level, peers, loading }: CommunityPeersPanelProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 18,
        marginBottom: 16,
      }}
    >
      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 12px" }}>
        Compañeros en {COMMUNITY_LEVEL_LABELS[level]}
      </h3>
      {loading ? (
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Cargando…</p>
      ) : peers.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
          Aún no hay actividad reciente en este nivel.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {peers.map((peer) => (
            <div key={peer.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {peer.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{peer.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{peer.activity}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
