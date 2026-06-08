const DEFAULT_API_PORT = 3001;
const DEFAULT_DEV_STUDENT_EMAIL = "carlos@gmusic.academy";
const DEFAULT_COURSE_SLUG = "ruta-guitarra-12-meses";

export const config = {
  apiPort: Number(process.env.API_PORT ?? DEFAULT_API_PORT),
  /** Solo desarrollo: resuelve al alumno sin JWT. No usar en producción. */
  devStudentEmail: process.env.GMUSIC_DEV_USER_EMAIL ?? DEFAULT_DEV_STUDENT_EMAIL,
  defaultCourseSlug: DEFAULT_COURSE_SLUG,
} as const;
