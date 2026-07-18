import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { execFileSync } from 'child_process';

const PROD = 'https://gmusic-api.onrender.com/api/v1';
const ORIGIN = 'https://proyectogmusic.vercel.app';
const COOKIE = '/tmp/tpub02-prod-cookies.txt';
const EMAIL = 'qa-alumno-prod-001@gmusic.test';
const PASS = 'QaAlumnoProd001!';
const B3_NODE1 = '5ae7cfd7-d767-450e-883a-7683e3959f75';
const prisma = new PrismaClient();

function curl(method, path, body) {
  const args = [
    '-sS', '-c', COOKIE, '-b', COOKIE, '-X', method,
    '-H', 'Content-Type: application/json',
    '-H', `Origin: ${ORIGIN}`,
    '-w', '\n__HTTP__%{http_code}',
    `${PROD}${path}`,
  ];
  if (body) args.push('-d', JSON.stringify(body));
  const out = execFileSync('curl', args, { encoding: 'utf8' });
  const m = out.match(/__HTTP__(\d+)$/);
  const status = m ? Number(m[1]) : 0;
  const raw = out.replace(/\n__HTTP__\d+$/, '');
  let data = null;
  try { data = JSON.parse(raw); } catch { data = raw; }
  return { status, data };
}

function sessionIdFrom(data) {
  return data?.sessionId ?? data?.session?.id ?? null;
}

function flattenNodes(modules) {
  const out = [];
  for (const m of modules ?? []) {
    for (const n of m.nodes ?? []) out.push({ ...n, moduleTitle: m.title });
  }
  return out;
}

async function getAnswersForNode(nodeId) {
  const exs = await prisma.microExercise.findMany({
    where: { nodeId },
    orderBy: { order: 'asc' },
    select: { id: true, type: true, secureAnswer: true, contentPayload: true },
  });
  return exs.map((ex) => {
    let selectedAnswer = ex.secureAnswer?.correctOptionId;
    if (ex.type === 'RHYTHM_TAP') {
      selectedAnswer = ex.contentPayload?.submissionOptionId ?? ex.secureAnswer?.correctOptionId ?? 'tap-complete';
    }
    return { exerciseId: ex.id, selectedAnswer };
  });
}

const report = { steps: [], account: EMAIL };
const step = (name, ok, extra = {}) => report.steps.push({ name, ok, ...extra });

try { execFileSync('rm', ['-f', COOKIE]); } catch { /* noop */ }

const login = curl('POST', '/auth/login', { email: EMAIL, password: PASS });
step('login', login.status === 200, { status: login.status });

let b3Done = false;
for (let i = 0; i < 12 && !b3Done; i++) {
  const pathRes = curl('GET', '/me/path?courseSlug=ruta-guitarra-12-meses');
  const nodes = flattenNodes(pathRes.data?.modules);
  const b3n1 = nodes.find((n) => n.id === B3_NODE1);
  const playable = nodes.find((n) => n.status === 'available' || n.status === 'active');
  step(`path-${i + 1}`, pathRes.status === 200, {
    playable: playable ? { title: playable.title, status: playable.status } : null,
    b3n1Status: b3n1?.status,
  });
  if (!playable) break;

  const answers = await getAnswersForNode(playable.id);
  const start = curl('POST', '/lesson-sessions', { nodeId: playable.id });
  const sessionId = sessionIdFrom(start.data);
  const exCount = start.data?.exercises?.length ?? 0;
  step(`start-${playable.title?.slice(0, 30)}`, (start.status === 200 || start.status === 201) && exCount > 0, {
    sessionId, exCount,
  });
  if (!sessionId) break;

  const complete = curl('POST', `/lesson-sessions/${sessionId}/complete`, { attempts: answers });
  const ok = complete.status === 200 && complete.data?.nodeCompleted === true;
  step(`complete-${playable.title?.slice(0, 30)}`, ok, {
    nodeCompleted: complete.data?.nodeCompleted,
    xpEarned: complete.data?.xpEarned,
    err: complete.data?.error,
  });
  if (!ok) break;

  if (playable.id === B3_NODE1) {
    const again = curl('POST', `/lesson-sessions/${sessionId}/complete`, { attempts: answers });
    step('b3-idempotent', again.data?.alreadyProcessed === true, { alreadyProcessed: again.data?.alreadyProcessed });
    b3Done = true;
  }
}

const final = curl('GET', '/me/path?courseSlug=ruta-guitarra-12-meses');
const b3final = flattenNodes(final.data?.modules).find((n) => n.id === B3_NODE1);
step('b3-node1-completed', b3final?.status === 'completed', { status: b3final?.status });

report.pass = report.steps.every((s) => s.ok);
writeFileSync('/tmp/gmusic-tpub02-smoke/api-prod.json', JSON.stringify(report, null, 2));
await prisma.$disconnect();
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
