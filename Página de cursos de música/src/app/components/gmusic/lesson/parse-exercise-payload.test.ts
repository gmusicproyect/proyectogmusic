import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PublicExercise } from "../../../services/gmusic-api/types";
import {
  MAX_EXERCISE_OPTIONS,
  MAX_LABEL_OR_BEAT_LENGTH,
  MAX_OPTION_TEXT_LENGTH,
  MAX_PATTERN_BEATS,
  MAX_TAP_SEQUENCE,
  parsePublicExercise,
} from "./parse-exercise-payload";

const SEED_IDENTIFY_NOTE: PublicExercise = {
  id: "550e8400-e29b-41d4-a716-446655440101",
  type: "IDENTIFY_NOTE",
  difficulty: 1,
  instruction: "Observa la imagen e identifica la parte de la guitarra señalada.",
  contentPayload: {
    imageUrl: null,
    options: [
      { id: "a", text: "Cejilla" },
      { id: "b", text: "Cuerdas" },
      { id: "c", text: "Mástil" },
      { id: "d", text: "Puente" },
    ],
  },
};

const SEED_CHORD_SHAPE: PublicExercise = {
  id: "550e8400-e29b-41d4-a716-446655440102",
  type: "CHORD_SHAPE",
  difficulty: 1,
  instruction: "Elige la digitación correcta para La menor (Am) en posición abierta.",
  contentPayload: {
    diagramLabel: "Am abierto",
    options: [
      { id: "a", text: "2-2-1-0-0-0 (desde 6a cuerda)" },
      { id: "b", text: "0-1-2-2-0-0" },
      { id: "c", text: "1-3-2-0-1-0" },
    ],
  },
};

const SEED_EAR_TRAINING: PublicExercise = {
  id: "550e8400-e29b-41d4-a716-446655440103",
  type: "EAR_TRAINING",
  difficulty: 1,
  instruction: "Escucha el acorde y elige si corresponde a La menor.",
  contentPayload: {
    audioUrl: "https://cdn.gmusic.academy/audio/samples/chord-am-open.mp3",
    options: [
      { id: "a", text: "Sí, es La menor" },
      { id: "b", text: "No, es otro acorde" },
    ],
  },
};

const SEED_RHYTHM_TAP: PublicExercise = {
  id: "550e8400-e29b-41d4-a716-446655440104",
  type: "RHYTHM_TAP",
  difficulty: 1,
  instruction: "Identifica el pulso en 4/4 según el patrón de taps mostrado.",
  contentPayload: {
    patternBeats: ["1", "2", "3", "4"],
    options: [
      { id: "a", text: "Pulso en negras (4 golpes iguales)" },
      { id: "b", text: "Pulso en corcheas continuas" },
      { id: "c", text: "Pulso en tresillos" },
    ],
  },
};

function assertSupported(exercise: PublicExercise) {
  const result = parsePublicExercise(exercise);
  assert.equal(result.kind, "supported");
  return result.kind === "supported" ? result.exercise : null;
}

describe("parsePublicExercise — payloads del seed", () => {
  it("IDENTIFY_NOTE con imageUrl null e options válidas", () => {
    const parsed = assertSupported(SEED_IDENTIFY_NOTE);
    assert.equal(parsed?.type, "IDENTIFY_NOTE");
    assert.equal(parsed?.options.length, 4);
    assert.equal(parsed?.media.imageUrl, undefined);
  });

  it("CHORD_SHAPE con diagramLabel", () => {
    const parsed = assertSupported(SEED_CHORD_SHAPE);
    assert.equal(parsed?.media.diagramLabel, "Am abierto");
  });

  it("EAR_TRAINING con audioUrl https", () => {
    const parsed = assertSupported(SEED_EAR_TRAINING);
    assert.equal(parsed?.media.audioUrl, "https://cdn.gmusic.academy/audio/samples/chord-am-open.mp3");
  });

  it("RHYTHM_TAP con patternBeats", () => {
    const parsed = assertSupported(SEED_RHYTHM_TAP);
    assert.deepEqual(parsed?.media.patternBeats, ["1", "2", "3", "4"]);
    assert.deepEqual(parsed?.interaction, { mode: "mcq" });
  });

  it("RHYTHM_TAP con tapSequence alineado a demo clase 4", () => {
    const parsed = assertSupported({
      id: "550e8400-e29b-41d4-a716-446655440105",
      type: "RHYTHM_TAP",
      difficulty: 1,
      instruction: "Marca el pulso tocando la cuerda 6 al aire, a tu ritmo.",
      contentPayload: {
        tapHeadline: "Pulso en cuerda 6",
        tapDescription:
          "Toca la cuerda 6 al aire en cada TAP. Ve a tu ritmo — no hay metrónomo.",
        tapSequence: Array.from({ length: 8 }, () => ({
          stringNumber: 6,
          label: "6",
          stringName: "Mi grave",
        })),
        submissionOptionId: "tap-complete",
      },
    });

    assert.equal(parsed?.interaction.mode, "tap");
    if (parsed?.interaction.mode !== "tap") return;

    assert.equal(parsed.interaction.submissionOptionId, "tap-complete");
    assert.equal(parsed.interaction.tapSequence.length, 8);
    assert.equal(parsed.options.length, 0);
    assert.equal(parsed.interaction.tapHeadline, "Pulso en cuerda 6");
  });
});

describe("parsePublicExercise — options", () => {
  it("rechaza options ausentes", () => {
    const result = parsePublicExercise({
      ...SEED_CHORD_SHAPE,
      contentPayload: { diagramLabel: "Am" },
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza menos de 2 opciones", () => {
    const result = parsePublicExercise({
      ...SEED_EAR_TRAINING,
      contentPayload: {
        options: [{ id: "a", text: "Solo una" }],
      },
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza IDs duplicados", () => {
    const result = parsePublicExercise({
      ...SEED_EAR_TRAINING,
      contentPayload: {
        options: [
          { id: "a", text: "Uno" },
          { id: "a", text: "Dos" },
        ],
      },
    });
    assert.equal(result.kind, "incompatible");
    if (result.kind === "incompatible") {
      assert.match(result.reason, /duplicad/i);
    }
  });

  it("rechaza opción sin text", () => {
    const result = parsePublicExercise({
      ...SEED_EAR_TRAINING,
      contentPayload: {
        options: [
          { id: "a", text: "Sí" },
          { id: "b", text: "   " },
        ],
      },
    });
    assert.equal(result.kind, "incompatible");
  });
});

describe("parsePublicExercise — payload estructura", () => {
  it("rechaza contentPayload null", () => {
    const result = parsePublicExercise({
      ...SEED_CHORD_SHAPE,
      contentPayload: null,
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza contentPayload array", () => {
    const result = parsePublicExercise({
      ...SEED_CHORD_SHAPE,
      contentPayload: [],
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza instruction vacía", () => {
    const result = parsePublicExercise({
      ...SEED_CHORD_SHAPE,
      instruction: "  ",
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza id vacío", () => {
    const result = parsePublicExercise({
      ...SEED_CHORD_SHAPE,
      id: "",
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza difficulty no entera", () => {
    const result = parsePublicExercise({
      ...SEED_CHORD_SHAPE,
      difficulty: 1.5,
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza difficulty negativa", () => {
    const result = parsePublicExercise({
      ...SEED_CHORD_SHAPE,
      difficulty: -1,
    });
    assert.equal(result.kind, "incompatible");
  });
});

describe("parsePublicExercise — URLs", () => {
  it("acepta URL http/https válida", () => {
    const parsed = assertSupported({
      ...SEED_EAR_TRAINING,
      contentPayload: {
        audioUrl: "http://cdn.example.com/sample.mp3",
        options: [
          { id: "a", text: "Sí, es La menor" },
          { id: "b", text: "No, es otro acorde" },
        ],
      },
    });
    assert.equal(parsed?.media.audioUrl, "http://cdn.example.com/sample.mp3");
  });

  it("rechaza javascript: como incompatible", () => {
    const result = parsePublicExercise({
      ...SEED_EAR_TRAINING,
      contentPayload: {
        audioUrl: "javascript:alert(1)",
        options: [
          { id: "a", text: "Sí" },
          { id: "b", text: "No" },
        ],
      },
    });
    assert.equal(result.kind, "incompatible");
    if (result.kind === "incompatible") assert.match(result.reason, /audioUrl/i);
  });

  it("rechaza data: como incompatible", () => {
    const result = parsePublicExercise({
      ...SEED_IDENTIFY_NOTE,
      contentPayload: {
        imageUrl: "data:image/png;base64,abc",
        options: [
          { id: "a", text: "Uno" },
          { id: "b", text: "Dos" },
        ],
      },
    });
    assert.equal(result.kind, "incompatible");
    if (result.kind === "incompatible") assert.match(result.reason, /imageUrl/i);
  });
});

describe("parsePublicExercise — campos desconocidos", () => {
  it("ignora campos desconocidos después del escaneo de seguridad", () => {
    const parsed = assertSupported({
      ...SEED_CHORD_SHAPE,
      contentPayload: {
        ...(SEED_CHORD_SHAPE.contentPayload as Record<string, unknown>),
        mysteryField: "valor",
        nested: { foo: "bar" },
      },
    });
    const serialized = JSON.stringify(parsed);
    assert.equal(serialized.includes("mysteryField"), false);
    assert.equal(serialized.includes("contentPayload"), false);
  });
});

describe("parsePublicExercise — límites máximos", () => {
  it("rechaza más de 20 opciones", () => {
    const options = Array.from({ length: MAX_EXERCISE_OPTIONS + 1 }, (_, index) => ({
      id: `opt-${index}`,
      text: `Opción ${index}`,
    }));
    const result = parsePublicExercise({
      ...SEED_CHORD_SHAPE,
      contentPayload: { options },
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza texto de opción demasiado largo", () => {
    const result = parsePublicExercise({
      ...SEED_EAR_TRAINING,
      contentPayload: {
        options: [
          { id: "a", text: "a".repeat(MAX_OPTION_TEXT_LENGTH + 1) },
          { id: "b", text: "ok" },
        ],
      },
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza demasiados patternBeats", () => {
    const result = parsePublicExercise({
      ...SEED_RHYTHM_TAP,
      contentPayload: {
        patternBeats: Array.from({ length: MAX_PATTERN_BEATS + 1 }, (_, i) => String(i + 1)),
        options: (SEED_RHYTHM_TAP.contentPayload as { options: unknown[] }).options,
      },
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza diagramLabel demasiado largo", () => {
    const result = parsePublicExercise({
      ...SEED_CHORD_SHAPE,
      contentPayload: {
        diagramLabel: "x".repeat(MAX_LABEL_OR_BEAT_LENGTH + 1),
        options: (SEED_CHORD_SHAPE.contentPayload as { options: unknown[] }).options,
      },
    });
    assert.equal(result.kind, "incompatible");
  });

  it("rechaza demasiados beats en tapSequence", () => {
    const result = parsePublicExercise({
      id: "tap-limit",
      type: "RHYTHM_TAP",
      difficulty: 1,
      instruction: "TAP.",
      contentPayload: {
        tapSequence: Array.from({ length: MAX_TAP_SEQUENCE + 1 }, () => ({
          stringNumber: 6,
          label: "6",
          stringName: "Mi grave",
        })),
        submissionOptionId: "tap-complete",
      },
    });
    assert.equal(result.kind, "incompatible");
  });
});

describe("parsePublicExercise — seguridad", () => {
  it("claves prohibidas anidadas lanzan UNSAFE_API_RESPONSE", () => {
    assert.throws(
      () =>
        parsePublicExercise({
          ...SEED_CHORD_SHAPE,
          contentPayload: {
            options: [
              { id: "a", text: "Uno" },
              { id: "b", text: "Dos" },
            ],
            meta: { secureAnswer: { correctOptionId: "a" } },
          },
        }),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.name, "GmusicApiError");
        assert.equal((error as unknown as { code: string }).code, "UNSAFE_API_RESPONSE");
        return true;
      }
    );
  });

  it("serialización del ParsedExerciseView no contiene secretos ni contentPayload", () => {
    const parsed = assertSupported(SEED_EAR_TRAINING);
    const serialized = JSON.stringify(parsed);

    assert.equal(serialized.includes("contentPayload"), false);
    assert.equal(serialized.includes("secureAnswer"), false);
    assert.equal(serialized.includes("correctOptionId"), false);
    assert.equal(serialized.includes("explanationAfterAnswer"), false);
    assert.equal(serialized.includes("isCorrect"), false);
    assert.equal(serialized.includes("accuracy"), false);
    assert.equal(serialized.includes("xpEarned"), false);
  });
});
