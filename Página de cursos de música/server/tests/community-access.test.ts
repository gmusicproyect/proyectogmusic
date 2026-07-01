import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertAuthorizedCommunityLevel,
  buildCommunityRequestScope,
  CommunityAccessDeniedError,
  parseCommunityLevelFromProgramLabel,
  resolveAuthorizedCommunityLevel,
} from "../lib/communityAccess.js";

describe("server communityAccess", () => {
  it("parsea nivel desde program label", () => {
    assert.equal(parseCommunityLevelFromProgramLabel("Guitarra Básico"), "BASIC");
    assert.equal(parseCommunityLevelFromProgramLabel("Guitarra Intermedio"), "INTERMEDIATE");
    assert.equal(parseCommunityLevelFromProgramLabel("Guitarra Avanzado"), "ADVANCED");
  });

  it("ignora level del cliente distinto al enrollment", () => {
    assert.equal(resolveAuthorizedCommunityLevel("BASIC", "ADVANCED"), "BASIC");
    assert.equal(resolveAuthorizedCommunityLevel("INTERMEDIATE", "BASIC"), "INTERMEDIATE");
  });

  it("rechaza level del cliente en assertAuthorizedCommunityLevel", () => {
    assert.throws(
      () => assertAuthorizedCommunityLevel("BASIC", "INTERMEDIATE"),
      CommunityAccessDeniedError
    );
    assert.equal(assertAuthorizedCommunityLevel("BASIC", "BASIC"), "BASIC");
    assert.equal(assertAuthorizedCommunityLevel("BASIC", null), "BASIC");
  });

  it("buildCommunityRequestScope usa enrollment, no level del cliente", () => {
    const scope = buildCommunityRequestScope({
      programLabel: "Guitarra Básico",
      instrument: "Guitarra",
      lessonNumber: 3,
      clientRequestedLevel: "ADVANCED",
    });
    assert.equal(scope.level, "BASIC");
    assert.equal(scope.instrument, "Guitarra");
    assert.equal(scope.lessonNumber, 3);
  });
});
