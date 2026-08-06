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
  onSelect: (optionId: string) => void;
}

export function MultipleChoiceExercise({
  exercise,
  selectedOptionId,
  disabled = false,
  showOptions = true,
  onSelect,
}: MultipleChoiceExerciseProps) {
  const instructionId = useId();
  const groupName = useId();

  return (
    <div className="w-full">
      <p
        id={instructionId}
        className="text-base md:text-lg font-medium leading-relaxed mb-5 min-h-[3rem]"
        style={{ color: GM_TEXT, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {exercise.instruction}
      </p>

      {showOptions ? (
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
      ) : null}
    </div>
  );
}
