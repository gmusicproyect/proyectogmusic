/**
 * T-PUB-01 SHOULD T1 — placeholder PDF en B4 slot 1 vía /admin/storage/upload
 * Uso: node --env-file=.env scripts/ops/t-pub-01-should-t1-upload.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../../.agents/operations/t-pub-01-prod-evidence");
const PROD = "https://gmusic-api.onrender.com/api/v1";
const ORIGIN = "https://proyectogmusic.vercel.app";
const MODULE_ID = "6b36c6ea-db8e-4c0b-addd-e31abdca6290";
const MODULE_ORDER = 4;
const SLOT = 1;
const PREFIX = `admin/b${MODULE_ORDER}/slot-${SLOT}`;
const PDF = path.resolve(__dirname, "pilot-fundamento-1.pdf");

const adminPass = process.env.ADMIN_SEED_PASSWORD?.trim();
if (!adminPass) {
  console.error("STOP: ADMIN_SEED_PASSWORD missing");
  process.exit(1);
}

const cookie = path.join(OUT, "admin-cookies-t1.txt");
try {
  execFileSync("rm", ["-f", cookie]);
} catch {
  /* noop */
}

function curlJson(method, apiPath, body) {
  const args = [
    "-sS",
    "-c",
    cookie,
    "-b",
    cookie,
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
  const out = execFileSync("curl", args, { encoding: "utf8" });
  const m = out.match(/__HTTP__(\d+)$/);
  return { status: m ? Number(m[1]) : 0, data: JSON.parse(out.replace(/\n__HTTP__\d+$/, "")) };
}

const login = curlJson("POST", "/auth/login", {
  email: "admin@gmusic.academy",
  password: adminPass,
});
if (login.status !== 200) {
  console.error("STOP: admin login", login.status);
  process.exit(1);
}

const uploadOut = execFileSync(
  "curl",
  [
    "-sS",
    "-c",
    cookie,
    "-b",
    cookie,
    "-X",
    "POST",
    "-H",
    `Origin: ${ORIGIN}`,
    "-F",
    "kind=pdf",
    "-F",
    `prefix=${PREFIX}`,
    "-F",
    `file=@${PDF}`,
    "-w",
    "\n__HTTP__%{http_code}",
    `${PROD}/admin/storage/upload`,
  ],
  { encoding: "utf8" }
);
const um = uploadOut.match(/__HTTP__(\d+)$/);
const uploadStatus = um ? Number(um[1]) : 0;
const uploadBody = JSON.parse(uploadOut.replace(/\n__HTTP__\d+$/, ""));
writeFileSync(path.join(OUT, "should-t1-upload.json"), JSON.stringify({ uploadStatus, uploadBody, prefix: PREFIX }, null, 2));

if (uploadStatus !== 201) {
  console.error("STOP: upload", uploadStatus, uploadBody);
  process.exit(1);
}

const slot = curlJson("PUT", `/admin/modules/${MODULE_ID}/slots/${SLOT}`, {
  title: "Por qué Em: el acorde de dos dedos",
  completionCriteria: "El alumno explica por qué Em es el acorde de dos dedos",
  guidePdfUrl: uploadBody.materialUrl,
});
if (slot.status !== 200) {
  console.error("STOP: slot update", slot.status, slot.data);
  process.exit(1);
}

writeFileSync(
  path.join(OUT, "should-t1-slot.json"),
  JSON.stringify({ slot: slot.data, materialUrl: uploadBody.materialUrl, objectPath: uploadBody.objectPath }, null, 2)
);

console.log("PASS should-t1-upload", uploadBody.objectPath);
console.log("PASS slot-1-pdf", uploadBody.materialUrl.slice(0, 80) + "...");
