/**
 * T1.3 piloto — sube archivos a Storage y actualiza PathNode (requiere service role en .env).
 * Nunca loguea secretos.
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const PATH_NODE_ID =
  process.env.T1_PATH_NODE_ID ?? "94d0f47c-f493-4ba9-aed4-67aa6f13a5f0";

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

if (!SUPABASE_URL) fail("SUPABASE_URL ausente en .env");
if (!SERVICE_ROLE_KEY) fail("SUPABASE_SERVICE_ROLE_KEY ausente en .env");

async function upload(bucket, objectPath, filePath, contentType) {
  const body = readFileSync(filePath);
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body,
    }
  );
  const text = await res.text();
  if (!res.ok) {
    fail(`Upload ${bucket}/${objectPath} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return `${bucket}/${objectPath}`;
}

async function verifyPublicUrl(label, url, expectOk) {
  const res = await fetch(url);
  const status = res.status;
  const pass = expectOk ? status >= 200 && status < 300 : status >= 400;
  console.log(`${pass ? "✅" : "❌"} ${label}: HTTP ${status} (sin auth)`);
  if (!pass) fail(`Verificación falló: ${label}`);
}

async function main() {
  const opsDir = new URL(".", import.meta.url).pathname;
  const blindaje = `${opsDir}test-blindaje.txt`;
  const pdf = `${opsDir}pilot-fundamento-1.pdf`;
  const video = `${opsDir}pilot-fundamento-1.mp4`;

  console.log("Subiendo archivos de blindaje T1.2…");
  await upload("clases-video", "test-blindaje.txt", blindaje, "text/plain");
  await upload("clases-pdf", "test-blindaje.txt", blindaje, "text/plain");
  await upload("ejercicios-media", "test-blindaje.txt", blindaje, "text/plain");
  await upload("demo-media", "test-demo-public.txt", blindaje, "text/plain");

  console.log("\nVerificando blindaje (curl limpio)…");
  const base = `${SUPABASE_URL}/storage/v1/object/public`;
  await verifyPublicUrl(
    "clases-video privado",
    `${base}/clases-video/test-blindaje.txt`,
    false
  );
  await verifyPublicUrl(
    "clases-pdf privado",
    `${base}/clases-pdf/test-blindaje.txt`,
    false
  );
  await verifyPublicUrl(
    "ejercicios-media privado",
    `${base}/ejercicios-media/test-blindaje.txt`,
    false
  );
  await verifyPublicUrl(
    "demo-media público",
    `${base}/demo-media/test-demo-public.txt`,
    true
  );

  console.log("\nSubiendo piloto T1.3…");
  const videoPath = await upload(
    "clases-video",
    "pilot/fundamentos/tu-guitarra-y-postura.mp4",
    video,
    "video/mp4"
  );
  const pdfPath = await upload(
    "clases-pdf",
    "pilot/fundamentos/tu-guitarra-y-postura.pdf",
    pdf,
    "application/pdf"
  );

  const videoUrl = `${SUPABASE_URL}/storage/v1/object/public/${videoPath}`;
  const guidePdfUrl = `${SUPABASE_URL}/storage/v1/object/public/${pdfPath}`;

  const prisma = new PrismaClient();
  try {
    const updated = await prisma.pathNode.update({
      where: { id: PATH_NODE_ID },
      data: { videoUrl, guidePdfUrl },
      select: { id: true, title: true, videoUrl: true, guidePdfUrl: true },
    });
    console.log("\n✅ PathNode actualizado:", updated.title);
    console.log("   videoUrl:", updated.videoUrl);
    console.log("   guidePdfUrl:", updated.guidePdfUrl);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌", err.message ?? err);
  process.exit(1);
});
