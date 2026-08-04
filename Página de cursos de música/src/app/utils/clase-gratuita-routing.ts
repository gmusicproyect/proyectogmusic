/** D-GOV-19 — páginas internas del funnel demo con URLs /clase-gratuita. */
export const CLASE_GRATUITA_MAP_PAGE = "clase-gratuita";

export const CLASE_GRATUITA_LESSON_PAGE_PATTERN = /^clase-gratuita-([1-5])$/;

export function claseGratuitaLessonPage(lessonNumber: number): string {
  return `clase-gratuita-${lessonNumber}`;
}

export function parseClaseGratuitaLessonPage(page: string): number | null {
  const match = CLASE_GRATUITA_LESSON_PAGE_PATTERN.exec(page);
  if (!match?.[1]) return null;
  return parseInt(match[1], 10);
}

export function pathnameForClaseGratuitaLesson(lessonNumber: number): string {
  return `/clase-gratuita/${lessonNumber}`;
}

export function pageFromClaseGratuitaPathname(pathname: string): string | null {
  if (pathname === "/clase-gratuita") return CLASE_GRATUITA_MAP_PAGE;
  const match = /^\/clase-gratuita\/([1-5])$/.exec(pathname);
  if (!match?.[1]) return null;
  return claseGratuitaLessonPage(parseInt(match[1], 10));
}
