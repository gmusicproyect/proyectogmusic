import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(root, "../App.tsx"), "utf8");
const communitySource = readFileSync(join(root, "GmusicCommunity.tsx"), "utf8");

const communityPageSource = readFileSync(join(root, "CommunityPage.tsx"), "utf8");

describe("Comunidad — desbloqueo nav suscriptor (opción A)", () => {
  it("App monta GmusicCommunity con handlePageChange", () => {
    assert.match(appSource, /currentPage === "community"[\s\S]*GmusicCommunity setPage=\{handlePageChange\}/);
    assert.equal(appSource.includes("CommunityPage setPage={handlePageChange}"), false);
  });

  it("community queda fuera de Navbar y MusicPlayer", () => {
    assert.match(appSource, /"community"/);
    assert.match(
      appSource,
      /!\[[^\]]*"community"[^\]]*\]\.includes\(currentPage\)/
    );
  });

  it("GmusicCommunity usa header interno y StudioAtmosphere", () => {
    assert.equal(communitySource.includes("GmusicInternalHeader"), true);
    assert.equal(communitySource.includes('activeNav="comunidad"'), true);
    assert.equal(communitySource.includes("StudioAtmosphere"), true);
    assert.equal(communitySource.includes("embedded"), true);
    assert.equal(communitySource.includes("gmusic-community-shell"), true);
    assert.equal(communitySource.includes("enrollment={enrollment}"), true);
  });

  it("CommunityPage filtra feed por nivel y muestra Tu nivel", () => {
    assert.equal(communityPageSource.includes("CommunityLevelBadge"), true);
    assert.equal(communityPageSource.includes("filterCommunityPostsForFeed"), true);
    assert.equal(communityPageSource.includes("getStudentCommunityLevel"), true);
    assert.equal(communityPageSource.includes("buildCommunityPostCreateContext"), true);
    assert.equal(communityPageSource.includes("studentLevel"), true);
    assert.equal(communityPageSource.includes("isReadOnlyView"), false);
    assert.equal(communityPageSource.includes("CommunityFeedFilterRow"), true);
    assert.equal(communityPageSource.includes("CommunityLevelBadge"), true);
    assert.equal(communityPageSource.includes("CommunityPeersPanel"), true);
    assert.equal(communityPageSource.includes("community-toolbar"), true);
    assert.equal(communityPageSource.includes("community-page__content"), true);
  });
});
