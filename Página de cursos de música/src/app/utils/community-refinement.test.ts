import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterCommunityPostsForFeed,
  shouldShowCuratedInFeed,
  communityPostActionLabel,
} from "../data/community-post-types";
import { MOCK_COMMUNITY_POSTS, SAMPLE_COMMUNITY_POSTS } from "../data/mock-community-posts";
import { resolveWeeklyChallenge } from "../data/mock-community-data";
import {
  detectExternalLinkProvider,
  externalLinkCardCopy,
} from "./community-external-link";
import { getStudentCommunityLevel } from "./get-student-community-level";
import { resolveCommunityEnrollment } from "./community-enrollment";

describe("getStudentCommunityLevel", () => {
  it("usa enrollment activo o BASIC como fallback", () => {
    const enrollment = resolveCommunityEnrollment({ enrollmentProgramLabel: "Guitarra Intermedio" });
    assert.equal(getStudentCommunityLevel(enrollment), "INTERMEDIATE");
    assert.equal(getStudentCommunityLevel(null), "BASIC");
  });
});

describe("community-external-link", () => {
  it("detecta proveedor desde URL", () => {
    assert.equal(detectExternalLinkProvider("https://drive.google.com/file/d/abc"), "drive");
    assert.equal(detectExternalLinkProvider("https://youtu.be/abc"), "youtube");
    assert.equal(detectExternalLinkProvider("https://soundcloud.com/x/y"), "soundcloud");
  });

  it("genera copy de card para progreso y música", () => {
    assert.equal(
      externalLinkCardCopy("drive", "progress").headline,
      "Video en Google Drive"
    );
    assert.equal(externalLinkCardCopy("drive", "progress").ctaLabel, "Ver archivo");
    assert.equal(externalLinkCardCopy("youtube", "progress").ctaLabel, "Ver práctica");
    assert.equal(externalLinkCardCopy("youtube", "music").ctaLabel, "Ver video");
    assert.equal(externalLinkCardCopy("spotify", "music").ctaLabel, "Escuchar canción");
    assert.equal(externalLinkCardCopy("soundcloud", "music").ctaLabel, "Escuchar audio");
    assert.equal(externalLinkCardCopy("youtube", "admin_featured").headline, "Referencia en YouTube");
    assert.equal(
      externalLinkCardCopy("youtube", "admin_featured").ctaLabel,
      "Escuchar referencia"
    );
  });
});

describe("communityPostActionLabel", () => {
  it("asigna CTA por tipo de publicación", () => {
    assert.equal(communityPostActionLabel("question"), "Responder");
    assert.equal(communityPostActionLabel("progress"), "Dar feedback");
    assert.equal(communityPostActionLabel("music"), "Comentar");
  });
});

describe("filterCommunityPostsForFeed", () => {
  it("feed de producción inicia vacío", () => {
    assert.equal(MOCK_COMMUNITY_POSTS.length, 0);
    const basicAll = filterCommunityPostsForFeed(MOCK_COMMUNITY_POSTS, "BASIC", "all");
    assert.equal(basicAll.length, 0);
  });

  it("filtra por nivel y tipo con fixture de tests", () => {
    const basicQuestions = filterCommunityPostsForFeed(SAMPLE_COMMUNITY_POSTS, "BASIC", "questions");
    assert.ok(basicQuestions.every((p) => p.postType === "question" && p.level === "BASIC"));

    const basicProgress = filterCommunityPostsForFeed(SAMPLE_COMMUNITY_POSTS, "BASIC", "progress");
    assert.ok(basicProgress.every((p) => p.postType === "progress" || p.postType === "feedback"));
  });

  it("excluye colaboración del feed visible", () => {
    const intermediateAll = filterCommunityPostsForFeed(
      SAMPLE_COMMUNITY_POSTS,
      "INTERMEDIATE",
      "all"
    );
    assert.equal(
      intermediateAll.some((p) => p.postType === "collaboration"),
      false
    );
  });

  it("ordena feed Todo priorizando preguntas y progresos", () => {
    const basicAll = filterCommunityPostsForFeed(SAMPLE_COMMUNITY_POSTS, "BASIC", "all");
    assert.equal(basicAll[0]?.postType, "question");
    assert.ok(basicAll.some((p) => p.postType === "progress"));
  });

  it("ubica curado al final en Todo y arriba en Música", () => {
    assert.equal(shouldShowCuratedInFeed("all"), "bottom");
    assert.equal(shouldShowCuratedInFeed("music"), "top");
    assert.equal(shouldShowCuratedInFeed("questions"), false);
  });
});

describe("resolveWeeklyChallenge", () => {
  it("retorna null en MVP — sin reto semanal impuesto", () => {
    const challenge = resolveWeeklyChallenge({
      instrument: "Guitarra",
      level: "BASIC",
      lessonNumber: 3,
    });
    assert.equal(challenge, null);
  });
});
