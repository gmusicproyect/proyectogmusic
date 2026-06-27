import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDemoUserState } from "./useDemoUserState";

describe("useDemoUserState — anonymous never usa localStorage para routing", () => {
  it("sin progreso local va a registro-cuenta", () => {
    const cta = getDemoUserState("anonymous");
    assert.equal(cta.destination, "registro-cuenta");
  });

  it("con progreso demo en localStorage sigue yendo a registro-cuenta", () => {
    const previousWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem(key: string) {
            if (key === "gmusic:demo_v1") {
              return JSON.stringify({ completed: [1, 2] });
            }
            return null;
          },
        },
      },
    });

    try {
      const cta = getDemoUserState("anonymous");
      assert.equal(cta.destination, "registro-cuenta");
      assert.equal(cta.label, "Probar mis 5 clases gratis");
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previousWindow,
      });
    }
  });
});
