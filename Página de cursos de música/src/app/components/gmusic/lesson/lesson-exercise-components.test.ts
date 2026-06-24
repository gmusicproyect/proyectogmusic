import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { findForbiddenLessonSessionKey } from "../../../services/gmusic-api/assert-safe-lesson-session";
import {
  isSafeExerciseMediaUrl,
} from "./ExerciseMediaBlock";
import {
  normalizeStepperValues,
} from "./LessonExerciseStepper";
import type { ParsedExerciseView } from "./lesson-runner-types";

const root = dirname(fileURLToPath(import.meta.url));

const componentSources = {
  stepper: readFileSync(join(root, "LessonExerciseStepper.tsx"), "utf8"),
  media: readFileSync(join(root, "ExerciseMediaBlock.tsx"), "utf8"),
  multipleChoice: readFileSync(join(root, "MultipleChoiceExercise.tsx"), "utf8"),
  unsupported: readFileSync(join(root, "UnsupportedExercisePanel.tsx"), "utf8"),
};

const allSources = Object.values(componentSources);

const forbiddenImports = [
  "ExerciseEngine",
  "LessonPage",
  "Ex1",
  "Ex2",
  "Ex3",
  "Ex4",
  "Ex5",
  "Tonal",
  "contentPayload",
  "secureAnswer",
  "correctOptionId",
  "isCorrect",
  "xpEarned",
  "accuracy",
];

const SAMPLE_EXERCISE: ParsedExerciseView = {
  id: "ex-sample",
  type: "IDENTIFY_NOTE",
  difficulty: 1,
  instruction: "Identifica la nota señalada.",
  options: [
    { id: "a", text: "Mi" },
    { id: "b", text: "La" },
  ],
  media: {},
  interaction: { mode: "mcq" },
};

describe("normalizeStepperValues", () => {
  it("normaliza índice y total válidos", () => {
    assert.deepEqual(normalizeStepperValues(1, 3), {
      currentIndex: 1,
      total: 3,
      displayIndex: 2,
      progressPercent: 67,
    });
  });

  it("clamp índice por debajo de 0", () => {
    assert.deepEqual(normalizeStepperValues(-5, 4), {
      currentIndex: 0,
      total: 4,
      displayIndex: 1,
      progressPercent: 25,
    });
  });

  it("clamp índice por encima del total", () => {
    assert.deepEqual(normalizeStepperValues(99, 4), {
      currentIndex: 3,
      total: 4,
      displayIndex: 4,
      progressPercent: 100,
    });
  });

  it("total no finito o <= 0 devuelve estado vacío estable", () => {
    for (const total of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.deepEqual(normalizeStepperValues(2, total), {
        currentIndex: 0,
        total: 0,
        displayIndex: 0,
        progressPercent: 0,
      });
    }
  });

  it("currentIndex no finito se trata como 0", () => {
    assert.deepEqual(normalizeStepperValues(Number.NaN, 5), {
      currentIndex: 0,
      total: 5,
      displayIndex: 1,
      progressPercent: 20,
    });
  });
});

describe("LessonExerciseStepper — accesibilidad y layout", () => {
  it("expone progreso accesible sin depender de valores inválidos", () => {
    assert.match(componentSources.stepper, /normalizeStepperValues/);
    assert.match(componentSources.stepper, /role="progressbar"/);
    assert.match(componentSources.stepper, /aria-current/);
    assert.match(componentSources.stepper, /Ejercicio \$\{displayIndex\} de \$\{safeTotal\}/);
    assert.match(componentSources.stepper, /min-h-\[1\.25rem\]/);
  });
});

describe("isSafeExerciseMediaUrl", () => {
  it("acepta http y https", () => {
    assert.equal(isSafeExerciseMediaUrl("https://cdn.example.com/audio.mp3"), true);
    assert.equal(isSafeExerciseMediaUrl("http://cdn.example.com/image.png"), true);
  });

  it("rechaza javascript, data y URLs inválidas", () => {
    assert.equal(isSafeExerciseMediaUrl("javascript:alert(1)"), false);
    assert.equal(isSafeExerciseMediaUrl("data:text/html,hello"), false);
    assert.equal(isSafeExerciseMediaUrl(""), false);
    assert.equal(isSafeExerciseMediaUrl(undefined), false);
  });
});

describe("ExerciseMediaBlock — render seguro", () => {
  it("solo renderiza campos seguros del view model", () => {
    assert.match(componentSources.media, /isSafeExerciseMediaUrl\(media\.audioUrl\)/);
    assert.match(componentSources.media, /isSafeExerciseMediaUrl\(media\.imageUrl\)/);
    assert.match(componentSources.media, /media\.diagramLabel/);
    assert.match(componentSources.media, /media\.patternBeats/);
    assert.equal(componentSources.media.includes("contentPayload"), false);
  });

  it("usa audio controls sin autoplay", () => {
    assert.match(componentSources.media, /<audio/);
    assert.match(componentSources.media, /controls/);
    assert.match(componentSources.media, /preload="none"/);
    assert.equal(componentSources.media.includes("autoplay"), false);
  });

  it("usa img con alt genérico y dimensiones estables", () => {
    assert.match(componentSources.media, /<img/);
    assert.match(componentSources.media, /alt="Ilustración del ejercicio"/);
    assert.match(componentSources.media, /width=\{640\}/);
    assert.match(componentSources.media, /height=\{360\}/);
    assert.match(componentSources.media, /aspectRatio/);
  });

  it("no usa HTML crudo", () => {
    assert.equal(componentSources.media.includes("dangerouslySetInnerHTML"), false);
  });
});

describe("MultipleChoiceExercise — selección segura", () => {
  it("emite option.id en onSelect, nunca el texto", () => {
    assert.match(componentSources.multipleChoice, /onSelect\(option\.id\)/);
    assert.equal(componentSources.multipleChoice.includes("onSelect(option.text)"), false);
    assert.equal(componentSources.multipleChoice.includes("contentPayload"), false);
  });

  it("usa radio group accesible con soporte nativo", () => {
    assert.match(componentSources.multipleChoice, /role="radiogroup"/);
    assert.match(componentSources.multipleChoice, /type="radio"/);
    assert.match(componentSources.multipleChoice, /aria-labelledby/);
    assert.match(componentSources.multipleChoice, /<fieldset/);
    assert.match(componentSources.multipleChoice, /<legend className="sr-only"/);
  });

  it("disabled bloquea interacción", () => {
    assert.match(componentSources.multipleChoice, /disabled=\{disabled\}/);
    assert.match(componentSources.multipleChoice, /<fieldset disabled=\{disabled\}/);
  });

  it("no muestra grading ni feedback de acierto", () => {
    assert.equal(componentSources.multipleChoice.includes("isCorrect"), false);
    assert.equal(componentSources.multipleChoice.includes("correctOptionId"), false);
    assert.equal(componentSources.multipleChoice.includes("xpEarned"), false);
    assert.equal(componentSources.multipleChoice.includes("accuracy"), false);
  });

  it("mantiene altura mínima estable en opciones", () => {
    assert.match(componentSources.multipleChoice, /min-h-\[3\.25rem\]/);
    assert.match(componentSources.multipleChoice, /min-h-\[3rem\]/);
  });
});

describe("UnsupportedExercisePanel", () => {
  it("muestra error compatible y botón Salir", () => {
    assert.match(componentSources.unsupported, /role="alert"/);
    assert.match(componentSources.unsupported, /Salir/);
    assert.match(componentSources.unsupported, /onExit/);
  });

  it("no permite saltar ejercicio", () => {
    assert.equal(componentSources.unsupported.toLowerCase().includes("saltar"), false);
    assert.equal(componentSources.unsupported.toLowerCase().includes("skip"), false);
    assert.equal(componentSources.unsupported.toLowerCase().includes("siguiente"), false);
  });
});

describe("componentes de ejercicio — seguridad de serialización", () => {
  it("el view model de ejemplo no contiene claves prohibidas", () => {
    assert.equal(findForbiddenLessonSessionKey(SAMPLE_EXERCISE), null);

    const serialized = JSON.stringify(SAMPLE_EXERCISE);
    assert.equal(serialized.includes("contentPayload"), false);
    assert.equal(serialized.includes("secureAnswer"), false);
    assert.equal(serialized.includes("correctOptionId"), false);
    assert.equal(serialized.includes("isCorrect"), false);
    assert.equal(serialized.includes("accuracy"), false);
    assert.equal(serialized.includes("xpEarned"), false);
  });

  it("ningún componente referencia contentPayload ni secretos en source", () => {
    for (const source of allSources) {
      assert.equal(source.includes("contentPayload"), false);
      assert.equal(source.includes("secureAnswer"), false);
      assert.equal(source.includes("correctOptionId"), false);
      assert.equal(source.includes("explanationAfterAnswer"), false);
      assert.equal(source.includes("isCorrect"), false);
      assert.equal(source.includes("accuracy"), false);
      assert.equal(source.includes("xpEarned"), false);
      assert.equal(source.includes("dangerouslySetInnerHTML"), false);
    }
  });
});

describe("componentes de ejercicio — sin legacy", () => {
  it("ningún archivo importa ExerciseEngine, LessonPage, Ex1–Ex5 ni Tonal.js", () => {
    for (const [name, source] of Object.entries(componentSources)) {
      for (const symbol of forbiddenImports) {
        assert.equal(
          source.includes(symbol),
          false,
          `${name} no debe referenciar ${symbol}`
        );
      }
    }
  });
});
