import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TutorAskResult } from "./tutorAsk.js";

export interface TutorAuditEvent {
  ts: string;
  question: string;
  status: TutorAskResult["status"];
  refusal_reason: string | null;
  citation_ids: string[];
  answer_preview: string;
  ip?: string | null;
}

function defaultAuditPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.join(here, "..", "data", "tutor-audit.jsonl");
}

let auditPathOverride: string | null = null;

/** Solo tests: apunta el log a un archivo temporal. */
export function setTutorAuditPathForTests(filePath: string | null): void {
  auditPathOverride = filePath;
}

export function getTutorAuditPath(): string {
  return auditPathOverride ?? defaultAuditPath();
}

export function recordTutorAsk(
  result: TutorAskResult,
  options?: { ip?: string | null }
): TutorAuditEvent {
  const event: TutorAuditEvent = {
    ts: new Date().toISOString(),
    question: result.question.slice(0, 500),
    status: result.status,
    refusal_reason: result.refusal_reason,
    citation_ids: result.citations.map((c) => c.id),
    answer_preview: result.answer.slice(0, 280),
    ip: options?.ip ?? null,
  };
  const filePath = getTutorAuditPath();
  mkdirSync(path.dirname(filePath), { recursive: true });
  appendFileSync(filePath, `${JSON.stringify(event)}\n`, { encoding: "utf8" });
  return event;
}

export function readTutorAudit(options?: { limit?: number }): TutorAuditEvent[] {
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 200);
  const filePath = getTutorAuditPath();
  if (!existsSync(filePath)) return [];

  const raw = readFileSync(filePath, "utf8");
  const lines = raw.split("\n").filter((line) => line.trim().length > 0);
  const events: TutorAuditEvent[] = [];
  for (const line of lines) {
    try {
      events.push(JSON.parse(line) as TutorAuditEvent);
    } catch {
      // skip corrupt lines
    }
  }
  return events.slice(-limit).reverse();
}

export function clearTutorAuditForTests(): void {
  const filePath = getTutorAuditPath();
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, "", "utf8");
}
