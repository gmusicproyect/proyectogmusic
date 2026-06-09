export const HOME_SECTION_SCROLL_OFFSET = 80;

export function scrollToHomeSection(sectionId: string): void {
  const el = document.getElementById(sectionId);
  if (!el) return;
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
