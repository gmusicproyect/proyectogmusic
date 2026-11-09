import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type TutorStatus = "answered" | "abstain";

export interface TutorCitation {
  id: string;
  title: string;
  source_path: string | null;
  excerpt: string;
}

export interface TutorAskResult {
  question: string;
  status: TutorStatus;
  answer: string;
  citations: TutorCitation[];
  refusal_reason: string | null;
}

interface CorpusDocument {
  id: string;
  title: string;
  tags?: string[];
  source_path?: string;
  text: string;
}

interface CorpusFile {
  documents: CorpusDocument[];
}

const MAX_CITATIONS = 3;
const MIN_OVERLAP = 2;

const STOP = new Set([
  "a",
  "al",
  "de",
  "del",
  "el",
  "en",
  "es",
  "la",
  "las",
  "lo",
  "los",
  "mi",
  "para",
  "por",
  "que",
  "se",
  "un",
  "una",
  "y",
  "o",
  "con",
  "cómo",
  "como",
  "cuál",
  "cual",
  "necesito",
  "funciona",
  "entrar",
]);

let cachedDocs: CorpusDocument[] | null = null;

function corpusPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.join(here, "..", "data", "gmusic-tutor-corpus.json");
}

export function loadTutorCorpus(docs?: CorpusDocument[]): CorpusDocument[] {
  if (docs) return docs;
  if (cachedDocs) return cachedDocs;
  const raw = JSON.parse(readFileSync(corpusPath(), "utf8")) as CorpusFile;
  cachedDocs = raw.documents ?? [];
  return cachedDocs;
}

/** Respuesta grounded: solo excerpts del corpus, o abstain. Sin LLM, sin writes. */
export function askTutor(
  questionRaw: string,
  options?: { documents?: CorpusDocument[]; maxCitations?: number }
): TutorAskResult {
  const question = (questionRaw ?? "").trim();
  if (!question) {
    return {
      question: "",
      status: "abstain",
      answer: "",
      citations: [],
      refusal_reason: "empty_question",
    };
  }

  const docs = loadTutorCorpus(options?.documents);
  const maxCitations = options?.maxCitations ?? MAX_CITATIONS;

  const ranked = docs
    .map((doc) => ({ doc, score: tokenOverlap(question, doc) }))
    .filter((row) => row.score >= MIN_OVERLAP)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCitations);

  if (ranked.length === 0) {
    return {
      question,
      status: "abstain",
      answer:
        "No tengo evidencia suficiente en el corpus de Gmusic para responder. Reformula con términos de acceso, Mi Camino, inscripción o garantía.",
      citations: [],
      refusal_reason: "no_evidence",
    };
  }

  const citations: TutorCitation[] = ranked.map(({ doc }) => ({
    id: doc.id,
    title: doc.title,
    source_path: doc.source_path ?? null,
    excerpt: excerpt(doc.text, 220),
  }));

  const answer = composeGroundedAnswer(citations);
  return {
    question,
    status: "answered",
    answer,
    citations,
    refusal_reason: null,
  };
}

function tokenOverlap(question: string, doc: CorpusDocument): number {
  const tokens = [...question.toLowerCase().matchAll(/[a-z0-9áéíóúñü]+/g)]
    .map((m) => m[0])
    .filter((t) => !STOP.has(t) && t.length > 2);
  const hay = `${doc.id} ${doc.title} ${(doc.tags ?? []).join(" ")} ${doc.text}`.toLowerCase();
  return tokens.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
}

function excerpt(text: string, n: number): string {
  const compact = text.split(/\s+/).join(" ");
  if (compact.length <= n) return compact;
  return `${compact.slice(0, n - 3)}...`;
}

function composeGroundedAnswer(citations: TutorCitation[]): string {
  const top = citations[0];
  const lines = [
    "Respuesta basada solo en el corpus Gmusic:",
    `Según [${top.id}]: ${top.excerpt}`,
  ];
  // Evitar repetir el mismo excerpt del top en la lista.
  for (const c of citations.slice(1)) {
    lines.push(`- [${c.id}] ${c.excerpt}`);
  }
  lines.push("");
  lines.push(`Citas: ${citations.map((c) => `[${c.id}]`).join(", ")}.`);
  return lines.join("\n");
}
