import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  estimateStageRowWidth,
  shouldStageContainerFit,
  STAGE_FIT_MAX_NODES,
} from "../path-carousel-stage-fit";

describe("path-carousel-stage-fit", () => {
  it("5 cards fit in ~960px container at 1023 viewport", () => {
    const containerWidth = 960;
    const viewportWidth = 1023;
    assert.equal(shouldStageContainerFit(containerWidth, 5, viewportWidth), true);
  });

  it("5 cards fit in ~980px container at 1440 viewport", () => {
    assert.equal(shouldStageContainerFit(980, 5, 1440), true);
  });

  it("rejects mobile viewport even if container is wide", () => {
    assert.equal(shouldStageContainerFit(980, 5, 390), false);
  });

  it("rejects when card count exceeds max", () => {
    assert.equal(shouldStageContainerFit(1200, STAGE_FIT_MAX_NODES + 1, 1440), false);
  });

  it("estimateStageRowWidth grows with card count", () => {
    const w = 900;
    assert.ok(estimateStageRowWidth(5, w) > estimateStageRowWidth(3, w));
  });
});
