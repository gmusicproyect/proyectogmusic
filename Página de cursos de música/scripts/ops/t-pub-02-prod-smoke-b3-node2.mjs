#!/usr/bin/env node
/**
 * T-PUB-02 Fase B — smoke prod B3 nodo 2 (API E2E + ítem 5 idempotente).
 * Uso: node --env-file=.env scripts/ops/t-pub-02-prod-smoke-b3-node2.mjs
 */
import { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../../.agents/operations/t-pub-02-prod-smoke-evidence");

const PROD = "https://gmusic-api.onrender.com/api/v1";
const ORIGIN = "https://proyectogmusic.vercel.app";
const COOKIE = "/tmp/tpub02-phaseb-cookies.txt";
const EMAIL = "qa-alumno-prod-001@gmusic.test";
const PASS = process.env.QA_ALUMNO_PROD_PASSWORD ?? "QaAlumnoProd001!";
const B3_NODE2 = "d367555e-ba3e-4bb7-a096-ddd5ca6e1d6b";
const B3_NODE2_TITLE = "Diagrama de Am: dedos, trastes, cuerdas";

const prisma = new PrismaClient();

function curl(method, path, body) {
  const args = [
    "-sS",
    "-c",
    COOKIE,
    "-b",
    COOKIE,
    "-X",
    method,
    "-H",
    "Content-Type: application/json",
    "-H",
    `Origin: ${ORIGIN}`,
    "-w",
    "\n__HTTP__%{http_code}",
    `${PROD}${path}`,
  ];
  if (body) args.push("-d", JSON.stringify(body));
  const out = execFileSync("curl", args, { encoding: "utf8" });
  const m = out.match(/__HTTP__(\d+)$/);
  const status = m ? Number(m[1]) : 0;
  const raw = out.replace(/\n__HTTP__\d+$/, "");
  let data = null;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }
  return { status, data };
}

function flattenNodes(modules) {
  const out = [];
  for (const m of modules ?? []) {
    for (const n of m.nodes ?? []) {
      out.push({ ...n, moduleTitle: m.title });
    }
  }
  return out;
}

async function buildAttempts(nodeId) {
  const exs = await prisma.microExercise.findMany({
    where: { nodeId },
    orderBy: { order: "asc" },
    select: { id: true, type: true, secureAnswer: true, contentPayload: true },
  });
  return exs.map((ex) => {
    let selectedAnswer = ex.secureAnswer?.correctOptionId;
    if (ex.type === "RHYTHM_TAP") {
      selectedAnswer =
        ex.contentPayload?.submissionOptionId ??
        ex.secureAnswer?.correctOptionId ??
        "tap-complete";
    }
    return {
      microExerciseId: ex.id,
      selectedAnswer,
      responseTimeMs: 1200,
    };
  });
}

const report = {
  ticket: "T-PUB-02 Fase B",
  account: EMAIL,
  nodeId: B3_NODE2,
  nodeTitle: B3_NODE2_TITLE,
  exerciseType: "CHORD_SHAPE",
  steps: [],
};

const step = (name, ok, extra = {}) => {
  report.steps.push({ name, ok, ...extra });
  return ok;
};

try {
  execFileSync("rm", ["-f", COOKIE]);
} catch {
  /* noop */
}

const login = curl("POST", "/auth/login", { email: EMAIL, password: PASS });
step("login", login.status === 200, { http: login.status });

const pathBefore = curl("GET", "/me/path?courseSlug=ruta-guitarra-12-meses");
const nodeBefore = flattenNodes(pathBefore.data?.modules).find((n) => n.id === B3_NODE2);
step("path-before-node2", pathBefore.status === 200 && nodeBefore != null, {
  statusBefore: nodeBefore?.status,
  title: nodeBefore?.title,
});

const start = curl("POST", "/lesson-sessions", { nodeId: B3_NODE2 });
const sessionId = start.data?.sessionId ?? null;
const exCount = start.data?.exercises?.length ?? 0;
const exType = start.data?.exercises?.[0]?.type ?? null;
step(
  "lesson-session-start",
  (start.status === 200 || start.status === 201) && exCount >= 1,
  { http: start.status, sessionId, exCount, exType }
);

const attempts = await buildAttempts(B3_NODE2);
step(
  "attempts-built",
  attempts.length >= 1 && attempts[0].selectedAnswer === "a",
  { count: attempts.length, selectedAnswer: attempts[0]?.selectedAnswer }
);

let complete = { status: 0, data: null };
if (sessionId) {
  complete = curl("POST", `/lesson-sessions/${sessionId}/complete`, { attempts });
}
step(
  "lesson-session-complete",
  complete.status === 200 && complete.data?.nodeCompleted === true,
  {
    http: complete.status,
    nodeCompleted: complete.data?.nodeCompleted,
    xpEarned: complete.data?.xpEarned,
    accuracy: complete.data?.accuracy,
  }
);

let idempotent = { status: 0, data: null };
if (sessionId) {
  idempotent = curl("POST", `/lesson-sessions/${sessionId}/complete`, { attempts });
}
step(
  "re-complete-idempotent",
  idempotent.status === 200 && idempotent.data?.alreadyProcessed === true,
  {
    http: idempotent.status,
    alreadyProcessed: idempotent.data?.alreadyProcessed,
    xpEarned: idempotent.data?.xpEarned,
  }
);

const pathAfter = curl("GET", "/me/path?courseSlug=ruta-guitarra-12-meses");
const nodeAfter = flattenNodes(pathAfter.data?.modules).find((n) => n.id === B3_NODE2);
step("path-after-node2-completed", nodeAfter?.status === "completed", {
  statusAfter: nodeAfter?.status,
});

report.pass = report.steps.every((s) => s.ok);
report.delegatedSmoke = "Juan OK hazlo tu — API E2E prod B3 nodo 2";

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));

await prisma.$disconnect();
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
