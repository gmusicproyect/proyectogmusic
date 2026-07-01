import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  academicTierFromCommunityLevel,
  communityLevelFromAcademicTier,
  parseCommunityLevelFromProgramLabel,
} from "../data/community-level";
import {
  filterCommunityPostsByLevel,
  type CommunityPost,
} from "../data/community-post-types";
import { MOCK_COMMUNITY_POSTS, SAMPLE_COMMUNITY_POSTS } from "../data/mock-community-posts";
import {
  DEFAULT_MOCK_COMMUNITY_ENROLLMENT,
  buildCommunityProgramLabel,
  persistCommunityEnrollmentFromAcademiaSelection,
  resolveCommunityEnrollment,
} from "./community-enrollment";

describe("community-level", () => {
  it("mapea academic tier ↔ community level", () => {
    assert.equal(communityLevelFromAcademicTier("basico"), "BASIC");
    assert.equal(communityLevelFromAcademicTier("intermedio"), "INTERMEDIATE");
    assert.equal(communityLevelFromAcademicTier("avanzado"), "ADVANCED");
    assert.equal(academicTierFromCommunityLevel("BASIC"), "basico");
    assert.equal(academicTierFromCommunityLevel("INTERMEDIATE"), "intermedio");
    assert.equal(academicTierFromCommunityLevel("ADVANCED"), "avanzado");
  });

  it("parsea program label de inscripción", () => {
    assert.equal(parseCommunityLevelFromProgramLabel("Guitarra Básico"), "BASIC");
    assert.equal(parseCommunityLevelFromProgramLabel("Guitarra Intermedio"), "INTERMEDIATE");
    assert.equal(parseCommunityLevelFromProgramLabel("Guitarra Avanzado"), "ADVANCED");
    assert.equal(parseCommunityLevelFromProgramLabel("Piano"), null);
  });
});

describe("community-enrollment", () => {
  it("resuelve enrollment mock por defecto en BASIC", () => {
    const enrollment = resolveCommunityEnrollment();
    assert.equal(enrollment.communityLevel, "BASIC");
    assert.equal(enrollment.programLabel, "Guitarra Básico");
    assert.equal(enrollment.instrument, "Guitarra");
  });

  it("prioriza enrollmentProgramLabel sobre default", () => {
    const enrollment = resolveCommunityEnrollment({
      enrollmentProgramLabel: "Guitarra Intermedio",
      currentLessonTitle: "Hammer-on",
    });
    assert.equal(enrollment.communityLevel, "INTERMEDIATE");
    assert.equal(enrollment.academicTierId, "intermedio");
    assert.equal(enrollment.currentLessonTitle, "Hammer-on");
  });

  it("persiste sector al elegir instrumento y nivel en Academia", () => {
    const enrollment = persistCommunityEnrollmentFromAcademiaSelection({
      instrumentId: "guitarra",
      academicTierId: "intermedio",
    });
    assert.equal(enrollment.communityLevel, "INTERMEDIATE");
    assert.equal(enrollment.programLabel, "Guitarra Intermedio");
    assert.equal(enrollment.instrument, "Guitarra");
  });

  it("buildCommunityProgramLabel arma program label canónico", () => {
    assert.equal(buildCommunityProgramLabel("Guitarra", "avanzado"), "Guitarra Avanzado");
  });
});

describe("filterCommunityPostsByLevel", () => {
  it("feed de producción inicia vacío", () => {
    assert.equal(MOCK_COMMUNITY_POSTS.length, 0);
  });

  it("filtra posts por nivel con fixture de tests", () => {
    const basic = filterCommunityPostsByLevel(SAMPLE_COMMUNITY_POSTS, "BASIC");
    assert.ok(basic.length >= 2);
    assert.ok(basic.every((p: CommunityPost) => p.level === "BASIC"));

    const advanced = filterCommunityPostsByLevel(SAMPLE_COMMUNITY_POSTS, "ADVANCED");
    assert.ok(advanced.length >= 1);
    assert.ok(advanced.every((p: CommunityPost) => p.level === "ADVANCED"));
  });
});
