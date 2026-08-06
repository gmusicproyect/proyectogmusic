import { useId } from "react";
import type { ParsedExerciseView } from "./lesson-runner-types";
import {
  GM_GOLD,
  GM_GOLD_MATT,
  GM_SURFACE_ALT,
  GM_TEXT,
  GM_TEXT_SEC,
} from "../tokens";

export interface MultipleChoiceExerciseProps {
  exercise: ParsedExerciseView;
  selectedOptionId: string | null;
  disabled?: boolean;
  showOptions?: boolean;
  /** pills = Paquete A (opciones horizontales); default = lista accesible */
  layout?: "list" | "pills";
  hideInstruction?: boolean;
  onSelect: (optionId: string) => void;
}

export function MultipleChoiceExercise({
  exercise,
  selectedOptionId,
  disabled = false,
  showOptions = true,
  layout = "list",
  hideInstruction = false,
  onSelect,
}: MultipleChoiceExerciseProps) {
  const instructionId = useId();
  const groupName = useId();

  return (
    <div className="w-full">
      {!hideInstruction ? (
        <p
          id={instructionId}
          className="text-base md:text-lg font-medium leading-relaxed mb-5 min-h-[3rem]"
          style={{ color: GM_TEXT, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {exercise.instruction}
        </p>
      ) : (
        <p id={instructionId} className="sr-only">
          {exercise.instruction}
        </p>
      )}

      {showOptions ? (
        layout === "pills" ? (
          <div
            role="radiogroup"
            aria-labelledby={instructionId}
            className="flex flex-wrap gap-3"
          >
            {exercise.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(option.id)}
                  className="min-w-[4.75rem] rounded-[14px] border px-5 py-4 text-lg font-bold transition-colors"
                  style={{
                    borderColor: isSelected ? GM_GOLD : GM_GOLD_MATT,
                    background: isSelected ? "rgba(212, 175, 55, 0.08)" : "rgba(0, 0, 0, 0.35)",
                    color: isSelected ? GM_GOLD : GM_TEXT,
                    opacity: disabled ? 0.55 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  aria-pressed={isSelected}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        ) : (
        <>
          <fieldset disabled={disabled} className="border-0 p-0 m-0 min-w-0">
            <legend className="sr-only">Opciones de respuesta</legend>
            <div
              role="radiogroup"
              aria-labelledby={instructionId}
              className="grid gap-3"
            >
              {exercise.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <label
                    key={option.id}
                    className="flex items-start gap-3 rounded-lg border px-4 py-3 min-h-[3.25rem] cursor-pointer transition-colors"
                    style={{
                      borderColor: isSelected ? GM_GOLD : GM_GOLD_MATT,
                      background: isSelected ? "rgba(212, 175, 55, 0.08)" : GM_SURFACE_ALT,
                      opacity: disabled ? 0.6 : 1,
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name={groupName}
                      value={option.id}
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => onSelect(option.id)}
                      className="mt-1 shrink-0 accent-[#D4AF37]"
                      aria-checked={isSelected}
                    />
                    <span className="text-sm leading-relaxed pt-0.5" style={{ color: GM_TEXT }}>
                      {option.text}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <p className="sr-only" style={{ color: GM_TEXT_SEC }}>
            Selecciona una opción para continuar.
          </p>
        </>
        )
      ) : null}
    </div>
  );
}
