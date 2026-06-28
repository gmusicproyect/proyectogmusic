import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatAuthFormError,
  GmusicApiError,
  toFetchGmusicError,
} from "./client";

describe("toFetchGmusicError", () => {
  it("preserva GmusicApiError del backend", () => {
    const original = new GmusicApiError("Correo ya registrado.", 409, "EMAIL_TAKEN");
    assert.equal(toFetchGmusicError(original), original);
  });

  it("traduce TypeError de fetch a mensaje de red/CORS", () => {
    const error = toFetchGmusicError(new TypeError("Failed to fetch"));
    assert.equal(error.code, "NETWORK_ERROR");
    assert.match(error.message, /CORS|conectar/i);
  });
});

describe("formatAuthFormError", () => {
  it("usa el mensaje del backend cuando es GmusicApiError", () => {
    assert.equal(
      formatAuthFormError(
        new GmusicApiError("Correo inválido.", 400, "VALIDATION_ERROR"),
        "fallback"
      ),
      "Correo inválido."
    );
  });

  it("usa fallback para errores desconocidos", () => {
    assert.equal(formatAuthFormError({}, "No pudimos crear tu cuenta."), "No pudimos crear tu cuenta.");
  });
});
