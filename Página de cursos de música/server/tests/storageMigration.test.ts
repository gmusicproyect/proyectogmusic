import assert from "node:assert/strict";
import { it } from "node:test";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { migrateStorage } from "../../scripts/storage/migrate-supabase.js";

it("migra todos los buckets, pagina, recorre carpetas y verifica SHA256 idempotente", async () => {
  const destination = await mkdtemp(path.join(os.tmpdir(), "gmusic-migrate-"));
  const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
    const pathname = new URL(String(url)).pathname;
    if (pathname.includes("/list/")) {
      const { prefix, offset } = JSON.parse(String(init?.body));
      const items = prefix ? [{ name: "guía.pdf", id: "file", metadata: { size: 3 } }] : [{ name: "curso", id: null }];
      return Response.json(offset === 0 ? items : []);
    }
    return new Response("abc");
  }) as typeof fetch;
  try {
    const options = { source: "http://127.0.0.1:9999", key: "staging-test", destination, fetcher, pageSize: 1 };
    const first = await migrateStorage(options);
    assert.equal(first.objects.length, 3);
    assert.ok(first.objects.every(o => o.action === "copied" && o.sha256 === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"));
    const filename = path.join(destination, "clases-pdf/curso/guía.pdf");
    const initial = await stat(filename);
    const second = await migrateStorage(options);
    assert.ok(second.objects.every(o => o.action === "unchanged"));
    assert.equal((await stat(filename)).mtimeMs, initial.mtimeMs);
    assert.equal(await readFile(filename, "utf8"), "abc");
    assert.equal(JSON.parse(await readFile(path.join(destination, "migration-manifest.json"), "utf8")).objects.length, 3);
  } finally { await rm(destination, { recursive: true, force: true }); }
});

it("no publica un archivo con tamaño incorrecto ni manifiesto de éxito", async () => {
  const destination = await mkdtemp(path.join(os.tmpdir(), "gmusic-migrate-error-"));
  try {
    const fetcher = (async (url: string | URL | Request) => String(url).includes("/list/")
      ? Response.json([{ name: "bad.pdf", id: "file", metadata: { size: 999 } }]) : new Response("abc")) as typeof fetch;
    await assert.rejects(migrateStorage({ source: "https://staging.example", key: "staging-test", destination, fetcher }), /Checksum/);
    await assert.rejects(stat(path.join(destination, "clases-video/bad.pdf")), { code: "ENOENT" });
    await assert.rejects(stat(path.join(destination, "migration-manifest.json")), { code: "ENOENT" });
  } finally { await rm(destination, { recursive: true, force: true }); }
});
