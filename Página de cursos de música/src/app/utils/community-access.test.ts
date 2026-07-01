import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCommunitySectorForLevel } from "../data/community-sectors";
import {
  assertAuthorizedCommunityLevel,
  buildCommunityPostCreateContext,
  CommunityAccessDeniedError,
  resolveAuthorizedCommunityLevel,
} from "./community-access";
import { resolveCommunityEnrollment } from "./community-enrollment";

describe("community-sectors", () => {
  it("expone tres sectores internos por nivel", () => {
    assert.equal(getCommunitySectorForLevel("BASIC").sectorId, "basic");
    assert.equal(getCommunitySectorForLevel("INTERMEDIATE").sectorId, "intermediate");
    assert.equal(getCommunitySectorForLevel("ADVANCED").sectorId, "advanced");
  });
});

describe("community-access", () => {
  it("fuerza nivel autorizado desde enrollment aunque el cliente pida otro", () => {
    const enrollment = resolveCommunityEnrollment({
      enrollmentProgramLabel: "Guitarra Básico",
    });
    assert.equal(resolveAuthorizedCommunityLevel(enrollment, "INTERMEDIATE"), "BASIC");
    assert.equal(resolveAuthorizedCommunityLevel(enrollment, "ADVANCED"), "BASIC");
  });

  it("assertAuthorizedCommunityLevel rechaza mismatch", () => {
    assert.throws(
      () => assertAuthorizedCommunityLevel("BASIC", "INTERMEDIATE"),
      CommunityAccessDeniedError
    );
  });

  it("buildCommunityPostCreateContext deriva metadatos del enrollment", () => {
    const enrollment = resolveCommunityEnrollment({
      enrollmentProgramLabel: "Guitarra Básico",
      currentLessonNumber: 3,
    });
    const ctx = buildCommunityPostCreateContext(enrollment);
    assert.equal(ctx.level, "BASIC");
    assert.equal(ctx.instrument, "Guitarra");
    assert.equal(ctx.lessonNumber, 3);
    assert.equal(ctx.programLabel, "Guitarra Básico");
  });
});
