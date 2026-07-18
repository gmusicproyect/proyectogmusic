/**
 * DB-02 — Clasificación fail-closed de DATABASE_URL para pruebas.
 * Nunca imprime contraseñas ni URI completas.
 */

/** Proyecto Supabase de producción (Gate DB-01, Juan 11 Jul 2026). */
export const PRODUCTION_SUPABASE_PROJECT_REF = "tosbwmqijmtxchvcgrkj";

/** Host pooler de producción (us-east-1). */
export const PRODUCTION_SUPABASE_HOST = "aws-1-us-east-1.pooler.supabase.com";

/**
 * Proyecto Supabase CI (fingerprint de `.env.ci` local, us-east-2).
 * Si se rota el proyecto CI, actualizar ref + host + docs/operations/DB-02-*.
 */
export const ALLOWED_CI_SUPABASE_PROJECT_REF = "wdrrqbclhrzghcewygdj";

/** Host pooler CI canónico (us-east-2). Debe coincidir junto con el ref. */
export const ALLOWED_CI_SUPABASE_HOST = "aws-1-us-east-2.pooler.supabase.com";

/** Nombre de base Docker local (docker-compose.yml). */
export const ALLOWED_LOCAL_DATABASE_NAME = "gmusic_learning_db";

/** Puerto Docker local esperado. */
export const ALLOWED_LOCAL_PORT = "5432";

/** @typedef {"missing"|"invalid"|"production"|"ci"|"local"|"unknown_supabase"|"unknown_remote"|"local_mismatch"} DbEnvKind */

/**
 * @param {string | undefined | null} databaseUrl
 * @returns {{
 *   ok: boolean,
 *   kind: DbEnvKind,
 *   reason: string,
 *   host: string | null,
 *   projectRef: string | null,
 *   databaseName: string | null,
 *   port: string | null,
 *   safeSummary: string,
 * }}
 */
export function classifyDatabaseUrl(databaseUrl) {
  if (databaseUrl == null || String(databaseUrl).trim() === "") {
    return fail("missing", "DATABASE_URL ausente o vacía.", null, null, null, null);
  }

  const raw = String(databaseUrl).trim();
  let url;
  try {
    url = new URL(raw);
  } catch {
    return fail(
      "invalid",
      "DATABASE_URL malformada (no es una URL válida).",
      null,
      null,
      null,
      null
    );
  }

  if (!/^postgres(ql)?:$/i.test(url.protocol)) {
    return fail(
      "invalid",
      "DATABASE_URL debe usar protocolo postgresql/postgres.",
      normalizeHost(url.hostname),
      null,
      null,
      null,
      raw
    );
  }

  const host = normalizeHost(url.hostname);
  const projectRef = extractSupabaseProjectRef(url.username || "");
  const databaseName = extractDatabaseName(url.pathname);
  const port = effectivePort(url.port);

  // Producción: siempre rechazar (ref o host de prod).
  if (
    projectRef === PRODUCTION_SUPABASE_PROJECT_REF ||
    host === PRODUCTION_SUPABASE_HOST
  ) {
    return fail(
      "production",
      "DATABASE_URL apunta a PRODUCCIÓN (prohibido en tests).",
      host,
      projectRef,
      databaseName,
      port,
      raw
    );
  }

  if (isLocalHost(host)) {
    if (databaseName !== ALLOWED_LOCAL_DATABASE_NAME) {
      return fail(
        "local_mismatch",
        `Postgres local: se exige base "${ALLOWED_LOCAL_DATABASE_NAME}", recibido "${databaseName ?? "(vacía)"}".`,
        host,
        null,
        databaseName,
        port,
        raw
      );
    }
    if (port !== ALLOWED_LOCAL_PORT) {
      return fail(
        "local_mismatch",
        `Postgres local: se exige puerto ${ALLOWED_LOCAL_PORT}, recibido ${port}.`,
        host,
        null,
        databaseName,
        port,
        raw
      );
    }
    return {
      ok: true,
      kind: "local",
      reason: "Postgres Docker local permitido.",
      host,
      projectRef: null,
      databaseName,
      port,
      safeSummary: redactDatabaseUrl(raw),
    };
  }

  // CI: ref canónico Y host canónico simultáneos (sin includes() permisivo).
  if (
    projectRef === ALLOWED_CI_SUPABASE_PROJECT_REF &&
    host === ALLOWED_CI_SUPABASE_HOST
  ) {
    return {
      ok: true,
      kind: "ci",
      reason: "Proyecto Supabase CI permitido (ref + host canónicos).",
      host,
      projectRef,
      databaseName,
      port,
      safeSummary: redactDatabaseUrl(raw),
    };
  }

  // Host que parece Supabase oficial (pooler.supabase.com exact suffix) pero no es el par CI.
  if (isOfficialSupabasePoolerHost(host)) {
    return fail(
      "unknown_supabase",
      "Supabase remoto desconocido o incompleto (ref/host no coinciden con el CI canónico).",
      host,
      projectRef,
      databaseName,
      port,
      raw
    );
  }

  // Hosts que intentan parecerse a supabase (evil-supabase.com, supabase.com.evil…).
  if (looksLikeSupabaseImpersonation(host)) {
    return fail(
      "unknown_supabase",
      "Host que imita Supabase rechazado fail-closed.",
      host,
      projectRef,
      databaseName,
      port,
      raw
    );
  }

  return fail(
    "unknown_remote",
    "Host remoto no permitido para api:test (solo CI canónico o Docker local).",
    host,
    projectRef,
    databaseName,
    port,
    raw
  );
}

/**
 * Lee únicamente la clave DATABASE_URL de un texto tipo .env.
 * Ignora JWT_SECRET, SENTRY_*, VITE_*, claves admin, etc.
 * @param {string} envFileText
 * @returns {string | null}
 */
export function extractDatabaseUrlFromEnvText(envFileText) {
  if (envFileText == null) return null;
  for (const line of String(envFileText).split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key !== "DATABASE_URL") continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }
  return null;
}

/**
 * @param {string | undefined | null} databaseUrl
 * @param {{ requireKind?: "ci" | "local" | "ci_or_local" }} [options]
 */
export function assertSafeDatabaseUrlForTests(databaseUrl, options = {}) {
  const requireKind = options.requireKind ?? "ci_or_local";
  const result = classifyDatabaseUrl(databaseUrl);

  if (!result.ok) {
    const err = new Error(
      `[DB-02] ${result.reason} Resumen seguro: ${result.safeSummary}`
    );
    err.name = "UnsafeDatabaseUrlError";
    err.classification = result;
    throw err;
  }

  if (requireKind === "ci" && result.kind !== "ci") {
    const err = new Error(
      `[DB-02] Se exige proyecto CI canónico; recibido kind=${result.kind}. Resumen: ${result.safeSummary}`
    );
    err.name = "UnsafeDatabaseUrlError";
    err.classification = result;
    throw err;
  }

  if (requireKind === "local" && result.kind !== "local") {
    const err = new Error(
      `[DB-02] Se exige Postgres Docker local; recibido kind=${result.kind}. Resumen: ${result.safeSummary}`
    );
    err.name = "UnsafeDatabaseUrlError";
    err.classification = result;
    throw err;
  }

  if (
    requireKind === "ci_or_local" &&
    result.kind !== "ci" &&
    result.kind !== "local"
  ) {
    const err = new Error(
      `[DB-02] kind no permitido: ${result.kind}. Resumen: ${result.safeSummary}`
    );
    err.name = "UnsafeDatabaseUrlError";
    err.classification = result;
    throw err;
  }

  return result;
}

/** @param {string} username */
export function extractSupabaseProjectRef(username) {
  if (!username) return null;
  const parts = username.split(".");
  if (parts.length >= 2 && parts[0] === "postgres") {
    return parts.slice(1).join(".") || null;
  }
  return null;
}

/** @param {string} hostname */
export function normalizeHost(hostname) {
  if (!hostname) return "";
  // URL parser: [::1] → hostname "::1"
  return hostname.toLowerCase().replace(/^\[|\]$/g, "");
}

/** @param {string} host */
export function isLocalHost(host) {
  const h = normalizeHost(host);
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
}

/** Host pooler oficial exacto: *.pooler.supabase.com (un solo registro DNS supabase). */
export function isOfficialSupabasePoolerHost(host) {
  const h = normalizeHost(host);
  return h === "pooler.supabase.com" || h.endsWith(".pooler.supabase.com");
}

/** @param {string} host */
export function looksLikeSupabaseImpersonation(host) {
  const h = normalizeHost(host);
  if (isOfficialSupabasePoolerHost(h)) return false;
  // supabase.com.evil.example, evil-supabase.com, foo.supabase.com.attacker
  return h.includes("supabase.com") || h.includes("supabase.co");
}

/** @param {string} pathname */
export function extractDatabaseName(pathname) {
  if (!pathname) return null;
  const cleaned = pathname.replace(/^\//, "").split("/")[0] || "";
  // quitar query accidental si viniera en path
  const name = cleaned.split("?")[0];
  return name || null;
}

/** @param {string} portFromUrl */
export function effectivePort(portFromUrl) {
  return portFromUrl && portFromUrl.length > 0 ? portFromUrl : ALLOWED_LOCAL_PORT;
}

/**
 * @param {string} databaseUrl
 */
export function redactDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return "(missing)";
  try {
    const url = new URL(databaseUrl.trim());
    const ref = extractSupabaseProjectRef(url.username || "");
    const user = ref ? `postgres.${ref}` : url.username ? "postgres.***" : "(user)";
    const db = extractDatabaseName(url.pathname) || "postgres";
    const host = normalizeHost(url.hostname);
    const port = url.port ? `:${url.port}` : "";
    return `${url.protocol}//${user}:***@${host}${port}/${db}`;
  } catch {
    return "(unredactable)";
  }
}

/**
 * @param {DbEnvKind} kind
 * @param {string} reason
 * @param {string | null} host
 * @param {string | null} projectRef
 * @param {string | null} databaseName
 * @param {string | null} port
 * @param {string} [raw]
 */
function fail(kind, reason, host, projectRef, databaseName, port, raw) {
  return {
    ok: false,
    kind,
    reason,
    host,
    projectRef,
    databaseName,
    port,
    safeSummary: raw ? redactDatabaseUrl(raw) : "(missing)",
  };
}
