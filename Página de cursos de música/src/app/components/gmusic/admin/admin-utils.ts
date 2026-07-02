import type { AdminModuleListItem } from "../../../services/gmusic-api/admin";

export const STAGE_HINTS: Record<number, string> = {
  1: "Qué aprenderá el alumno en esta etapa — concepto inicial.",
  2: "Diagrama, observación o segundo fundamento.",
  3: "Ejercicio técnico medible.",
  4: "Práctica guiada por secciones.",
  5: "Checkpoint: tocar al pulso o ejecutar el outcome del bloque.",
};

export const BLOCK_STARTER_TITLES = [
  "Tu primer acorde: La menor",
  "Mi menor",
  "El primer cambio",
] as const;

export function statusLabel(status: AdminModuleListItem["listStatus"]) {
  if (status === "published") return "Publicado";
  if (status === "draft") return "Borrador";
  return "Vacío";
}

export function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

export function computeAdminStats(modules: AdminModuleListItem[]) {
  return {
    total: modules.length,
    published: modules.filter((m) => m.listStatus === "published").length,
    draft: modules.filter((m) => m.listStatus === "draft").length,
    empty: modules.filter((m) => m.listStatus === "empty").length,
  };
}
