import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Lock, Star } from "lucide-react";
import type { PathNodeData } from "../../data/gmusic-path-types";
import {
  PATH_CAROUSEL_GOLD,
  PATH_CAROUSEL_SURFACE_CARD,
  PATH_CAROUSEL_WHITE_WARM,
  pathCarouselArrowButtonStyle,
  pathCarouselCtaButtonStyle,
} from "./path-carousel-styles";

export interface PathCarouselFocusedCta {
  kind: "locked" | "action" | "teaser";
  label: string;
  onClick: () => void;
  completedStyle?: boolean;
}

export interface PathCarouselCardModel {
  title: string;
  gradient: string;
  categoryLabel: string;
  stepNumber?: number | null;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
  isTeaser?: boolean;
  isSubscriptionLock?: boolean;
  showStars?: boolean;
  starsFilled?: number;
  teaserDescription?: string | null;
  durationText?: string | null;
  lockedHint?: string | null;
  focusedCta?: PathCarouselFocusedCta | null;
  onCardClick: () => void;
}

export interface PathCarouselCardsProps {
  nodes: PathNodeData[];
  buildCardModels: (
    focusedIdx: number,
    goTo: (idx: number) => void
  ) => PathCarouselCardModel[];
  initialFocusIndex?: number;
  fullBleed?: boolean;
  reviewCompleted?: boolean;
  hintText?: string;
  buildFooterText?: (focusedIdx: number, nodes: PathNodeData[]) => string | null;
  useDotFooter?: boolean;
}

function StarRating({ filled, dimmed }: { filled: number; dimmed?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: 3 }, (_, i) => {
        const isFilled = i < filled;
        return (
          <Star
            key={i}
            size={14}
            fill={isFilled ? PATH_CAROUSEL_GOLD : "transparent"}
            stroke={
              isFilled
                ? PATH_CAROUSEL_GOLD
                : dimmed
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(255,255,255,0.28)"
            }
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}

export function PathCarouselCards({
  nodes,
  buildCardModels,
  initialFocusIndex = 0,
  fullBleed = false,
  reviewCompleted = false,
  hintText,
  buildFooterText,
  useDotFooter,
}: PathCarouselCardsProps) {
  const safeInitial = Math.max(0, Math.min(initialFocusIndex, Math.max(nodes.length - 1, 0)));
  const [focusedIdx, setFocusedIdx] = useState(safeInitial);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const showDots = useDotFooter ?? nodes.length <= 12;

  useEffect(() => {
    setFocusedIdx(Math.max(0, Math.min(initialFocusIndex, Math.max(nodes.length - 1, 0))));
  }, [initialFocusIndex, nodes.length]);

  useEffect(() => {
    const card = cardRefs.current[focusedIdx];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [focusedIdx]);

  const goTo = (idx: number) => setFocusedIdx(Math.max(0, Math.min(nodes.length - 1, idx)));

  const carouselPadding = fullBleed ? "12px max(5vw, 40px) 16px" : "12px 56px 16px";
  const cardModels = buildCardModels(focusedIdx, goTo);
  const footerText = buildFooterText?.(focusedIdx, nodes) ?? null;

  const carouselItems = nodes.map((node, i) => {
    const model = cardModels[i];
    if (!model) return null;

    const isFocused = i === focusedIdx;
    const {
      title,
      gradient,
      categoryLabel,
      stepNumber,
      isCompleted,
      isActive,
      isLocked,
      isTeaser,
      isSubscriptionLock,
      showStars = true,
      starsFilled = 0,
      teaserDescription,
      durationText,
      lockedHint,
      focusedCta,
      onCardClick,
    } = model;

    return (
      <motion.div
        key={node.id}
        ref={(el) => {
          cardRefs.current[i] = el;
        }}
        animate={{
          scale: isFocused ? 1 : reviewCompleted && isCompleted ? 0.94 : 0.88,
          opacity: isFocused
            ? 1
            : isTeaser
              ? 0.72
              : isLocked
                ? 0.45
                : reviewCompleted && isCompleted
                  ? 0.82
                  : 0.55,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={onCardClick}
        style={{
          flexShrink: 0,
          width: 240,
          borderRadius: 14,
          background: PATH_CAROUSEL_SURFACE_CARD,
          border: isFocused
            ? isTeaser
              ? `2px solid ${PATH_CAROUSEL_GOLD}`
              : isActive
                ? `2px solid ${PATH_CAROUSEL_GOLD}`
                : isCompleted
                  ? "2px solid rgba(201,168,76,0.45)"
                  : "2px solid rgba(255,255,255,0.12)"
            : "2px solid rgba(255,255,255,0.06)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          scrollSnapAlign: "center",
          overflow: "hidden",
          boxShadow:
            isFocused && (isTeaser || isActive || (reviewCompleted && isCompleted))
              ? "0 0 28px rgba(201,168,76,0.28), 0 16px 40px rgba(0,0,0,0.45)"
              : isFocused
                ? "0 16px 40px rgba(0,0,0,0.4)"
                : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div
          style={{
            height: 120,
            background: gradient,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          {isTeaser && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 42,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.92)",
                  lineHeight: 1,
                  textShadow: "0 2px 12px rgba(0,0,0,0.45)",
                }}
              >
                60+
              </span>
            </div>
          )}
          {isSubscriptionLock && !isTeaser && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lock size={20} color="rgba(255,255,255,0.45)" strokeWidth={1.75} />
              </div>
            </div>
          )}
          <span
            style={{
              position: "absolute",
              bottom: 10,
              left: 12,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
              color: "rgba(255,255,255,0.85)",
              background: "rgba(0,0,0,0.35)",
              padding: "3px 8px",
              borderRadius: 4,
            }}
          >
            {categoryLabel}
          </span>
          {isCompleted && (
            <span
              style={{
                position: "absolute",
                top: 10,
                left: 12,
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
                color: "#0A0A0A",
                background: PATH_CAROUSEL_GOLD,
                padding: "3px 7px",
                borderRadius: 4,
              }}
            >
              Completada
            </span>
          )}
          {stepNumber != null && (
            <span
              style={{
                position: "absolute",
                top: 10,
                right: 12,
                fontFamily: "'Playfair Display', serif",
                fontSize: 36,
                fontWeight: 600,
                color: "rgba(255,255,255,0.12)",
                lineHeight: 1,
              }}
            >
              {stepNumber}
            </span>
          )}
        </div>

        <div style={{ padding: "14px 14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3
            style={{
              margin: "0 0 8px",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 17,
              fontWeight: 500,
              lineHeight: 1.25,
              color: isLocked && !isTeaser ? "rgba(255,255,255,0.45)" : PATH_CAROUSEL_WHITE_WARM,
            }}
          >
            {title}
          </h3>

          {showStars && !isTeaser && <StarRating filled={starsFilled} dimmed={isLocked} />}

          {isTeaser && teaserDescription && (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.45,
              }}
            >
              {teaserDescription}
            </p>
          )}

          {durationText && !isLocked && (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {durationText}
            </p>
          )}

          {isLocked && lockedHint && (
            <p
              style={{
                margin: "8px 0 0",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "rgba(255,255,255,0.28)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Lock size={11} />
              {lockedHint}
            </p>
          )}

          {isFocused && focusedCta && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              style={{ marginTop: 14 }}
            >
              {focusedCta.kind === "locked" ? (
                <button
                  type="button"
                  disabled
                  style={pathCarouselCtaButtonStyle(true)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Lock size={14} style={{ marginRight: 6 }} />
                  {focusedCta.label}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusedCta.onClick();
                  }}
                  style={pathCarouselCtaButtonStyle(false, focusedCta.completedStyle)}
                >
                  {focusedCta.label}
                </button>
              )}
            </motion.div>
          )}
        </div>
        {isCompleted && (
          <div
            style={{
              height: 3,
              background: `linear-gradient(90deg, ${PATH_CAROUSEL_GOLD} 0%, rgba(201,168,76,0.35) 100%)`,
            }}
          />
        )}
      </motion.div>
    );
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        flex: 1,
      }}
    >
      {focusedIdx > 0 && (
        <button
          type="button"
          onClick={() => goTo(focusedIdx - 1)}
          aria-label="Clase anterior"
          style={pathCarouselArrowButtonStyle("left")}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <div
        className="gmusic-carousel"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          padding: carouselPadding,
          alignItems: "stretch",
        }}
      >
        <style>{`.gmusic-carousel::-webkit-scrollbar { display: none; }`}</style>
        {carouselItems}
      </div>

      {focusedIdx < nodes.length - 1 && (
        <button
          type="button"
          onClick={() => goTo(focusedIdx + 1)}
          aria-label="Clase siguiente"
          style={pathCarouselArrowButtonStyle("right")}
        >
          <ChevronRight size={22} />
        </button>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
          marginTop: hintText ? 8 : 4,
          flexWrap: "wrap",
        }}
      >
        {hintText && (
          <span
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.4)",
              fontFamily: "Inter, sans-serif",
              marginBottom: 2,
            }}
          >
            {hintText}
          </span>
        )}
        {showDots ? (
          nodes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir a clase ${i + 1}`}
              style={{
                width: i === focusedIdx ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === focusedIdx ? PATH_CAROUSEL_GOLD : "rgba(255,255,255,0.15)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
                padding: 0,
              }}
            />
          ))
        ) : (
          footerText && (
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.35)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {footerText}
            </span>
          )
        )}
      </div>
    </div>
  );
}
