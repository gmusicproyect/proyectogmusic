import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveAcademiaPublicCta } from "./academia-public-cta";

describe("resolveAcademiaPublicCta — landing pública T4A", () => {
  it("anónimo/error lleva a registro con copy de 5 clases gratis", () => {
    const anonymous = resolveAcademiaPublicCta("anonymous");
    assert.equal(anonymous.label, "Probar mis 5 clases gratis");
    assert.equal(anonymous.destination, "registro-cuenta");

    const error = resolveAcademiaPublicCta("error");
    assert.equal(error.label, "Probar mis 5 clases gratis");
    assert.equal(error.destination, "registro-cuenta");
  });

  it("registered_no_sub sin demo va a onboarding-academia", () => {
    const cta = resolveAcademiaPublicCta("registered_no_sub");
    assert.equal(cta.label, "Continuar mi camino");
    assert.equal(cta.destination, "onboarding-academia");
  });

  it("authenticated va a mi-estudio", () => {
    const cta = resolveAcademiaPublicCta("authenticated");
    assert.equal(cta.label, "Entrar a mi academia");
    assert.equal(cta.destination, "mi-estudio");
  });

  it("loading deshabilita el CTA", () => {
    const cta = resolveAcademiaPublicCta("loading");
    assert.equal(cta.disabled, true);
  });
});
