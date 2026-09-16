import * as supabase from "./supabaseStorage.js";
import * as local from "./localStorage.js";
import { ApiError } from "./errors.js";

export function storageDriver() {
  const driver = process.env.STORAGE_DRIVER?.trim() || "supabase";
  if (driver !== "supabase" && driver !== "local") {
    throw new ApiError(503, "STORAGE_NOT_CONFIGURED", "Driver de almacenamiento inválido.");
  }
  return driver;
}

export const createSignedStorageUrl: typeof supabase.createSignedStorageUrl = (...args) =>
  (storageDriver() === "local" ? local : supabase).createSignedStorageUrl(...args);

export const uploadStorageObject: typeof supabase.uploadStorageObject = (...args) =>
  (storageDriver() === "local" ? local : supabase).uploadStorageObject(...args);
