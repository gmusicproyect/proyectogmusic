import type { CSSProperties } from "react";

export const PATH_CAROUSEL_WHITE_WARM = "#F5F0E8";
export const PATH_CAROUSEL_GOLD = "#C9A84C";
export const PATH_CAROUSEL_SURFACE_CARD = "#161616";

export const PATH_CARD_GRADIENTS: Record<number, string> = {
  1: "linear-gradient(145deg, #3d2a08 0%, #7a5810 45%, #C9A84C 100%)",
  2: "linear-gradient(145deg, #0a1628 0%, #1a3a6a 55%, #2a5a9a 100%)",
  3: "linear-gradient(145deg, #0a2018 0%, #1a4a32 55%, #2a7a52 100%)",
  4: "linear-gradient(145deg, #1a0a32 0%, #3a1a6a 55%, #5a2a9a 100%)",
  5: "linear-gradient(145deg, #4a3010 0%, #9a7010 50%, #e6c060 100%)",
};

export const PATH_CAROUSEL_LOCKED_GRADIENT =
  "linear-gradient(145deg, #1c1c1c 0%, #141414 45%, #0c0c0c 100%)";

export const PATH_CAROUSEL_ACADEMY_TEASER_GRADIENT =
  "linear-gradient(145deg, #2a1f08 0%, #5a4010 40%, #C9A84C 100%)";

export function pathCarouselGradientForIndex(index: number, locked: boolean): string {
  if (locked) return PATH_CAROUSEL_LOCKED_GRADIENT;
  const slot = (index % 5) + 1;
  return PATH_CARD_GRADIENTS[slot] ?? PATH_CAROUSEL_LOCKED_GRADIENT;
}

export function pathCarouselCtaButtonStyle(locked: boolean, completed?: boolean): CSSProperties {
  if (locked) {
    return {
      width: "100%",
      height: 40,
      borderRadius: 8,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.28)",
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "Inter, sans-serif",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      cursor: "not-allowed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  }

  return {
    width: "100%",
    height: 40,
    borderRadius: 8,
    background: completed ? "transparent" : PATH_CAROUSEL_GOLD,
    border: completed ? `1px solid ${PATH_CAROUSEL_GOLD}` : "none",
    color: completed ? PATH_CAROUSEL_GOLD : "#0A0A0A",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "Inter, sans-serif",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: completed ? "none" : "0 4px 0 rgba(140,100,20,0.6)",
    transition: "transform 80ms ease",
  };
}

export function pathCarouselArrowButtonStyle(side: "left" | "right"): CSSProperties {
  return {
    position: "absolute",
    [side]: 8,
    top: "42%",
    transform: "translateY(-50%)",
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgba(18,18,18,0.92)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.55)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  };
}

/** D-022B2 — preset stage suscriptor (Canva structure, sin lógica demo). */
export function pathCarouselStageSideOpacity(
  isLocked: boolean,
  isTeaser: boolean,
  isCompleted: boolean,
  reviewCompleted: boolean
): number {
  if (isTeaser) return 0.72;
  if (isLocked) return 0.6;
  if (reviewCompleted && isCompleted) return 0.78;
  return 0.65;
}

export function pathCarouselStageCardBorder(
  isFocused: boolean,
  isActive: boolean,
  isCompleted: boolean,
  isTeaser: boolean
): string {
  if (!isFocused) {
    return isCompleted
      ? "1px solid rgba(201,168,76,0.24)"
      : "1px solid rgba(255,255,255,0.09)";
  }
  if (isTeaser || isActive) {
    return "1px solid rgba(201, 168, 76, 0.72)";
  }
  if (isCompleted) {
    return "1px solid rgba(201,168,76,0.48)";
  }
  return "1px solid rgba(255,255,255,0.14)";
}

export function pathCarouselStageCardShadow(
  isFocused: boolean,
  isActive: boolean,
  isCompleted: boolean,
  isTeaser: boolean
): string {
  if (!isFocused) return "none";
  if (isTeaser || isActive) {
    return "0 0 28px rgba(201,168,76,0.2), 0 18px 44px rgba(0,0,0,0.46)";
  }
  if (isCompleted) {
    return "0 0 18px rgba(201,168,76,0.1), 0 16px 40px rgba(0,0,0,0.4)";
  }
  return "0 16px 40px rgba(0,0,0,0.4)";
}

export function pathCarouselStageCtaButtonStyle(
  locked: boolean,
  completed?: boolean
): CSSProperties {
  if (locked) {
    return {
      width: "100%",
      minHeight: 44,
      borderRadius: 10,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "rgba(255,255,255,0.55)",
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "Inter, sans-serif",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      cursor: "not-allowed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    };
  }

  return {
    width: "100%",
    minHeight: 44,
    borderRadius: 10,
    background: completed ? "transparent" : PATH_CAROUSEL_GOLD,
    border: completed ? `1.5px solid ${PATH_CAROUSEL_GOLD}` : "1px solid rgba(255,255,255,0.08)",
    color: completed ? PATH_CAROUSEL_GOLD : "#0A0A0A",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "Inter, sans-serif",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: completed
      ? "none"
      : "0 4px 0 rgba(100, 72, 16, 0.55), 0 6px 20px rgba(201, 168, 76, 0.22)",
    transition: "transform 80ms ease, box-shadow 0.2s ease",
  };
}
