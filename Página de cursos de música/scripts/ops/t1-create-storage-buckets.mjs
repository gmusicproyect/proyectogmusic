/**
 * T1.1 — Crea los 4 buckets de Storage en Supabase (idempotente).
 *
 * Requiere en .env local (NUNCA commitear; service role SOLO local/Render):
 *   SUPABASE_URL=https://tosbwmqijmtxchvcgrkj.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=...
 *
 * Uso:
 *   node --env-file=.env scripts/ops/t1-create-storage-buckets.mjs
 *
 * Obtener service role: Supabase → Project Settings → API → service_role (secret).
 */
const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const BUCKETS = [
  { name: "demo-media", public: true },
  { name: "clases-video", public: false },
  { name: "clases-pdf", public: false },
  { name: "ejercicios-media", public: false },
];

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!SUPABASE_URL) {
  fail("SUPABASE_URL no definida. Ej: https://tosbwmqijmtxchvcgrkj.supabase.co");
}
if (!SERVICE_ROLE_KEY) {
  fail("SUPABASE_SERVICE_ROLE_KEY no definida (Settings → API → service_role).");
}

async function api(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: res.ok, status: res.status, body };
}

async function listBuckets() {
  const { ok, status, body } = await api("/bucket");
  if (!ok) {
    fail(`List buckets falló (${status}): ${JSON.stringify(body)}`);
  }
  return body;
}

async function createBucket({ name, public: isPublic }) {
  const existing = await listBuckets();
  if (existing.some((b) => b.name === name || b.id === name)) {
    console.log(`⏭️  Bucket "${name}" ya existe — omitido.`);
    return;
  }

  const { ok, status, body } = await api("/bucket", {
    method: "POST",
    body: JSON.stringify({
      name,
      public: isPublic,
      file_size_limit: isPublic ? 52_428_800 : 524_288_000,
    }),
  });

  if (!ok) {
    fail(`Crear "${name}" falló (${status}): ${JSON.stringify(body)}`);
  }
  console.log(`✅ Bucket "${name}" creado (${isPublic ? "público" : "privado"}).`);
}

async function main() {
  console.log(`Supabase: ${SUPABASE_URL}`);
  for (const bucket of BUCKETS) {
    await createBucket(bucket);
  }
  const final = await listBuckets();
  const names = final.map((b) => b.name ?? b.id).sort();
  console.log("\nBuckets actuales:", names.join(", "));
  console.log("\nSiguiente: T1.2 blindaje (incógnito en URLs de buckets privados).");
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});
