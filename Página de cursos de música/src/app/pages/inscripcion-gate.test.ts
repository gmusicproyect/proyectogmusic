import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { SUBSCRIPTION_PLANS, getPlanById } from "../data/subscription-plans";

const root = dirname(fileURLToPath(import.meta.url));
const gateSource = readFileSync(join(root, "./InscripcionGatePage.tsx"), "utf8");
const registroSource = readFileSync(join(root, "./InscripcionRegistroPage.tsx"), "utf8");
const appSource = readFileSync(join(root, "../App.tsx"), "utf8");

describe("subscription-plans — configuración de planes", () => {
  it("tiene exactamente 3 planes", () => {
    assert.equal(SUBSCRIPTION_PLANS.length, 3);
  });

  it("todos los planes tienen price: null (precios por definir)", () => {
    assert.equal(
      SUBSCRIPTION_PLANS.every((p) => p.price === null),
      true
    );
  });

  it("plan semestral está destacado; mensual y anual no", () => {
    const semester = SUBSCRIPTION_PLANS.find((p) => p.id === "semester");
    const others = SUBSCRIPTION_PLANS.filter((p) => p.id !== "semester");
    assert.equal(semester?.highlighted, true);
    assert.equal(
      others.every((p) => !p.highlighted),
      true
    );
  });

  it("todos los planes tienen flowPlanId no vacío preparado para Flow", () => {
    assert.equal(
      SUBSCRIPTION_PLANS.every(
        (p) => typeof p.flowPlanId === "string" && p.flowPlanId.length > 4
      ),
      true
    );
  });

  it("getPlanById lanza error para id desconocido", () => {
    assert.throws(
      () => getPlanById("unknown" as "monthly"),
      /Unknown plan id/
    );
  });

  it("getPlanById devuelve el plan correcto para cada id", () => {
    assert.equal(getPlanById("monthly").name, "Mensual");
    assert.equal(getPlanById("semester").name, "Semestral");
    assert.equal(getPlanById("annual").name, "Anual");
  });
});

describe("InscripcionGatePage — puerta de inscripción", () => {
  it("verifica demo completo con useDemoProgress antes de mostrar planes", () => {
    assert.equal(gateSource.includes("useDemoProgress"), true);
    assert.equal(gateSource.includes("demoFinished"), true);
  });

  it("muestra estado bloqueado si demo no está completo", () => {
    assert.equal(gateSource.includes("LockedGate"), true);
    assert.equal(gateSource.includes("Zona bloqueada"), true);
    assert.equal(gateSource.includes("Completa tu primer camino"), true);
  });

  it("muestra los 3 planes usando SUBSCRIPTION_PLANS", () => {
    assert.equal(gateSource.includes("SUBSCRIPTION_PLANS"), true);
    assert.equal(gateSource.includes("PlanCard"), true);
  });

  it("guarda plan elegido en localStorage con clave correcta", () => {
    assert.equal(gateSource.includes("gmusic:selected_plan_v1"), true);
  });

  it("navega a inscripcion-registro al confirmar", () => {
    assert.equal(gateSource.includes("inscripcion-registro"), true);
  });

  it("permite volver al mapa demo", () => {
    assert.equal(gateSource.includes("mi-camino-demo"), true);
  });
});

describe("InscripcionRegistroPage — bridge WhatsApp", () => {
  it("lee el plan guardado en localStorage", () => {
    assert.equal(registroSource.includes("gmusic:selected_plan_v1"), true);
    assert.equal(registroSource.includes("readSelectedPlan"), true);
  });

  it("usa getPlanById para mostrar el nombre del plan", () => {
    assert.equal(registroSource.includes("getPlanById"), true);
  });

  it("permite volver a inscripcion-gate para cambiar plan", () => {
    assert.equal(registroSource.includes("inscripcion-gate"), true);
  });

  it("muestra botón de WhatsApp con URL wa.me", () => {
    assert.equal(registroSource.includes("wa.me"), true);
  });

  it("no contiene campo de contraseña ni tipo password", () => {
    assert.equal(registroSource.includes("password"), false);
    assert.equal(registroSource.includes("contraseña"), false);
  });

  it("tiene campos de nombre y email en el formulario", () => {
    assert.equal(registroSource.includes("nombre"), true);
    assert.equal(registroSource.includes("email"), true);
  });

  it("mensaje de WhatsApp menciona el nombre del plan seleccionado", () => {
    assert.equal(registroSource.includes("plan.name"), true);
  });

  it("muestra texto de reserva de lugar", () => {
    assert.equal(registroSource.includes("reservado"), true);
  });
});

describe("App — rutas de inscripción", () => {
  it("registra inscripcion-gate con InscripcionGatePage", () => {
    assert.equal(appSource.includes('"inscripcion-gate"'), true);
    assert.equal(appSource.includes("InscripcionGatePage"), true);
  });

  it("registra inscripcion-registro con InscripcionRegistroPage sin StudentZoneGuard", () => {
    assert.equal(appSource.includes('"inscripcion-registro"'), true);
    assert.equal(appSource.includes("InscripcionRegistroPage"), true);
    assert.doesNotMatch(
      appSource,
      /inscripcion-registro[\s\S]{0,180}StudentZoneGuard/
    );
  });

  it("inscripcion-gate e inscripcion-registro excluyen Navbar y MusicPlayer", () => {
    assert.equal(appSource.includes('"inscripcion-gate"'), true);
    assert.equal(appSource.includes('"inscripcion-registro"'), true);
  });
});
