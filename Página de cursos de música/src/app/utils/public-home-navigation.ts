export const HOME_SECTION_SCROLL_OFFSET = 80;
export const ACTIVE_HOME_SECTION_EVENT = "gmusic:active-home-section";

export function notifyActiveHomeSection(sectionId: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ACTIVE_HOME_SECTION_EVENT, { detail: { sectionId } })
  );
}

export function scrollToHomeSection(sectionId: string): void {
  const el = document.getElementById(sectionId);
  if (!el) return;
  notifyActiveHomeSection(sectionId);
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.pageYOffset - HOME_SECTION_SCROLL_OFFSET,
    behavior: "smooth",
  });
}

export function navigateToHomeSection(
  setPage: (page: string) => void,
  sectionId: string,
  delayMs = 100
): void {
  setPage("home");
  window.setTimeout(() => scrollToHomeSection(sectionId), delayMs);
}
