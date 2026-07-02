import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadCommunityEnrollmentOnce } from "./community-enrollment-load";
import type { CommunityEnrollmentApiRecord } from "./map-community-enrollment";
import { GmusicApiError } from "./client";

describe("community-enrollment-load", () => {
  it("mapea enrollment desde API", async () => {
    const controller = new AbortController();
    const apiRecord: CommunityEnrollmentApiRecord = {
      instrument: "Guitarra",
      academic_tier_id: "intermedio",
      community_level: "INTERMEDIATE",
      program_label: "Guitarra Intermedio",
      current_lesson_number: 8,
      current_lesson_title: "Barras",
    };

    const outcome = await loadCommunityEnrollmentOnce(
      controller.signal,
      {},
      {
        fetchCommunityEnrollment: async () => apiRecord,
      }
    );

    assert.equal(outcome.type, "success");
    if (outcome.type !== "success") return;
    assert.equal(outcome.enrollment.communityLevel, "INTERMEDIATE");
    assert.equal(outcome.enrollment.programLabel, "Guitarra Intermedio");
  });

  it("usa fallback cuando API responde 403", async () => {
    const controller = new AbortController();

    const outcome = await loadCommunityEnrollmentOnce(
      controller.signal,
      { currentLessonTitle: "Rasgueo" },
      {
        fetchCommunityEnrollment: async () => {
          throw new GmusicApiError("Sin inscripción", 403, "FORBIDDEN");
        },
      }
    );

    assert.equal(outcome.type, "fallback");
    if (outcome.type !== "fallback") return;
    assert.equal(outcome.enrollment.currentLessonTitle, "Rasgueo");
  });
});
