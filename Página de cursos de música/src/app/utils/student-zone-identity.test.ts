import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deriveStreakChipCopy,
  deriveStudentHeroEyebrow,
  deriveStudentHeroSituationLine,
  derivePathHeaderIdentity,
  NEUTRAL_STUDENT_NAME,
} from "./student-zone-identity";

describe("deriveStreakChipCopy", () => {
  it("racha 0 sin práctica hoy — copy de inicio", () => {
    assert.deepEqual(deriveStreakChipCopy(0, false), {
      label: "Empieza tu racha hoy",
      emphasis: "none",
    });
  });

  it("racha 0 con práctica hoy — constancia inicial", () => {
    assert.deepEqual(deriveStreakChipCopy(0, true), {
      label: "Hoy puede comenzar tu constancia",
      emphasis: "active",
    });
  });

  it("racha activa — muestra días", () => {
    assert.deepEqual(deriveStreakChipCopy(4, true), {
      label: "Racha: 4 días",
      emphasis: "active",
    });
  });

  it("racha pausada — retoma hoy", () => {
    assert.deepEqual(deriveStreakChipCopy(3, false), {
      label: "Retoma hoy · 3 días",
      emphasis: "recover",
    });
  });
});

describe("deriveStudentHeroEyebrow", () => {
  it("usa phaseLabel real cuando está disponible", () => {
    assert.equal(
      deriveStudentHeroEyebrow("Fundamento · Mes 2", false),
      "Guitarra · Fundamento · Mes 2"
    );
  });

  it("no usa Semana 3 ni copy fake", () => {
    assert.doesNotMatch(deriveStudentHeroEyebrow("Fundamento · Mes 1", false), /Semana 3/);
  });
});

describe("deriveStudentHeroSituationLine", () => {
  it("prioriza título de próxima práctica", () => {
    assert.equal(
      deriveStudentHeroSituationLine({
        isLoading: false,
        pathComplete: false,
        nextPracticeTitle: "Acordes abiertos",
        currentNodeTitle: "Otro",
      }),
      "Tu siguiente paso: «Acordes abiertos»."
    );
  });
});

describe("derivePathHeaderIdentity — nombre de sesión", () => {
  it("muestra nombre real cuando la sesión lo aporta", () => {
    assert.deepEqual(
      derivePathHeaderIdentity(
        { instrument: "Guitarra", month: "Mes 1", level: "Fundamento" },
        false,
        "María López"
      ),
      { userName: "María López", userSubtitle: "Guitarra · Fundamento" }
    );
  });

  it("fallback neutral sin nombre", () => {
    assert.equal(
      derivePathHeaderIdentity(undefined, true, undefined).userName,
      NEUTRAL_STUDENT_NAME
    );
  });
});
