import { scrollToHomeSection } from "./public-home-navigation";

const STUDENT_ZONE_PAGES = new Set(["mi-estudio", "welcome", "mi-camino"]);

/** D-GOV-02 — mapa canónico funnel demo (sin inscripcion-registro). */
const DEMO_FUNNEL_PAGE_TO_PATH: Record<string, string> = {
  "mi-camino-demo": "/mi-camino-demo",
  "demo-clase-1": "/demo-clase-1",
  "demo-clase-2": "/demo-clase-2",
  "demo-clase-3": "/demo-clase-3",
  "demo-clase-4": "/demo-clase-4",
  "demo-clase-5": "/demo-clase-5",
  "inscripcion-gate": "/inscripcion",
};

const DEMO_FUNNEL_PATH_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(DEMO_FUNNEL_PAGE_TO_PATH).map(([page, path]) => [path, page])
);

const DEMO_FUNNEL_PAGES = new Set([
  ...Object.keys(DEMO_FUNNEL_PAGE_TO_PATH),
  "inscripcion-registro",
]);

const PAGE_TITLES: Record<string, string> = {
  home: "Gmusic Estudio",
  "mi-estudio": "Gmusic Estudio · Panel del alumno",
  welcome: "Gmusic Estudio · Panel del alumno",
  "mi-camino": "Gmusic Estudio · Mi Camino",
  "mi-camino-demo": "Gmusic Estudio · Camino demo",
  "inscripcion-gate": "Gmusic Estudio · Inscripción",
};

export function isStudentZonePage(page: string): boolean {
  return STUDENT_ZONE_PAGES.has(page);
}

export function isStudentZonePath(pathname: string): boolean {
  return pathname === "/alumno" || pathname === "/mi-camino";
}

export function isDemoFunnelPage(page: string): boolean {
  return DEMO_FUNNEL_PAGES.has(page);
}

export function isDemoFunnelPath(pathname: string): boolean {
  return pathname in DEMO_FUNNEL_PATH_TO_PAGE;
}

export function pathnameForPage(page: string): string | null {
  if (page === "mi-estudio" || page === "welcome") return "/alumno";
  if (page === "mi-camino") return "/mi-camino";
  const demoPath = DEMO_FUNNEL_PAGE_TO_PATH[page];
  if (demoPath) return demoPath;
  return null;
}

export function pageFromPathname(pathname: string): string {
  if (pathname === "/alumno") return "mi-estudio";
  if (pathname === "/mi-camino") return "mi-camino";
  if (pathname === "/") return "home";
  const demoPage = DEMO_FUNNEL_PATH_TO_PAGE[pathname];
  if (demoPage) return demoPage;
  return "home";
}

export function getInitialPageFromPath(): string {
  return pageFromPathname(window.location.pathname);
}

function setDocumentTitle(page: string) {
  document.title = PAGE_TITLES[page] ?? PAGE_TITLES.home;
}

function isOnSyncedUrl(currentPage: string, pathname: string): boolean {
  return (
    isStudentZonePage(currentPage) ||
    isStudentZonePath(pathname) ||
    isDemoFunnelPage(currentPage) ||
    isDemoFunnelPath(pathname)
  );
}

export function initStudentZoneRouting(setPage: (page: string) => void) {
  const handlePopState = () => {
    const page = pageFromPathname(window.location.pathname);
    setPage(page);
    setDocumentTitle(page);
  };

  handlePopState();

  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}

export function navigateStudentZoneAware(
  page: string,
  setPage: (page: string) => void,
  currentPage: string
) {
  const targetPath = pathnameForPage(page);

  if (targetPath) {
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page }, "", targetPath);
    }
    setPage(page);
    setDocumentTitle(page);
    return;
  }

  if (page === "inscripcion-registro" && isDemoFunnelPath(window.location.pathname)) {
    setPage(page);
    setDocumentTitle(page);
    return;
  }

  if (isOnSyncedUrl(currentPage, window.location.pathname) && window.location.pathname !== "/") {
    window.history.replaceState({ page }, "", "/");
  }

  setPage(page);
  setDocumentTitle(page);
}

export function navigateDeniedToHomePlans(
  setPage: (page: string) => void,
  currentPage: string,
  scrollPlans: (sectionId: string) => void = scrollToHomeSection,
  delayMs = 100
): void {
  navigateStudentZoneAware("home", setPage, currentPage);
  window.setTimeout(() => scrollPlans("planes"), delayMs);
}
