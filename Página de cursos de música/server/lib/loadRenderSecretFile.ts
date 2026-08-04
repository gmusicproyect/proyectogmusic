import fs from "node:fs";

/** Rutas Render Secret Files (runtime: /etc/secrets/<filename>). */
const SUPABASE_SECRET_PATHS = ["/etc/secrets/supabase.env"] as const;

function parseEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const eq = trimmed.indexOf("=");
  if (eq <= 0) return null;

  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  if (!key) return null;
  return { key, value };
}

export function loadRenderSecretFile(path: string): void {
  if (!fs.existsSync(path)) return;

  const content = fs.readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const parsed = parseEnvLine(line);
    if (!parsed) continue;
    if (!process.env[parsed.key]) {
      process.env[parsed.key] = parsed.value;
    }
  }
}

/** Carga credenciales Supabase desde Secret File de Render si faltan en env. */
export function loadSupabaseSecretsFromRender(): void {
  for (const path of SUPABASE_SECRET_PATHS) {
    loadRenderSecretFile(path);
  }
}
