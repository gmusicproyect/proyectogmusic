import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRegisterBody } from "../lib/parseAuthBody.js";

describe("parseRegisterBody", () => {
  it("acepta registro sin celular", () => {
    const parsed = parseRegisterBody({
      name: "Juan",
      email: "Juan@Example.com",
      password: "password1",
    });
    assert.equal(parsed.name, "Juan");
    assert.equal(parsed.email, "juan@example.com");
    assert.equal(parsed.phone, null);
  });

  it("normaliza celular cuando se envía", () => {
    const parsed = parseRegisterBody({
      name: "Juan",
      email: "juan@example.com",
      phone: "+56 9 5342 9676",
      password: "password1",
    });
    assert.equal(parsed.phone, "+56953429676");
  });

  it("acepta correo con + en la parte local", () => {
    const parsed = parseRegisterBody({
      name: "Juan",
      email: "qa+tag@example.com",
      password: "password1",
    });
    assert.equal(parsed.email, "qa+tag@example.com");
  });
});
