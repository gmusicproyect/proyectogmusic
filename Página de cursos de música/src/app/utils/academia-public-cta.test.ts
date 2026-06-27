import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveAcademiaPublicCta } from "./academia-public-cta";

describe("resolveAcademiaPublicCta — landing pública T4A", () => {
  it("anónimo/error lleva a registro con copy aspiracional", () => {
    const anonymous = resolveAcademiaPublicCta("anonymous");
    assert.equal(anonymous.label, "Comenzar mi camino");
    assert.equal(anonymous.destination, "registro-cuenta");

    const error = resolveAcademiaPublicCta("error");
    assert.equal(error.label, "Comenzar mi camino");
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
    assert.equal(cta.label, "Comenzar mi camino");
  });

  it("no menciona regalo de 5 clases en landing", () => {
    assert.equal(resolveAcademiaPublicCta("anonymous").label.includes("5 clases"), false);
    assert.equal(resolveAcademiaPublicCta("error").label.includes("5 clases"), false);
  });
});
