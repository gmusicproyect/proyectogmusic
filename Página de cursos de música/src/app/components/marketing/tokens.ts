export const GOLD = "#C9A84C";
export const GOLD_SOFT = "#E8C97A";
export const GOLD_BORDER = "rgba(201,168,76,0.18)";
export const WHITE_WARM = "#F5F0E8";
export const TEXT_SEC = "#8A8A8A";
export const BG_SURFACE = "#111111";
export const BORDER = "rgba(255,255,255,0.06)";

const isMobileDevice = typeof window !== "undefined"
  && window.innerWidth < 768;

export const fadeUp = isMobileDevice
  ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
  : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export const vp = { once: true, margin: "-20px" };
