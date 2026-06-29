import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Lock, Star } from "lucide-react";
import type { PathNodeData } from "../../data/gmusic-path-types";
import {
  PATH_CAROUSEL_GOLD,
  PATH_CAROUSEL_SURFACE_CARD,
  PATH_CAROUSEL_WHITE_WARM,
  pathCarouselArrowButtonStyle,
  pathCarouselCtaButtonStyle,
  pathCarouselStageCardBorder,
  pathCarouselStageCardShadow,
  pathCarouselStageCtaButtonStyle,
  pathCarouselStageSideOpacity,
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
  /** D-022B2 — preset stage suscriptor; demo mantiene default */
  visualVariant?: "default" | "stage";
}

function stageCtaShortLabel(label: string): string {
  if (label === "Iniciar lección") return "Iniciar";
  if (label === "Continuar") return "Continuar";
  return label.split(" ")[0] ?? label;
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
  visualVariant = "default",
}: PathCarouselCardsProps) {
  const isStage = visualVariant === "stage";
  const safeInitial = Math.max(0, Math.min(initialFocusIndex, Math.max(nodes.length - 1, 0)));
  const [focusedIdx, setFocusedIdx] = useState(safeInitial);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [stageDesktopFit, setStageDesktopFit] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const showDots = useDotFooter ?? nodes.length <= 12;
  const motionDuration = reduceMotion ? 0.01 : 0.3;
  const stageFitEligible = isStage && nodes.length > 0 && nodes.length <= 8;

  useEffect(() => {
    setFocusedIdx(Math.max(0, Math.min(initialFocusIndex, Math.max(nodes.length - 1, 0))));
  }, [initialFocusIndex, nodes.length]);

  useEffect(() => {
    if (!stageFitEligible) {
      setStageDesktopFit(false);
      return;
    }
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setStageDesktopFit(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [stageFitEligible]);

  useLayoutEffect(() => {
    if (!isStage || stageDesktopFit) return;
    const track = trackRef.current;
    const card = cardRefs.current[focusedIdx];
    if (!track || !card) return;

    const targetLeft = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const nextLeft = Math.max(0, Math.min(targetLeft, maxScroll));

    track.scrollTo({
      left: nextLeft,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [focusedIdx, reduceMotion, nodes.length, isStage, stageDesktopFit]);

  useEffect(() => {
    if (isStage) return;
    const card = cardRefs.current[focusedIdx];
    if (card) {
      card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
    }
  }, [focusedIdx, reduceMotion, isStage]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const goTo = (idx: number) => setFocusedIdx(Math.max(0, Math.min(nodes.length - 1, idx)));

  const carouselPadding = fullBleed
    ? "12px max(5vw, 40px) 16px"
    : isStage
      ? "8px 0 12px"
      : "12px 56px 16px";
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

    const sideOpacity = isStage
      ? pathCarouselStageSideOpacity(isLocked, !!isTeaser, isCompleted, reviewCompleted)
      : isTeaser
        ? 0.72
        : isLocked
          ? 0.45
          : reviewCompleted && isCompleted
            ? 0.82
            : 0.55;

    const cardClassName = [
      isStage ? "path-carousel__card" : "",
      isStage && isFocused ? "path-carousel__card--focused" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <motion.div
        key={node.id}
        ref={(el) => {
          cardRefs.current[i] = el;
        }}
        className={cardClassName || undefined}
        animate={{
          scale: isFocused
            ? 1
            : isStage
              ? stageDesktopFit
                ? 0.94
                : isLocked
                  ? 0.86
                  : 0.9
              : reviewCompleted && isCompleted
                ? 0.94
                : 0.88,
          opacity: isFocused ? 1 : sideOpacity,
        }}
        transition={{ duration: isStage ? motionDuration : 0.3, ease: "easeOut" }}
        onClick={onCardClick}
        style={{
          flexShrink: 0,
          width: isStage ? undefined : 240,
          borderRadius: isStage ? undefined : 14,
          background: PATH_CAROUSEL_SURFACE_CARD,
          border: isStage
            ? pathCarouselStageCardBorder(isFocused, isActive, isCompleted, !!isTeaser)
            : isFocused
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
          boxShadow: isStage
            ? pathCarouselStageCardShadow(isFocused, isActive, isCompleted, !!isTeaser)
            : isFocused && (isTeaser || isActive || (reviewCompleted && isCompleted))
              ? "0 0 28px rgba(201,168,76,0.28), 0 16px 40px rgba(0,0,0,0.45)"
              : isFocused
                ? "0 16px 40px rgba(0,0,0,0.4)"
                : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div
          className={isStage ? "path-carousel__card-hero" : undefined}
          style={{
            height: isStage ? undefined : 120,
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
                background: isStage ? "rgba(0,0,0,0.26)" : "rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  width: isStage ? 40 : 44,
                  height: isStage ? 40 : 44,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lock size={isStage ? 18 : 20} color="rgba(255,255,255,0.55)" strokeWidth={1.75} />
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
              className={isStage ? "path-carousel__card-step" : undefined}
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
              fontSize: isStage && isFocused ? 18 : 17,
              fontWeight: 500,
              lineHeight: 1.25,
              color:
                isLocked && !isTeaser
                  ? isStage
                    ? "rgba(255,255,255,0.62)"
                    : "rgba(255,255,255,0.45)"
                  : PATH_CAROUSEL_WHITE_WARM,
            }}
          >
            {title}
          </h3>

          {showStars && !isTeaser && (
            <StarRating filled={starsFilled} dimmed={isLocked && !isStage} />
          )}

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
                color: isStage ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.28)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Lock size={11} />
              {lockedHint}
            </p>
          )}

          {isFocused && focusedCta && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.08 }}
              style={{ marginTop: 14 }}
            >
              {focusedCta.kind === "locked" ? (
                <button
                  type="button"
                  disabled
                  className={isStage ? "path-carousel__cta" : undefined}
                  style={
                    isStage
                      ? pathCarouselStageCtaButtonStyle(true)
                      : pathCarouselCtaButtonStyle(true)
                  }
                  onClick={(e) => e.stopPropagation()}
                >
                  <Lock size={14} style={{ marginRight: 6 }} />
                  {focusedCta.label}
                </button>
              ) : (
                <button
                  type="button"
                  className={isStage ? "path-carousel__cta" : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    focusedCta.onClick();
                  }}
                  style={
                    isStage
                      ? pathCarouselStageCtaButtonStyle(false, focusedCta.completedStyle)
                      : pathCarouselCtaButtonStyle(false, focusedCta.completedStyle)
                  }
                >
                  {isStage ? (
                    <>
                      <span className="path-carousel__cta-label-full">{focusedCta.label}</span>
                      <span className="path-carousel__cta-label-short">
                        {stageCtaShortLabel(focusedCta.label)}
                      </span>
                    </>
                  ) : (
                    focusedCta.label
                  )}
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

  const rootClassName = [
    "path-carousel",
    isStage ? "path-carousel--stage" : "",
    isStage && stageDesktopFit ? "path-carousel--stage-fit" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClassName}
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        flex: 1,
      }}
    >
      {isStage && <div className="path-carousel__connector" aria-hidden="true" />}

      {focusedIdx > 0 && !(isStage && stageDesktopFit) && (
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
        ref={isStage ? trackRef : undefined}
        className={`gmusic-carousel${isStage ? " path-carousel__track" : ""}`}
        style={{
          display: "flex",
          gap: isStage ? 14 : 12,
          overflowX: "auto",
          scrollSnapType: isStage ? "x proximity" : "x mandatory",
          scrollbarWidth: "none",
          padding: carouselPadding,
          alignItems: "stretch",
          minWidth: 0,
        }}
      >
        <style>{`.gmusic-carousel::-webkit-scrollbar { display: none; }`}</style>
        {isStage && !stageDesktopFit && <div className="path-carousel__edge-spacer" aria-hidden="true" />}
        {carouselItems}
        {isStage && !stageDesktopFit && <div className="path-carousel__edge-spacer" aria-hidden="true" />}
      </div>

      {focusedIdx < nodes.length - 1 && !(isStage && stageDesktopFit) && (
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
              color: isStage ? "rgba(201,168,76,0.55)" : "rgba(201,168,76,0.4)",
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
                transition: reduceMotion ? "none" : "all 0.3s",
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
                color: isStage ? "rgba(201,168,76,0.55)" : "rgba(255,255,255,0.35)",
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
