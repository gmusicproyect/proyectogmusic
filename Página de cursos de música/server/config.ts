import { getCorsAllowedOriginsFromEnv } from "./lib/cors.js";

const DEFAULT_API_PORT = 3001;
const DEFAULT_DEV_STUDENT_EMAIL = "carlos@gmusic.academy";
const DEFAULT_DEV_ADMIN_EMAIL = "admin@gmusic.academy";
const DEFAULT_COURSE_SLUG = "ruta-guitarra-12-meses";
const DEV_JWT_SECRET = "gmusic-dev-jwt-secret-change-in-production";

function resolveJwtSecret(): string | undefined {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return DEV_JWT_SECRET;
  }
  return undefined;
}

export const config = {
  /** Render inyecta PORT; local usa API_PORT. */
  apiPort: Number(process.env.PORT ?? process.env.API_PORT ?? DEFAULT_API_PORT),
  /** Orígenes del frontend (Vercel, local). Vacío = sin CORS cross-origin. */
  corsAllowedOrigins: getCorsAllowedOriginsFromEnv(),
  /** Solo desarrollo: resuelve al alumno sin JWT. No usar en producción. */
  get devStudentEmail(): string {
    return process.env.GMUSIC_DEV_USER_EMAIL ?? DEFAULT_DEV_STUDENT_EMAIL;
  },
  get devAdminEmail(): string {
    return process.env.GMUSIC_DEV_ADMIN_EMAIL ?? DEFAULT_DEV_ADMIN_EMAIL;
  },
  defaultCourseSlug: DEFAULT_COURSE_SLUG,
  get jwtSecret(): string | undefined {
    return resolveJwtSecret();
  },
  /**
   * PD-3: cuando true, H1 lee/escribe PracticeEvent + proyecciones en DB.
   * Activar solo local/Docker: GMUSIC_H1_DURABLE=1. Prod OFF (R-OPS-01).
   */
  get h1Durable(): boolean {
    const raw = (process.env.GMUSIC_H1_DURABLE ?? "").trim().toLowerCase();
    return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
  },
};

export function assertJwtSecretConfigured(): void {
  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET no configurada.");
  }
}
