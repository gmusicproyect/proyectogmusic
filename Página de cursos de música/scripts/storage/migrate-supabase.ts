import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { localObjectPath, validateStorageKey } from "../../server/lib/localStorage.js";
import { PRIVATE_STORAGE_BUCKETS } from "../../server/lib/supabaseStorage.js";

async function checksum(filename: string) {
  const hash = createHash("sha256");
  for await (const data of createReadStream(filename)) hash.update(data);
  return hash.digest("hex");
}

/** Explicit staging source; does not load .env or use production credentials. */
export async function migrateStorage(options: { source: string; key: string; destination: string; fetcher?: typeof fetch; pageSize?: number }) {
  const source = new URL(options.source);
  if (source.pathname !== "/" || source.search || source.hash || source.username || source.password ||
      !(source.protocol === "https:" || (source.protocol === "http:" && ["127.0.0.1", "localhost"].includes(source.hostname)))) throw new Error("Origen inválido");
  if (!path.isAbsolute(options.destination) || !options.key) throw new Error("Destino absoluto y clave requeridos");
  const fetcher = options.fetcher ?? fetch;
  const headers = { Authorization: `Bearer ${options.key}`, apikey: options.key };
  const limit = options.pageSize ?? 100;
  await mkdir(options.destination, { recursive: true, mode: 0o700 });
  const records: Array<{ bucket: string; objectPath: string; sha256: string; bytes: number; action: string }> = [];
  async function walk(bucket: string, prefix: string) {
    for (let offset = 0; ; offset += limit) {
      const response = await fetcher(`${source.origin}/storage/v1/object/list/${bucket}`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ prefix, limit, offset, sortBy: { column: "name", order: "asc" } }),
        redirect: "error", signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) throw new Error(`Listado falló: ${bucket} HTTP ${response.status}`);
      const items = await response.json() as Array<{ name: string; id: string | null; metadata?: { size?: number } | null }>;
      if (!Array.isArray(items)) throw new Error("Listado inválido");
      for (const item of items) {
        if (typeof item.name !== "string" || item.name.includes("/")) throw new Error("Nombre inválido en listado");
        const objectPath = prefix ? `${prefix}/${item.name}` : item.name;
        validateStorageKey(bucket, objectPath);
        if (item.id === null && item.metadata == null) { await walk(bucket, objectPath); continue; }
        const target = await localObjectPath(options.destination, bucket, objectPath, true);
        const temporary = path.join(path.dirname(target), `.gmusic-${randomUUID()}.tmp`);
        try {
          const encoded = objectPath.split("/").map(encodeURIComponent).join("/");
          const file = await fetcher(`${source.origin}/storage/v1/object/authenticated/${bucket}/${encoded}`, { headers, redirect: "error", signal: AbortSignal.timeout(300000) });
          if (!file.ok || !file.body) throw new Error(`Descarga falló: ${bucket}/${objectPath} HTTP ${file.status}`);
          const sourceHash = createHash("sha256");
          let bytes = 0;
          const meter = new Transform({ transform(chunk, _encoding, done) { sourceHash.update(chunk); bytes += chunk.length; done(null, chunk); } });
          await pipeline(Readable.fromWeb(file.body as Parameters<typeof Readable.fromWeb>[0]), meter, createWriteStream(temporary, { flags: "wx", mode: 0o600 }));
          const sha256 = sourceHash.digest("hex");
          if (sha256 !== await checksum(temporary) || (typeof item.metadata?.size === "number" && item.metadata.size !== bytes)) throw new Error(`Checksum/tamaño incorrecto: ${objectPath}`);
          const existing = await checksum(target).catch(error => { if (error.code === "ENOENT") return null; throw error; });
          const action = existing === sha256 ? "unchanged" : "copied";
          if (action === "copied") await rename(temporary, target);
          records.push({ bucket, objectPath, sha256, bytes, action });
        } finally { await unlink(temporary).catch(() => {}); }
      }
      if (items.length < limit) break;
    }
  }
  for (const bucket of PRIVATE_STORAGE_BUCKETS) await walk(bucket, "");
  const manifest = { source: source.origin, completedAt: new Date().toISOString(), objects: records };
  const temporaryManifest = path.join(options.destination, `.gmusic-${randomUUID()}.tmp`);
  await writeFile(temporaryManifest, JSON.stringify(manifest, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  await rename(temporaryManifest, path.join(options.destination, "migration-manifest.json"));
  return manifest;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  if (!process.argv.includes("--staging-copy")) throw new Error("Se requiere --staging-copy; no ejecutar contra producción en esta ronda.");
  const manifest = await migrateStorage({ source: process.env.MIGRATION_SUPABASE_URL ?? "", key: process.env.MIGRATION_SUPABASE_KEY ?? "", destination: process.env.MIGRATION_STORAGE_ROOT ?? "" });
  console.log(`Verificados ${manifest.objects.length} archivos; manifest escrito en el destino.`);
}
