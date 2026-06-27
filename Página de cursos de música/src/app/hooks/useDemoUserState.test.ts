import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { useDemoUserState } from "./useDemoUserState";

describe("useDemoUserState — registered_no_sub", () => {
  it("sin progreso demo ofrece acceso al camino demo", () => {
    const cta = useDemoUserState("registered_no_sub");
    assert.equal(cta.label, "Iniciar mis clases gratis");
    assert.equal(cta.destination, "mi-camino-demo");
  });

  it("authenticated sigue yendo a mi-estudio", () => {
    const cta = useDemoUserState("authenticated");
    assert.equal(cta.label, "Entrar a mi academia");
    assert.equal(cta.destination, "mi-estudio");
  });
});

describe("useDemoUserState — anonymous", () => {
  it("anónimo va a registro con copy de 5 clases gratis", () => {
    const cta = useDemoUserState("anonymous");
    assert.equal(cta.label, "Probar mis 5 clases gratis");
    assert.equal(cta.destination, "registro-cuenta");
  });
});
