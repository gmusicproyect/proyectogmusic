import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { createApp } from "../app.js";
import { createSignedStorageUrl, uploadStorageObject, storageDriver } from "../lib/storage.js";
import { storageSignature, validateStorageKey } from "../lib/localStorage.js";
import { prisma } from "../lib/prisma.js";
import { buildSessionCookieHeader } from "./helpers/authSession.js";

describe("local storage: firma, streaming y compatibilidad", () => {
  let root: string;
  let material: string;
  const env = { ...process.env };
  const secret = "test-only-local-storage-signing-secret-32";
  const app = createApp();
  const route = (url: string) => new URL(url).pathname + new URL(url).search;
  before(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "gmusic-storage-"));
    Object.assign(process.env, { STORAGE_DRIVER: "local", LOCAL_STORAGE_ROOT: root, LOCAL_STORAGE_SIGNING_SECRET: secret, LOCAL_STORAGE_PUBLIC_ORIGIN: "https://media.example.test" });
    material = await uploadStorageObject({ bucket: "clases-video", objectPath: "curso/lección uno.mp4", body: Buffer.from("0123456789"), contentType: "video/mp4" });
  });
  after(async () => {
    for (const key of ["STORAGE_DRIVER", "LOCAL_STORAGE_ROOT", "LOCAL_STORAGE_SIGNING_SECRET", "LOCAL_STORAGE_PUBLIC_ORIGIN"]) {
      if (env[key] === undefined) delete process.env[key]; else process.env[key] = env[key];
    }
    await rm(root, { recursive: true, force: true });
  });
  it("mantiene el contrato y hace streaming con Range", async () => {
    const result = await createSignedStorageUrl(material);
    assert.deepEqual(Object.keys(result).sort(), ["expiresIn", "signedUrl"]);
    assert.equal(result.expiresIn, 3600);
    const response = await request(app).get(route(result.signedUrl)).set("Range", "bytes=2-5");
    assert.equal(response.status, 206);
    assert.equal(response.headers["content-range"], "bytes 2-5/10");
    assert.equal(response.body.toString(), "2345");
    assert.equal(response.headers["cache-control"], "private, no-store");
  });
  it("HEAD y lectura completa funcionan", async () => {
    const signed = route((await createSignedStorageUrl(material)).signedUrl);
    assert.equal((await request(app).head(signed)).headers["content-length"], "10");
    assert.equal((await request(app).get(signed)).body.toString(), "0123456789");
  });
  it("no sirve identificadores sin firma", async () => {
    assert.equal((await request(app).get(new URL(material).pathname)).status, 404);
    assert.equal((await request(app).get("/api/v1/media/local/clases-video/curso/a.mp4")).status, 403);
  });
  it("rechaza firma cambiada y otro objeto", async () => {
    const signed = new URL((await createSignedStorageUrl(material)).signedUrl);
    signed.searchParams.set("signature", "0".repeat(64));
    assert.equal((await request(app).get(route(signed.href))).status, 403);
    const valid = (await createSignedStorageUrl(material)).signedUrl;
    assert.equal((await request(app).get(route(valid.replace("clases-video", "clases-pdf")))).status, 403);
  });
  it("rechaza caducidad incluso con HMAC correcto", async () => {
    const expires = Math.floor(Date.now() / 1000) - 1;
    const signature = storageSignature("clases-video", "a.mp4", expires, secret);
    assert.equal((await request(app).get(`/api/v1/media/local/clases-video/a.mp4?expires=${expires}&signature=${signature}`)).status, 403);
  });
  it("puede resolver referencias Supabase migradas sin cambiar la DB", async () => {
    const legacy = material.replace("https://media.example.test", "https://staging.supabase.co");
    const signed = await createSignedStorageUrl(legacy);
    assert.equal((await request(app).get(route(signed.signedUrl))).status, 200);
  });
  it("rechaza traversal, buckets ajenos y TTL inválido", async () => {
    for (const key of ["../a", "a/../../b", "/etc/passwd", "a\\b", "a//b", "a\u0000b"]) {
      assert.throws(() => validateStorageKey("clases-video", key));
    }
    assert.throws(() => validateStorageKey("public", "a"));
    await assert.rejects(createSignedStorageUrl(material, 0));
    await assert.rejects(createSignedStorageUrl(material, 86401));
  });
  it("rechaza enlaces simbólicos al leer y escribir", async () => {
    await symlink(os.tmpdir(), path.join(root, "clases-video", "escape"));
    const url = "https://old.example/storage/v1/object/clases-video/escape/a.mp4";
    const signed = await createSignedStorageUrl(url);
    assert.equal((await request(app).get(route(signed.signedUrl))).status, 400);
    await assert.rejects(uploadStorageObject({ bucket: "clases-video", objectPath: "escape/a.mp4", body: Buffer.from("x"), contentType: "video/mp4" }));
  });
  it("subida es reemplazable e independiente del proveedor", async () => {
    const input = { bucket: "clases-pdf", objectPath: "guia.pdf", body: Buffer.from("first"), contentType: "application/pdf" };
    await uploadStorageObject(input);
    await uploadStorageObject({ ...input, body: Buffer.from("second") });
    assert.equal(await readFile(path.join(root, "clases-pdf/guia.pdf"), "utf8"), "second");
  });
  it("falta de archivo devuelve 404", async () => {
    const signed = await createSignedStorageUrl("https://x/storage/v1/object/clases-pdf/missing.pdf");
    assert.equal((await request(app).get(route(signed.signedUrl))).status, 404);
  });
  it("Supabase es el default y deshabilita la ruta local", async () => {
    delete process.env.STORAGE_DRIVER;
    assert.equal(storageDriver(), "supabase");
    assert.equal((await request(app).get("/api/v1/media/local/clases-video/a.mp4")).status, 404);
    process.env.STORAGE_DRIVER = "invalid";
    assert.throws(storageDriver);
    process.env.STORAGE_DRIVER = "local";
  });
  it("falla cerrado sin secreto local", async () => {
    delete process.env.LOCAL_STORAGE_SIGNING_SECRET;
    await assert.rejects(createSignedStorageUrl(material));
    process.env.LOCAL_STORAGE_SIGNING_SECRET = secret;
  });
  it("POST firmado conserva autorización y contrato usando disco local", { skip: !process.env.DATABASE_URL }, async () => {
    const student = await prisma.user.create({ data: { name: "Storage test", email: `storage-${Date.now()}@example.test` } });
    try {
      const cookie = await buildSessionCookieHeader(student.id);
      const call = () => request(app).post("/api/v1/me/media/signed-url").set("Cookie", cookie).send({ materialUrl: material });
      assert.equal((await call()).status, 403);
      await prisma.subscription.create({ data: { userId: student.id, planId: "test-storage", status: "ACTIVE" } });
      const response = await call();
      assert.equal(response.status, 200);
      assert.equal(response.body.expiresIn, 3600);
      assert.deepEqual(Object.keys(response.body).sort(), ["expiresIn", "signedUrl"]);
      assert.equal((await request(app).get(route(response.body.signedUrl))).status, 200);
    } finally { await prisma.user.delete({ where: { id: student.id } }); }
  });
});
