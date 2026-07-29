import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.join(here, "StudentZoneGuard.tsx"), "utf8");

describe("T-UX-01 — 403 con sesión admin", () => {
  it("denied + role ADMIN muestra panel con CTA al panel admin", () => {
    assert.match(source, /access\.user\.role === "ADMIN"/);
    assert.match(source, /Esta zona es del alumno/);
    assert.match(source, /Tu sesión es de administrador/);
    assert.match(source, /Ir al panel admin/);
    assert.match(source, /setPage\("admin"\)/);
  });

  it("redirect silencioso a planes se omite para ADMIN", () => {
    assert.match(
      source,
      /if \(access\.user\.role === "ADMIN"\) return;[\s\S]*navigateDeniedToHomePlans/
    );
  });
});
