import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAuthModalSuccessPayload } from "./auth-modal-success";

describe("buildAuthModalSuccessPayload", () => {
  it("entrega solo datos públicos requeridos sin contraseña", () => {
    const payload = buildAuthModalSuccessPayload({
      name: "Ana Semestral",
      email: " ana@gmusic.academy ",
      phone: " +56912345678 ",
    });

    assert.deepEqual(payload, {
      name: "Ana Semestral",
      email: "ana@gmusic.academy",
      phone: "+56912345678",
    });
    assert.equal("password" in payload, false);
  });

  it("omite teléfono vacío y deriva nombre desde email", () => {
    const payload = buildAuthModalSuccessPayload({
      name: "  ",
      email: "estudiante@gmusic.academy",
      phone: "",
    });

    assert.equal(payload.name, "estudiante");
    assert.equal(payload.email, "estudiante@gmusic.academy");
    assert.equal(payload.phone, undefined);
  });
});
