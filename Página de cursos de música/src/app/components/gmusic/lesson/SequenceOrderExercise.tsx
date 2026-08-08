import { useId } from "react";
import type { ParsedExerciseView, SafeExerciseOption } from "./lesson-runner-types";
import {
  GM_GOLD,
  GM_GOLD_MATT,
  GM_TEXT,
  GM_TEXT_SEC,
} from "../tokens";

export interface SequenceOrderExerciseProps {
  exercise: ParsedExerciseView;
  sequenceDraft: string[];
  disabled?: boolean;
  hideInstruction?: boolean;
  onAppend: (optionId: string) => void;
  onRemoveLast: () => void;
  onClear: () => void;
  onConfirm: () => void;
}

function optionById(
  options: SafeExerciseOption[],
  id: string
): SafeExerciseOption | undefined {
  return options.find((option) => option.id === id);
}

export function SequenceOrderExercise({
  exercise,
  sequenceDraft,
  disabled = false,
  hideInstruction = false,
  onAppend,
  onRemoveLast,
  onClear,
  onConfirm,
}: SequenceOrderExerciseProps) {
  const instructionId = useId();
  const tokenIds =
    exercise.interaction.mode === "sequence"
      ? exercise.interaction.tokenIds
      : exercise.options.map((option) => option.id);
  const expectedCount = tokenIds.length;
  const canConfirm = sequenceDraft.length === expectedCount && expectedCount > 0;

  return (
    <div className="w-full space-y-4">
      {!hideInstruction ? (
        <p
          id={instructionId}
          className="text-base md:text-lg font-medium leading-relaxed min-h-[3rem]"
          style={{ color: GM_TEXT, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {exercise.instruction}
        </p>
      ) : (
        <p id={instructionId} className="sr-only">
          {exercise.instruction}
        </p>
      )}

      <div aria-labelledby={instructionId}>
        <p className="text-sm mb-2" style={{ color: GM_TEXT_SEC }}>
          Tu orden ({sequenceDraft.length}/{expectedCount})
        </p>
        <ol className="flex flex-wrap gap-2 min-h-[3rem] mb-3 list-none p-0 m-0">
          {sequenceDraft.length === 0 ? (
            <li className="text-sm" style={{ color: GM_TEXT_SEC }}>
              Elige las piezas en el orden correcto.
            </li>
          ) : (
            sequenceDraft.map((id, index) => {
              const option = optionById(exercise.options, id);
              return (
                <li
                  key={`${id}-${index}`}
                  className="rounded-[12px] border px-3 py-2 text-sm font-semibold"
                  style={{ borderColor: GM_GOLD, color: GM_GOLD }}
                >
                  {index + 1}. {option?.text ?? id}
                </li>
              );
            })
          )}
        </ol>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            disabled={disabled || sequenceDraft.length === 0}
            onClick={onRemoveLast}
            className="rounded-[12px] border px-3 py-2 text-sm font-medium min-h-[44px]"
            style={{
              borderColor: GM_GOLD_MATT,
              color: GM_TEXT,
              opacity: disabled || sequenceDraft.length === 0 ? 0.45 : 1,
            }}
          >
            Quitar último
          </button>
          <button
            type="button"
            disabled={disabled || sequenceDraft.length === 0}
            onClick={onClear}
            className="rounded-[12px] border px-3 py-2 text-sm font-medium min-h-[44px]"
            style={{
              borderColor: GM_GOLD_MATT,
              color: GM_TEXT,
              opacity: disabled || sequenceDraft.length === 0 ? 0.45 : 1,
            }}
          >
            Limpiar
          </button>
        </div>

        <p className="text-sm mb-2" style={{ color: GM_TEXT_SEC }}>
          Piezas disponibles
        </p>
        <div className="flex flex-wrap gap-3 mb-4" role="group" aria-label="Piezas para ordenar">
          {exercise.options.map((option) => {
            const used = sequenceDraft.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled || used}
                onClick={() => onAppend(option.id)}
                className="min-w-[4.75rem] rounded-[14px] border px-5 py-4 text-lg font-bold transition-colors"
                style={{
                  borderColor: used ? GM_GOLD_MATT : GM_GOLD,
                  background: used ? "transparent" : "rgba(212, 175, 55, 0.08)",
                  color: used ? GM_TEXT_SEC : GM_GOLD,
                  opacity: disabled || used ? 0.45 : 1,
                  cursor: disabled || used ? "not-allowed" : "pointer",
                }}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={disabled || !canConfirm}
          onClick={onConfirm}
          className="w-full rounded-[14px] border px-5 py-4 text-base font-bold min-h-[44px]"
          style={{
            borderColor: GM_GOLD,
            background: canConfirm && !disabled ? GM_GOLD : "transparent",
            color: canConfirm && !disabled ? "#0A0A0A" : GM_TEXT_SEC,
            opacity: disabled || !canConfirm ? 0.55 : 1,
            cursor: disabled || !canConfirm ? "not-allowed" : "pointer",
          }}
        >
          Confirmar orden
        </button>
      </div>
    </div>
  );
}
