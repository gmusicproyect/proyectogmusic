import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  PLAN_TIERS,
  BILLING_PERIODS,
  PRICE_TABLE,
  parsePlanId,
  isValidPlanId,
  getPlanTier,
} from "../data/subscription-plans";
import type { PlanTier, BillingPeriod } from "../data/subscription-plans";

const root = dirname(fileURLToPath(import.meta.url));
const gateSource = readFileSync(join(root, "./InscripcionGatePage.tsx"), "utf8");
const registroSource = readFileSync(join(root, "./InscripcionRegistroPage.tsx"), "utf8");
const appSource = readFileSync(join(root, "../App.tsx"), "utf8");

describe("subscription-plans — configuración de planes", () => {
  it("tiene exactamente 3 tiers de plan", () => {
    assert.equal(PLAN_TIERS.length, 3);
  });

  it("tiene exactamente 3 períodos de facturación", () => {
    assert.equal(BILLING_PERIODS.length, 3);
  });

  it("plan Plus está destacado; Básico y Familiar no", () => {
    const plus = PLAN_TIERS.find((t) => t.id === "plus");
    const others = PLAN_TIERS.filter((t) => t.id !== "plus");
    assert.equal(plus?.highlighted, true);
    assert.equal(others.every((t) => !t.highlighted), true);
  });

  it("cada tier tiene 3 flowPlanIds no vacíos (9 combinaciones totales)", () => {
    const periods: BillingPeriod[] = ["monthly", "semester", "annual"];
    assert.equal(
      PLAN_TIERS.every((t) =>
        periods.every((p) => typeof t.flowPlanIds[p] === "string" && t.flowPlanIds[p].length > 4)
      ),
      true
    );
  });

  it("PRICE_TABLE tiene precios positivos para todas las combinaciones", () => {
    const tiers: PlanTier[] = ["basico", "plus", "familiar"];
    const periods: BillingPeriod[] = ["monthly", "semester", "annual"];
    assert.equal(
      tiers.every((t) => periods.every((p) => PRICE_TABLE[t][p].totalPrice > 0)),
      true
    );
  });

  it("parsePlanId divide correctamente", () => {
    assert.deepEqual(parsePlanId("plus-semester"), { tier: "plus", period: "semester" });
    assert.deepEqual(parsePlanId("basico-monthly"), { tier: "basico", period: "monthly" });
    assert.deepEqual(parsePlanId("familiar-annual"), { tier: "familiar", period: "annual" });
  });

  it("isValidPlanId valida las 9 combinaciones y rechaza inválidos", () => {
    assert.equal(isValidPlanId("plus-monthly"), true);
    assert.equal(isValidPlanId("familiar-annual"), true);
    assert.equal(isValidPlanId("monthly"), false);
    assert.equal(isValidPlanId("unknown"), false);
  });

  it("getPlanTier lanza error para tier desconocido", () => {
    assert.throws(() => getPlanTier("unknown" as PlanTier), /Unknown plan tier/);
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

  it("muestra los 3 tiers usando PLAN_TIERS", () => {
    assert.equal(gateSource.includes("PLAN_TIERS"), true);
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
    assert.equal(registroSource.includes("plus-semester"), true);
  });

  it("usa helpers del modelo tier+periodo para mostrar el plan", () => {
    assert.equal(registroSource.includes("parsePlanId"), true);
    assert.equal(registroSource.includes("getPlanTier"), true);
    assert.equal(registroSource.includes("getBillingPeriod"), true);
    assert.equal(registroSource.includes("getPlanPrice"), true);
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

  it("vincula session_id del quiz con email vía API antes de WhatsApp", () => {
    assert.equal(registroSource.includes("getOrCreateOnboardingSessionId"), true);
    assert.equal(registroSource.includes("linkOnboardingLead"), true);
    assert.match(registroSource, /onboarding\/link-lead|link-onboarding-lead/);
  });

  it("mensaje de WhatsApp menciona el nombre del tier y período seleccionados", () => {
    assert.equal(registroSource.includes("tier.name"), true);
    assert.equal(registroSource.includes("period.label"), true);
  });

  it("muestra texto de solicitud de inscripción sin promesa de reserva", () => {
    assert.equal(registroSource.includes("Aún no pagas aquí"), true);
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
