import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { lstat, mkdir, realpath, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "./errors.js";
import { buildSupabaseObjectUrl, parseSupabaseStorageUrl, PRIVATE_STORAGE_BUCKETS } from "./supabaseStorage.js";

export function resolveLocalStorageConfig() {
  const root = process.env.LOCAL_STORAGE_ROOT?.trim();
  const secret = process.env.LOCAL_STORAGE_SIGNING_SECRET ?? "";
  let origin: URL;
  try { origin = new URL(process.env.LOCAL_STORAGE_PUBLIC_ORIGIN ?? ""); }
  catch { throw new ApiError(503, "STORAGE_NOT_CONFIGURED", "Origen de almacenamiento no configurado."); }
  if (!root || !path.isAbsolute(root) || secret.length < 32 ||
      origin.protocol !== "https:" || origin.username || origin.password ||
      origin.pathname !== "/" || origin.search || origin.hash) {
    throw new ApiError(503, "STORAGE_NOT_CONFIGURED", "Almacenamiento local no configurado.");
  }
  return { root, secret, origin: origin.origin };
}

export function validateStorageKey(bucket: string, objectPath: string) {
  if (!(PRIVATE_STORAGE_BUCKETS as readonly string[]).includes(bucket) ||
      !objectPath || objectPath.length > 2048 || /[\\\x00-\x1f\x7f]/.test(objectPath) ||
      objectPath.split("/").some(segment => !segment || segment === "." || segment === ".." || segment.startsWith(".gmusic-"))) {
    throw new ApiError(400, "INVALID_STORAGE_URL", "Ruta de material inválida.");
  }
}

/** Only the API user may write this tree. Reject symlinks in every component. */
export async function localObjectPath(root: string, bucket: string, objectPath: string, createParents = false) {
  validateStorageKey(bucket, objectPath);
  const base = await realpath(root);
  const parts = [bucket, ...objectPath.split("/")];
  let current = base;
  for (let i = 0; i < parts.length; i++) {
    current = path.join(current, parts[i]);
    const parent = i < parts.length - 1;
    if (parent && createParents) await mkdir(current, { mode: 0o700 }).catch(error => {
      if (error.code !== "EEXIST") throw error;
    });
    const stat = await lstat(current).catch(error => {
      if (error.code === "ENOENT" && !parent) return null;
      throw error;
    });
    if (stat && (stat.isSymbolicLink() || (parent ? !stat.isDirectory() : !stat.isFile()))) {
      throw new ApiError(400, "INVALID_STORAGE_URL", "Ruta de material inválida.");
    }
  }
  return current;
}

export function storageSignature(bucket: string, objectPath: string, expires: number, secret: string) {
  return createHmac("sha256", secret).update(JSON.stringify(["gmusic-local-v1", bucket, objectPath, expires])).digest("hex");
}

export function verifyStorageSignature(bucket: string, objectPath: string, expires: unknown, signature: unknown, secret: string) {
  validateStorageKey(bucket, objectPath);
  if (typeof expires !== "string" || !/^\d{1,12}$/.test(expires) ||
      typeof signature !== "string" || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const expiry = Number(expires);
  if (expiry <= Math.floor(Date.now() / 1000)) return false;
  const expected = storageSignature(bucket, objectPath, expiry, secret);
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
}

export async function createSignedStorageUrl(materialUrl: string, expiresInSeconds = 3600): Promise<{ signedUrl: string; expiresIn: number }> {
  const object = parseSupabaseStorageUrl(materialUrl);
  if (!object || !Number.isInteger(expiresInSeconds) || expiresInSeconds < 1 || expiresInSeconds > 86400) {
    throw new ApiError(400, "INVALID_STORAGE_URL", "Material o caducidad inválidos.");
  }
  validateStorageKey(object.bucket, object.objectPath);
  const config = resolveLocalStorageConfig();
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const encoded = object.objectPath.split("/").map(encodeURIComponent).join("/");
  const signature = storageSignature(object.bucket, object.objectPath, expires, config.secret);
  return { signedUrl: `${config.origin}/api/v1/media/local/${object.bucket}/${encoded}?expires=${expires}&signature=${signature}`, expiresIn: expiresInSeconds };
}

export async function uploadStorageObject(input: { bucket: string; objectPath: string; body: Buffer; contentType: string }): Promise<string> {
  const config = resolveLocalStorageConfig();
  const target = await localObjectPath(config.root, input.bucket, input.objectPath, true);
  const temporary = path.join(path.dirname(target), `.gmusic-${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, input.body, { flag: "wx", mode: 0o600 });
    await rename(temporary, target);
  } finally { await unlink(temporary).catch(() => {}); }
  // Stable identifier only: this URL is never served unsigned. Existing clients
  // recognize this shape and ask /me/media/signed-url before playing it.
  return buildSupabaseObjectUrl(config.origin, input.bucket, input.objectPath);
}
