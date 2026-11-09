import { FormEvent, useState } from "react";
import { askTutor, type TutorAskResponse } from "../services/gmusic-api/ask-tutor";
import { formatAuthFormError } from "../services/gmusic-api/client";
import { GOLD, TEXT_SEC, WHITE_WARM } from "../components/marketing/tokens";
import { CLASE_GRATUITA_MAP_PAGE } from "../utils/clase-gratuita-routing";

interface TutorAskPageProps {
  setPage: (page: string) => void;
}

/**
 * Paso 5b — superficie mínima: pregunta → citas o abstain vía POST /api/v1/tutor/ask.
 */
export function TutorAskPage({ setPage }: TutorAskPageProps) {
  const [question, setQuestion] = useState(
    "¿Necesito suscripción activa para entrar a Mi Camino?"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TutorAskResponse | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await askTutor(question.trim());
      setResult(response);
    } catch (err) {
      setResult(null);
      setError(formatAuthFormError(err, "No pudimos consultar el tutor."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: WHITE_WARM,
        padding: "48px 24px 80px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <button
            type="button"
            onClick={() => setPage(CLASE_GRATUITA_MAP_PAGE)}
            style={{
              background: "transparent",
              border: "none",
              color: TEXT_SEC,
              cursor: "pointer",
              padding: 0,
              fontSize: 13,
            }}
          >
            ← Clase gratuita
          </button>
          <button
            type="button"
            onClick={() => setPage("home")}
            style={{
              background: "transparent",
              border: "none",
              color: TEXT_SEC,
              cursor: "pointer",
              padding: 0,
              fontSize: 13,
            }}
          >
            Inicio
          </button>
        </div>

        <p
          style={{
            margin: "0 0 10px",
            color: GOLD,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Gmusic · Tutor
        </p>
        <h1
          style={{
            margin: "0 0 12px",
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontSize: "clamp(28px, 5vw, 40px)",
            lineHeight: 1.15,
          }}
        >
          Preguntas con citas
        </h1>
        <p style={{ margin: "0 0 28px", color: TEXT_SEC, fontSize: 15, lineHeight: 1.6 }}>
          Responde solo con el corpus de producto. Si no hay evidencia, se abstiene.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label htmlFor="tutor-question" style={{ fontSize: 13, color: TEXT_SEC }}>
            Pregunta
          </label>
          <textarea
            id="tutor-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            required
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.03)",
              color: WHITE_WARM,
              fontSize: 15,
              lineHeight: 1.5,
              resize: "vertical",
            }}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            style={{
              height: 48,
              border: "none",
              borderRadius: 2,
              background: loading ? "rgba(201,168,76,0.45)" : GOLD,
              color: "#080808",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.04em",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Consultando…" : "Preguntar"}
          </button>
        </form>

        {error && (
          <p role="alert" style={{ marginTop: 20, color: "#E8A0A0", fontSize: 14 }}>
            {error}
          </p>
        )}

        {result && (
          <section style={{ marginTop: 32 }} aria-live="polite">
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 12,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: result.status === "answered" ? GOLD : TEXT_SEC,
              }}
            >
              {result.status === "answered" ? "Respondido con citas" : "Abstención"}
            </p>
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                lineHeight: 1.65,
                color: WHITE_WARM,
              }}
            >
              {result.answer}
            </pre>

            {result.citations.length > 0 && (
              <ul style={{ margin: "20px 0 0", padding: 0, listStyle: "none" }}>
                {result.citations.map((citation) => (
                  <li
                    key={citation.id}
                    style={{
                      marginBottom: 12,
                      paddingTop: 12,
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      fontSize: 13,
                      color: TEXT_SEC,
                      lineHeight: 1.5,
                    }}
                  >
                    <strong style={{ color: GOLD }}>[{citation.id}]</strong> {citation.title}
                    {citation.source_path ? (
                      <span style={{ display: "block", marginTop: 4 }}>
                        {citation.source_path}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}

            {result.refusal_reason && (
              <p style={{ marginTop: 16, fontSize: 12, color: TEXT_SEC }}>
                Motivo: {result.refusal_reason}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
