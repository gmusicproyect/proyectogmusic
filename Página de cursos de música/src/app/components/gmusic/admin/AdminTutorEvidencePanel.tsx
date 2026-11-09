import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { GmusicApiError } from "../../../services/gmusic-api/client";
import {
  fetchAdminTutorEvidence,
  type TutorAuditEvent,
} from "../../../services/gmusic-api/admin";

/**
 * Paso 9 — evidence del tutor (citas / abstain) para ops admin.
 */
export function AdminTutorEvidencePanel() {
  const [events, setEvents] = useState<TutorAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTutorEvidence({ limit: 50 });
      setEvents(data.events);
    } catch (err) {
      const message =
        err instanceof GmusicApiError
          ? err.message
          : "No pudimos cargar la evidence del tutor.";
      setError(message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="admin-evidence">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-white/40 mb-2">
            Evidence · Paso 9
          </p>
          <h1
            className="text-2xl font-medium tracking-tight text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Tutor — traces
          </h1>
          <p className="text-sm text-white/50 mt-2 max-w-xl">
            Últimas preguntas al corpus: answered con citas o abstain. Sin writes a
            la base de alumnos; log append-only en el API.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-[40px]"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" aria-hidden />
          Actualizar
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-white/45" role="status">
          Cargando evidence…
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <p className="text-sm text-white/45">
          Aún no hay eventos. Probá una pregunta en /tutor y volvé a actualizar.
        </p>
      ) : null}

      {!loading && events.length > 0 ? (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuándo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pregunta</TableHead>
                <TableHead>Citas / motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={`${event.ts}-${event.question.slice(0, 24)}`}>
                  <TableCell className="whitespace-nowrap text-xs text-white/50">
                    {formatTs(event.ts)}
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{
                        color: event.status === "answered" ? "#C9A84C" : "rgba(255,255,255,0.45)",
                      }}
                    >
                      {event.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-white/85 max-w-[280px]">
                    {event.question}
                  </TableCell>
                  <TableCell className="text-xs text-white/55 max-w-[240px]">
                    {event.status === "answered"
                      ? event.citation_ids.join(", ") || "—"
                      : event.refusal_reason ?? "abstain"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}

function formatTs(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}
