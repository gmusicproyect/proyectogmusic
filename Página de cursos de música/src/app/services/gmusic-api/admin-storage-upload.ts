import { GmusicApiError, runFetch } from "./client";
import { getApiBaseUrl } from "./config";
import type { ApiErrorBody } from "./types";

export type AdminStorageUploadKind = "video" | "pdf";

export type AdminStorageUploadResponse = {
  kind: AdminStorageUploadKind;
  bucket: string;
  objectPath: string;
  materialUrl: string;
};

export async function uploadAdminStorageFile(input: {
  kind: AdminStorageUploadKind;
  file: File;
  prefix?: string;
  signal?: AbortSignal;
}): Promise<AdminStorageUploadResponse> {
  const formData = new FormData();
  formData.append("kind", input.kind);
  formData.append("file", input.file);
  if (input.prefix?.trim()) {
    formData.append("prefix", input.prefix.trim());
  }

  const response = await runFetch(`${getApiBaseUrl()}/admin/storage/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
    signal: input.signal,
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = `Error ${response.status} al subir el archivo.`;

    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body.error?.code) code = body.error.code;
      if (body.error?.message) message = body.error.message;
    } catch {
      // noop
    }

    throw new GmusicApiError(message, response.status, code);
  }

  return (await response.json()) as AdminStorageUploadResponse;
}
