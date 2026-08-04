import { randomUUID } from "node:crypto";
import type { Request } from "express";
import multer from "multer";
import { ApiError } from "./errors.js";
import {
  ADMIN_UPLOAD_BUCKETS,
  type AdminUploadKind,
  sanitizeUploadFilename,
} from "./supabaseStorage.js";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

export const adminStorageUploadMiddleware = upload.single("file");

export function parseAdminUploadKind(value: unknown): AdminUploadKind {
  if (value !== "video" && value !== "pdf") {
    throw new ApiError(
      400,
      "INVALID_UPLOAD",
      "kind debe ser video o pdf."
    );
  }
  return value;
}

export function resolveAdminUploadTarget(req: Request): {
  kind: AdminUploadKind;
  bucket: string;
  objectPath: string;
  body: Buffer;
  contentType: string;
} {
  const kind = parseAdminUploadKind(req.body?.kind);
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "INVALID_UPLOAD", "Archivo requerido.");
  }

  if (file.size <= 0) {
    throw new ApiError(400, "INVALID_UPLOAD", "El archivo está vacío.");
  }

  const safeName = sanitizeUploadFilename(file.originalname);
  const prefix =
    typeof req.body?.prefix === "string" && req.body.prefix.trim()
      ? req.body.prefix.trim().replace(/^\/+|\/+$/g, "")
      : `uploads/${randomUUID()}`;

  const bucket = ADMIN_UPLOAD_BUCKETS[kind];
  const objectPath = `${prefix}/${safeName}`;

  if (kind === "video" && !file.mimetype.startsWith("video/")) {
    throw new ApiError(400, "INVALID_UPLOAD", "El video debe ser un archivo de video.");
  }

  if (kind === "pdf" && file.mimetype !== "application/pdf") {
    throw new ApiError(400, "INVALID_UPLOAD", "El PDF debe ser application/pdf.");
  }

  return {
    kind,
    bucket,
    objectPath,
    body: file.buffer,
    contentType: file.mimetype || (kind === "pdf" ? "application/pdf" : "video/mp4"),
  };
}
