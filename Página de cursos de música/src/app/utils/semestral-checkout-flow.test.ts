import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  applyDevActivationProxyHeaders,
  createDevActivationProxyConfigure,
  DEV_ACTIVATION_HEADER,
  isDevActivationKeyConfigured,
  resolveDevActivationKeyFromLoadedEnv,
  shouldInjectDevActivationHeader,
} from "../../../vite/devActivationProxy.ts";
import { shouldAcceptCheckoutSubmission } from "../pages/legacy/checkout-submission";
import { buildAuthModalSuccessPayload } from "./auth-modal-success";
import {
  getSemestralCheckoutPlan,
  isSemestralCheckoutCourse,
  SEMESTRAL_CHECKOUT_COURSE,
} from "./public-subscription-flow";

const root = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(root, "../App.tsx"), "utf8");
const checkoutSource = readFileSync(join(root, "../pages/legacy/CheckoutPage.tsx"), "utf8");
const authModalSource = readFileSync(join(root, "../components/music/AuthModal.tsx"), "utf8");
const activateSource = readFileSync(
  join(root, "../services/gmusic-api/activate-semestral.ts"),
  "utf8"
);
const viteConfigSource = readFileSync(join(root, "../../../vite.config.ts"), "utf8");
const configSource = readFileSync(join(root, "../services/gmusic-api/config.ts"), "utf8");

const VALID_KEY = "a".repeat(32);

function createProxyReq() {
  const headers = new Map<string, string>();
  return {
    setHeader(name: string, value: string) {
      headers.set(name.toLowerCase(), value);
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
  };
}

describe("devActivationProxy — inyección segura", () => {
  it("loadEnv entrega la clave al configurador cuando es válida", () => {
    const key = resolveDevActivationKeyFromLoadedEnv({
      GMUSIC_DEV_ACTIVATION_KEY: VALID_KEY,
    });
    assert.equal(key, VALID_KEY);

    const configure = createDevActivationProxyConfigure(key);
    assert.equal(typeof configure, "function");
  });

  it("solo POST activate/logout recibe header", () => {
    assert.equal(
      shouldInjectDevActivationHeader("/api/v1/dev/activate-semestral", "POST"),
      true
    );
    assert.equal(shouldInjectDevActivationHeader("/api/v1/dev/logout", "POST"), true);
    assert.equal(
      shouldInjectDevActivationHeader("/api/v1/dev/activate-semestral", "GET"),
      false
    );
    assert.equal(shouldInjectDevActivationHeader("/api/v1/dev/logout", "GET"), false);
  });

  it("/me/access nunca recibe header", () => {
    assert.equal(shouldInjectDevActivationHeader("/api/v1/me/access", "POST"), false);
    assert.equal(shouldInjectDevActivationHeader("/api/v1/me/access", "GET"), false);

    const proxyReq = createProxyReq();
    applyDevActivationProxyHeaders(
      proxyReq as never,
      "/api/v1/me/access",
      "POST",
      VALID_KEY
    );
    assert.equal(proxyReq.getHeader(DEV_ACTIVATION_HEADER), undefined);
  });

  it("no inyecta header si la clave es inválida o placeholder", () => {
    const proxyReq = createProxyReq();
    applyDevActivationProxyHeaders(
      proxyReq as never,
      "/api/v1/dev/activate-semestral",
      "POST",
      "change-me-in-local-env"
    );
    assert.equal(proxyReq.getHeader(DEV_ACTIVATION_HEADER), undefined);

    const missingKeyReq = createProxyReq();
    applyDevActivationProxyHeaders(
      missingKeyReq as never,
      "/api/v1/dev/logout",
      "POST",
      undefined
    );
    assert.equal(missingKeyReq.getHeader(DEV_ACTIVATION_HEADER), undefined);
  });

  it("inyecta header solo en POST válido con clave configurada", () => {
    const proxyReq = createProxyReq();
    applyDevActivationProxyHeaders(
      proxyReq as never,
      "/api/v1/dev/activate-semestral",
      "POST",
      VALID_KEY
    );
    assert.equal(proxyReq.getHeader(DEV_ACTIVATION_HEADER), VALID_KEY);
  });

  it("valida claves mínimas de 24 caracteres sin placeholder", () => {
    assert.equal(isDevActivationKeyConfigured(undefined), false);
    assert.equal(isDevActivationKeyConfigured("change-me-in-local-env"), false);
    assert.equal(isDevActivationKeyConfigured("short-dev-key"), false);
    assert.equal(isDevActivationKeyConfigured(VALID_KEY), true);
  });
});

describe("R3.3C — secreto fuera del frontend", () => {
  it("no expone GMUSIC_DEV_ACTIVATION_KEY en bundle React ni VITE_*", () => {
    assert.equal(viteConfigSource.includes("VITE_GMUSIC_DEV_ACTIVATION_KEY"), false);
    assert.equal(viteConfigSource.includes("loadEnv"), true);
    assert.equal(viteConfigSource.includes("resolveDevActivationKeyFromLoadedEnv"), true);
    assert.equal(activateSource.includes("GMUSIC_DEV_ACTIVATION_KEY"), false);
    assert.equal(activateSource.includes("import.meta.env"), false);
    assert.equal(appSource.includes("GMUSIC_DEV_ACTIVATION_KEY"), false);
    assert.equal(appSource.includes("VITE_GMUSIC_DEV_ACTIVATION_KEY"), false);
    assert.equal(checkoutSource.includes("GMUSIC_DEV_ACTIVATION_KEY"), false);
    assert.equal(configSource.includes("GMUSIC_DEV_ACTIVATION_KEY"), false);
    assert.equal(viteConfigSource.includes("define("), false);
  });
});

describe("Registro y checkout Semestral", () => {
  it("CTA Semestral landing navega a inscripcion-gate sin abrir AuthModal (Fase 3.5b)", () => {
    const fnMatch = appSource.match(/const handleSemestralPlanSelect = \(\) => \{([\s\S]*?)\};/);
    assert.ok(fnMatch, "handleSemestralPlanSelect debe existir en App.tsx");
    const body = fnMatch[1];
    assert.ok(
      body.includes('handlePageChange("inscripcion-gate")'),
      "debe navegar a inscripcion-gate vía handlePageChange"
    );
    assert.equal(body.includes('setCurrentPage("inscripcion-gate")'), false);
    assert.equal(body.includes("openAuthModal"), false);
    assert.equal(body.includes("setPendingSemestralCheckout(true)"), false);
  });

  it("funnel Semestral fuerza registro y no ofrece Login", () => {
    assert.equal(appSource.includes("registrationOnly={pendingSemestralCheckout}"), true);
    assert.equal(authModalSource.includes("registrationOnly"), true);
    assert.match(authModalSource, /!registrationOnly &&/);
    assert.equal(authModalSource.includes("buildAuthModalSuccessPayload"), true);
  });

  it("AuthModal no entrega contraseña en registro obligatorio", () => {
    const payload = buildAuthModalSuccessPayload({
      name: "Ana",
      email: "ana@gmusic.academy",
      phone: "",
    });
    assert.equal("password" in payload, false);
    assert.match(authModalSource, /registrationOnly[\s\S]*buildAuthModalSuccessPayload/);
    const registrationOnlyBlock = authModalSource.match(
      /if \(registrationOnly\) \{([\s\S]*?)\n    \}\n\n    \/\/ Simulación/
    )?.[1];
    assert.ok(registrationOnlyBlock);
    assert.equal(registrationOnlyBlock.includes("setTimeout"), false);
  });

  it("Checkout Semestral no muestra Mensual ni Curso Individual", () => {
    assert.equal(checkoutSource.includes("isSemestralCheckoutCourse"), true);
    assert.equal(checkoutSource.includes("getSemestralCheckoutPlan"), true);
    assert.match(checkoutSource, /isSemestralCheckout \?[\s\S]*Plan \{semestralPlan\.name\}/);
    assert.match(checkoutSource, /isSemestralCheckout \?[\s\S]*Duración: \{semestralPlan\.duration\}/);
    assert.match(checkoutSource, /\) : \([\s\S]*\["single", "subscription"\]/);
  });

  it("Checkout legacy conserva opciones single y subscription", () => {
    assert.match(checkoutSource, /\) : \([\s\S]*\["single", "subscription"\]/);
    assert.match(checkoutSource, /plans\.subscription/);
  });

  it("helper Semestral centraliza detección y plan", () => {
    assert.equal(isSemestralCheckoutCourse(SEMESTRAL_CHECKOUT_COURSE), true);
    assert.equal(getSemestralCheckoutPlan().duration, "6 meses");
    assert.equal(appSource.includes("isSemestralCheckoutCourse"), true);
  });
});

describe("App — checkout Semestral con activación real", () => {
  it("activa semestral, verifica acceso y navega con handlePageChange", () => {
    assert.equal(appSource.includes("activateSemestralWithAccessVerification"), true);
    assert.equal(appSource.includes("isSemestralCheckoutCourse"), true);
    assert.equal(appSource.includes('handlePageChange("mi-estudio")'), true);
    assert.equal(appSource.includes('setCurrentPage("mi-estudio")'), false);
    assert.equal(appSource.includes("setTimeout"), false);
  });

  it("no redirige a fundamento-free-lesson tras compra semestral", () => {
    assert.equal(appSource.includes('handlePageChange("fundamento-free-lesson")'), false);
    assert.equal(appSource.includes('setCurrentPage("fundamento-free-lesson")'), false);
    assert.match(appSource, /handleCheckoutSuccess[\s\S]*activateSemestralWithAccessVerification/);
  });

  it("no persiste contraseña, tarjeta ni clave en localStorage", () => {
    for (const source of [appSource, checkoutSource, activateSource, authModalSource]) {
      assert.equal(source.includes("localStorage"), false);
      assert.equal(source.includes("sessionStorage"), false);
    }
  });
});

describe("CheckoutPage — procesamiento y errores recuperables", () => {
  it("espera onSuccess async, bloquea doble envío y muestra error", () => {
    assert.equal(checkoutSource.includes("Promise<void>"), true);
    assert.equal(checkoutSource.includes("shouldAcceptCheckoutSubmission"), true);
    assert.equal(checkoutSource.includes("setCheckoutError"), true);
    assert.equal(checkoutSource.includes("setTimeout"), false);
    assert.match(checkoutSource, /await onSuccess\(\)/);
    assert.match(checkoutSource, /disabled=\{processing\}/);
    assert.equal(shouldAcceptCheckoutSubmission(true, false), false);
    assert.equal(shouldAcceptCheckoutSubmission(false, false), true);
  });
});
