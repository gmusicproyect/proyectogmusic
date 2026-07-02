import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "../lib/errors.js";
import {
  buildProgramLabelFromEnrollment,
  parseUpsertCommunityEnrollmentBody,
} from "../lib/parseUpsertCommunityEnrollmentBody.js";

describe("parseUpsertCommunityEnrollmentBody", () => {
  it("parsea snake_case mínimo", () => {
    const parsed = parseUpsertCommunityEnrollmentBody({
      instrument: "Guitarra",
      academic_tier_id: "basico",
    });
    assert.equal(parsed.instrument, "Guitarra");
    assert.equal(parsed.academicTierId, "basico");
    assert.equal(parsed.programLabel, null);
    assert.equal(parsed.currentLessonNumber, null);
  });

  it("parsea campos opcionales", () => {
    const parsed = parseUpsertCommunityEnrollmentBody({
      instrument: "Guitarra",
      academic_tier_id: "intermedio",
      program_label: "Guitarra Intermedio",
      current_lesson_number: 5,
      current_lesson_title: "Hammer-on",
    });
    assert.equal(parsed.academicTierId, "intermedio");
    assert.equal(parsed.programLabel, "Guitarra Intermedio");
    assert.equal(parsed.currentLessonNumber, 5);
    assert.equal(parsed.currentLessonTitle, "Hammer-on");
  });

  it("rechaza tier inválido", () => {
    assert.throws(
      () =>
        parseUpsertCommunityEnrollmentBody({
          instrument: "Guitarra",
          academic_tier_id: "experto",
        }),
      (error: unknown) => error instanceof ApiError && error.status === 400
    );
  });

  it("rechaza instrumento vacío", () => {
    assert.throws(
      () =>
        parseUpsertCommunityEnrollmentBody({
          instrument: "  ",
          academic_tier_id: "basico",
        }),
      (error: unknown) => error instanceof ApiError && error.status === 400
    );
  });
});

describe("buildProgramLabelFromEnrollment", () => {
  it("arma program label canónico", () => {
    assert.equal(
      buildProgramLabelFromEnrollment({ instrument: "Guitarra", academicTierId: "avanzado" }),
      "Guitarra Avanzado"
    );
  });
});
