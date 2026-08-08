import { useEffect, useRef, useCallback } from "react";
import {
  FRETBOARD_STRING_NUMBER_TO_ID,
  type FretboardStringId,
} from "./lesson-fretboard";
import {
  HIGHWAY_FEATURE_ENABLED,
  LAB_STRING_COUNT,
  clampStringNumber,
  computeStringYPositions,
  getStringY,
  type LabNote,
} from "./lab-note";

const CANVAS_MIN_HEIGHT = 220;
const STRING_THICKNESS = [2, 2.5, 3, 4, 5, 6] as const; // index 0 = string 1 (thin)

export interface FretboardCanvasProps {
  notes: readonly LabNote[];
  /** Index into playable (non-rest) notes for highlight; ignored if notes empty. */
  currentNoteIndex?: number;
  interactive: boolean;
  disabled?: boolean;
  selectedStringId?: string | null;
  /**
   * Highway stub. Ignored while HIGHWAY_FEATURE_ENABLED is false
   * (no hit line, no tempo scroll).
   */
  highwayEnabled?: boolean;
  onSelectStringId?: (stringId: FretboardStringId) => void;
  className?: string;
  height?: number;
}

function hitTestString(
  clientY: number,
  canvas: HTMLCanvasElement,
  stringY: readonly number[]
): number | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.height <= 0) return null;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  let best: { stringNum: number; dist: number } | null = null;
  for (let s = 1; s <= LAB_STRING_COUNT; s += 1) {
    const sy = getStringY(s, stringY);
    const dist = Math.abs(y - sy);
    if (!best || dist < best.dist) best = { stringNum: s, dist };
  }
  if (!best || best.dist > canvas.height * 0.12) return null;
  return best.stringNum;
}

export function FretboardCanvas({
  notes,
  currentNoteIndex = 0,
  interactive,
  disabled = false,
  selectedStringId = null,
  highwayEnabled = false,
  onSelectStringId,
  className = "",
  height = CANVAS_MIN_HEIGHT,
}: FretboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stringYRef = useRef<number[]>([]);
  const isDisabled = disabled || !interactive;
  // Spec: recognition MVP — never draw hit line / tempo while stub OFF.
  const showHitLine = HIGHWAY_FEATURE_ENABLED && highwayEnabled;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const cssWidth = canvas.clientWidth || 320;
    const cssHeight = height;
    canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
    canvas.height = Math.max(1, Math.floor(cssHeight * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = cssWidth;
    const H = cssHeight;
    const stringY = computeStringYPositions(H);
    stringYRef.current = stringY;

    // Wood / fretboard atmosphere (product gold tone — not Lab purple copy)
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#2a2118");
    bg.addColorStop(0.5, "#3d2e22");
    bg.addColorStop(1, "#241c14");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Soft inlays
    ctx.fillStyle = "rgba(212, 175, 55, 0.12)";
    for (const ratio of [0.35, 0.65]) {
      ctx.beginPath();
      ctx.arc(W * ratio, H * 0.5, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    const playable = notes.filter((n) => !n.isRest);
    const target = playable[currentNoteIndex] ?? null;
    const targetString = target ? clampStringNumber(target.string) : null;

    for (let s = 1; s <= LAB_STRING_COUNT; s += 1) {
      const y = getStringY(s, stringY);
      const thickness = STRING_THICKNESS[s - 1] ?? 3;
      const stringId = FRETBOARD_STRING_NUMBER_TO_ID[s as 1 | 2 | 3 | 4 | 5 | 6];
      const isSelected = selectedStringId === stringId;
      const isTarget = targetString === s;

      ctx.strokeStyle = isTarget
        ? "rgba(212, 175, 55, 0.95)"
        : isSelected
          ? "rgba(250, 250, 250, 0.95)"
          : "rgba(212, 200, 170, 0.55)";
      ctx.lineWidth = thickness + (isTarget || isSelected ? 1.5 : 0);
      ctx.beginPath();
      ctx.moveTo(16, y);
      ctx.lineTo(W - 16, y);
      ctx.stroke();

      // Nut-side label (string number)
      ctx.fillStyle = isTarget ? "#D4AF37" : "rgba(250, 250, 250, 0.55)";
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(String(s), 4, y);
    }

    // Recognition markers: distribute target notes horizontally (no tempo X)
    if (playable.length > 0) {
      const left = 48;
      const right = W - 36;
      const span = Math.max(1, right - left);
      playable.forEach((note, index) => {
        const sn = clampStringNumber(note.string);
        if (sn == null) return;
        const y = getStringY(sn, stringY);
        const x =
          playable.length === 1
            ? left + span * 0.5
            : left + (span * index) / (playable.length - 1);
        const isCurrent = index === currentNoteIndex;
        const done = index < currentNoteIndex;
        ctx.beginPath();
        ctx.arc(x, y, isCurrent ? 11 : 8, 0, Math.PI * 2);
        ctx.fillStyle = done
          ? "rgba(74, 222, 128, 0.85)"
          : isCurrent
            ? "#D4AF37"
            : "rgba(250, 250, 250, 0.35)";
        ctx.fill();
        if (isCurrent) {
          ctx.strokeStyle = "rgba(212, 175, 55, 0.9)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }

    // Highway stub: hit line never drawn while feature flag OFF
    if (showHitLine) {
      const hitX = W * 0.18;
      ctx.strokeStyle = "rgba(34, 211, 238, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hitX, 8);
      ctx.lineTo(hitX, H - 8);
      ctx.stroke();
    }
  }, [notes, currentNoteIndex, selectedStringId, height, showHitLine]);

  useEffect(() => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  const emitString = useCallback(
    (stringNum: number) => {
      if (isDisabled || !onSelectStringId) return;
      const clamped = clampStringNumber(stringNum);
      if (clamped == null) return;
      const stringId = FRETBOARD_STRING_NUMBER_TO_ID[clamped as 1 | 2 | 3 | 4 | 5 | 6];
      onSelectStringId(stringId);
    },
    [isDisabled, onSelectStringId]
  );

  useEffect(() => {
    if (isDisabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.altKey || event.ctrlKey) return;
      const key = event.key;
      if (key < "1" || key > "6") return;
      const stringNum = Number(key);
      event.preventDefault();
      emitString(stringNum);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDisabled, emitString]);

  const onPointer = (clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isDisabled) return;
    const stringNum = hitTestString(clientY, canvas, stringYRef.current);
    if (stringNum != null) emitString(stringNum);
  };

  return (
    <div
      className={`fretboard-canvas-wrap w-full ${className}`.trim()}
      style={{ minHeight: height }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Diapasón interactivo: seis cuerdas, la 1 arriba y la 6 abajo"
        className="w-full block rounded-md"
        style={{
          height,
          cursor: isDisabled ? "default" : "pointer",
          touchAction: "manipulation",
          opacity: disabled ? 0.7 : 1,
        }}
        onClick={(event) => onPointer(event.clientY)}
      />
      {interactive && !disabled ? (
        <p className="mt-2 text-[11px] text-center" style={{ color: "rgba(250,250,250,0.45)" }}>
          Toca una cuerda o pulsa 1–6
        </p>
      ) : null}
    </div>
  );
}
