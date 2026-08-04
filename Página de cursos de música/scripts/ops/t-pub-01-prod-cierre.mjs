/**
 * T-PUB-01 — Cierre prod Modo B (ops only, no commit automático).
 * Uso: node --env-file=.env scripts/ops/t-pub-01-prod-cierre.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../../.agents/operations/t-pub-01-prod-evidence");
mkdirSync(OUT_DIR, { recursive: true });

const PROD = "https://gmusic-api.onrender.com/api/v1";
const ORIGIN = "https://proyectogmusic.vercel.app";
const COURSE_SLUG = "ruta-guitarra-12-meses";
const STUDENT_EMAIL = "carlos@gmusic.academy";
const ADMIN_EMAIL = "admin@gmusic.academy";
const STUDENT_PASS = process.env.CARLOS_SEED_PASSWORD?.trim();
const ADMIN_PASS = process.env.ADMIN_SEED_PASSWORD?.trim();

const MODULE_TITLE = "Mi menor";

const SLOTS = [
  {
    order: 1,
    title: "Por qué Em: el acorde de dos dedos",
    completionCriteria: "El alumno explica por qué Em es el acorde de dos dedos",
  },
  {
    order: 2,
    title: "Diagrama de Em y relación visual con Am",
    completionCriteria: "Identifica el diagrama de Em y su relación con Am",
  },
  {
    order: 3,
    title: "Dos dedos precisos — limpieza de las cuerdas al aire",
    completionCriteria: "Cada cuerda suena clara al pulsar Em",
  },
  {
    order: 4,
    title: "Alternar Am / Em lento, sin metrónomo",
    completionCriteria: "Alterna Am y Em 3 veces seguidas sin ayuda visual",
  },
  {
    order: 5,
    title: "Em limpio al pulso + reconocer ambos acordes",
    completionCriteria: "Em suena limpio 4 tiempos al pulso",
  },
];

const report = {
  ticket: "T-PUB-01",
  mode: "B",
  entorno: "prod",
  studentEmail: STUDENT_EMAIL,
  adminEmail: ADMIN_EMAIL,
  timestamp: new Date().toISOString(),
  steps: [],
  ids: {},
};

function fail(msg) {
  report.error = msg;
  writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  console.error("STOP:", msg);
  process.exit(1);
}

if (!STUDENT_PASS || !ADMIN_PASS) {
  fail("Faltan CARLOS_SEED_PASSWORD o ADMIN_SEED_PASSWORD en .env");
}

const studentCookie = path.join(OUT_DIR, "student-cookies.txt");
const adminCookie = path.join(OUT_DIR, "admin-cookies.txt");

function curl(cookieFile, method, apiPath, body) {
  const args = [
    "-sS",
    "-c",
    cookieFile,
    "-b",
    cookieFile,
    "-X",
    method,
    "-H",
    "Content-Type: application/json",
    "-H",
    `Origin: ${ORIGIN}`,
    "-w",
    "\n__HTTP__%{http_code}",
    `${PROD}${apiPath}`,
  ];
  if (body !== undefined) args.push("-d", JSON.stringify(body));
  const out = execFileSync("curl", args, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  const m = out.match(/__HTTP__(\d+)$/);
  const status = m ? Number(m[1]) : 0;
  const raw = out.replace(/\n__HTTP__\d+$/, "");
  let data = raw;
  try {
    data = JSON.parse(raw);
  } catch {
    /* text */
  }
  return { status, data };
}

function step(name, ok, extra = {}) {
  report.steps.push({ name, ok, ...extra });
  console.log(ok ? "PASS" : "FAIL", name, extra.status ?? "");
  if (!ok) fail(`Paso fallido: ${name}`);
}

function moduleTitles(pathData) {
  return (pathData?.modules ?? []).map((m) => m.title);
}

function hasModule(pathData, title) {
  return moduleTitles(pathData).includes(title);
}

try {
  execFileSync("rm", ["-f", studentCookie, adminCookie]);
} catch {
  /* noop */
}

// Health
const health = curl(studentCookie, "GET", "/health");
step("health", health.status === 200, { status: health.status });

// Carlos login
const studentLogin = curl(studentCookie, "POST", "/auth/login", {
  email: STUDENT_EMAIL,
  password: STUDENT_PASS,
});
step("student-login", studentLogin.status === 200, { status: studentLogin.status });

// BEFORE publish — path must NOT include new module (not created yet)
const pathBefore = curl(studentCookie, "GET", `/me/path?courseSlug=${COURSE_SLUG}`);
writeFileSync(path.join(OUT_DIR, "me-path-before-publish.json"), JSON.stringify(pathBefore.data, null, 2));
step("me-path-before", pathBefore.status === 200, { status: pathBefore.status });
report.ids.courseIdBefore = pathBefore.data?.course?.id;
report.modulesBefore = moduleTitles(pathBefore.data);

// Admin login
const adminLogin = curl(adminCookie, "POST", "/auth/login", {
  email: ADMIN_EMAIL,
  password: ADMIN_PASS,
});
step("admin-login", adminLogin.status === 200, { status: adminLogin.status });

const modulesList = curl(adminCookie, "GET", `/admin/modules?courseSlug=${COURSE_SLUG}`);
step("admin-list-modules", modulesList.status === 200, { status: modulesList.status });
writeFileSync(path.join(OUT_DIR, "admin-modules-before.json"), JSON.stringify(modulesList.data, null, 2));

const existingSameTitle = (modulesList.data?.modules ?? []).filter((m) => m.title === MODULE_TITLE);
report.existingModulesSameTitle = existingSameTitle.map((m) => ({
  id: m.id,
  order: m.order,
  listStatus: m.listStatus,
}));

// Create DRAFT module
const created = curl(adminCookie, "POST", "/admin/modules", {
  title: MODULE_TITLE,
  courseSlug: COURSE_SLUG,
});
step("create-module", created.status === 201, { status: created.status });
const moduleId = created.data?.module?.id;
if (!moduleId) fail("Sin moduleId tras create");
report.ids.moduleId = moduleId;
report.ids.moduleOrder = created.data?.module?.order;

// DRAFT invisible — carlos path should still not include NEW module by title at new order
// (duplicate title may already exist; check by moduleId in path after publish only)
const pathDuringDraft = curl(studentCookie, "GET", `/me/path?courseSlug=${COURSE_SLUG}`);
const draftVisible = JSON.stringify(pathDuringDraft.data).includes(moduleId);
step("draft-invisible-by-id", !draftVisible, { draftVisible });

// Fill 5 slots
const nodeIds = [];
for (const slot of SLOTS) {
  const updated = curl(
    adminCookie,
    "PUT",
    `/admin/modules/${moduleId}/slots/${slot.order}`,
    {
      title: slot.title,
      completionCriteria: slot.completionCriteria,
    }
  );
  step(`slot-${slot.order}`, updated.status === 200, { status: updated.status });
  const nodeId = updated.data?.node?.id;
  if (nodeId) nodeIds.push({ order: slot.order, id: nodeId, title: slot.title });
}

const detail = curl(adminCookie, "GET", `/admin/modules/${moduleId}`);
writeFileSync(path.join(OUT_DIR, "admin-module-detail-pre-publish.json"), JSON.stringify(detail.data, null, 2));
step("can-publish", detail.data?.canPublish === true, {
  canPublish: detail.data?.canPublish,
  reason: detail.data?.publishBlockReason,
});

// Publish
const published = curl(adminCookie, "POST", `/admin/modules/${moduleId}/publish`);
step("publish", published.status === 200, { status: published.status });
report.ids.pathNodeIds = nodeIds;

// AFTER publish
const pathAfter = curl(studentCookie, "GET", `/me/path?courseSlug=${COURSE_SLUG}`);
writeFileSync(path.join(OUT_DIR, "me-path-after-publish.json"), JSON.stringify(pathAfter.data, null, 2));
step("me-path-after", pathAfter.status === 200, { status: pathAfter.status });

const afterModules = pathAfter.data?.modules ?? [];
const foundModule = afterModules.find(
  (m) => m.title === MODULE_TITLE && (m.nodesTotal === 5 || (m.nodes?.length ?? 0) === 5)
);
step("module-visible-after", Boolean(foundModule), {
  moduleCount: afterModules.length,
  titles: moduleTitles(pathAfter.data),
});

report.ids.courseIdAfter = pathAfter.data?.course?.id;
report.modulesAfter = moduleTitles(pathAfter.data);
report.coursePublished = pathAfter.data?.course?.id && pathAfter.data.course.id !== "mock-course";

step("not-mock", report.coursePublished && pathAfter.data?.course?.id !== "mock-course", {
  courseId: pathAfter.data?.course?.id,
});

// Access check — anonymous blocked
try {
  execFileSync("rm", ["-f", path.join(OUT_DIR, "anon-cookies.txt")]);
} catch {
  /* noop */
}
const anonPath = curl(path.join(OUT_DIR, "anon-cookies.txt"), "GET", `/me/path?courseSlug=${COURSE_SLUG}`);
step("anonymous-blocked", anonPath.status === 401, { status: anonPath.status });

writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
console.log("\nDONE — evidence in", OUT_DIR);
console.log("moduleId:", moduleId);
console.log("pathNodeIds:", nodeIds.map((n) => n.id).join(", "));
