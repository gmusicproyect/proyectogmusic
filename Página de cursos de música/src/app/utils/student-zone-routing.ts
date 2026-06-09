import { scrollToHomeSection } from "./public-home-navigation";

const STUDENT_ZONE_PAGES = new Set(["mi-estudio", "welcome", "mi-camino"]);

const PAGE_TITLES: Record<string, string> = {
  home: "Gmusic Estudio",
  "mi-estudio": "Gmusic Estudio · Panel del alumno",
  welcome: "Gmusic Estudio · Panel del alumno",
  "mi-camino": "Gmusic Estudio · Mi Camino",
};

export function isStudentZonePage(page: string): boolean {
  return STUDENT_ZONE_PAGES.has(page);
}

export function isStudentZonePath(pathname: string): boolean {
  return pathname === "/alumno" || pathname === "/mi-camino";
}

export function pathnameForPage(page: string): string | null {
  if (page === "mi-estudio" || page === "welcome") return "/alumno";
  if (page === "mi-camino") return "/mi-camino";
  return null;
}

export function pageFromPathname(pathname: string): string {
  if (pathname === "/alumno") return "mi-estudio";
  if (pathname === "/mi-camino") return "mi-camino";
  if (pathname === "/") return "home";
  return "home";
}

export function getInitialPageFromPath(): string {
  return pageFromPathname(window.location.pathname);
}

function setDocumentTitle(page: string) {
  document.title = PAGE_TITLES[page] ?? PAGE_TITLES.home;
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

  const leavingZone =
    isStudentZonePage(currentPage) || isStudentZonePath(window.location.pathname);

  if (leavingZone && window.location.pathname !== "/") {
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
