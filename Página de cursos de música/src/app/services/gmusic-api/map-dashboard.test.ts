import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampPercent,
  derivePhaseLabel,
  deriveWeeklyChest,
  mapDashboardToViewModel,
  nonNegative,
} from "./map-dashboard";
import type { DashboardResponse } from "./types";

const BASE_RESPONSE: DashboardResponse = {
  user: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Carlos",
    timezone: "America/Santiago",
    levelLabel: "Fundamento",
    pathLabel: "Mes 2 · Nodo 3 de 6",
  },
  streak: {
    currentDays: 4,
    activeToday: true,
  },
  xp: {
    total: 1240,
    earnedThisWeek: 180,
  },
  moduleProgress: {
    moduleId: "mod-1",
    moduleTitle: "Fundamentos",
    percentCompleted: 38,
    currentNodeTitle: "Tu guitarra y postura",
    completedNodes: 2,
    totalNodes: 6,
  },
  nextPractice: {
    nodeId: "node-1",
    title: "Tu primer rasgueo en 4/4",
    typeLabel: "Práctica guiada · 5 min",
    description: "Trabaja el patrón base con calma y precisión.",
  },
};

describe("mapDashboardToViewModel", () => {
  it("mapea la respuesta del dashboard a props visuales", () => {
    const viewModel = mapDashboardToViewModel(BASE_RESPONSE);

    assert.equal(viewModel.userName, "Carlos");
    assert.equal(viewModel.streakLabel, "4 días");
    assert.equal(viewModel.streakDays, 4);
    assert.equal(viewModel.streakActiveToday, true);
    assert.equal(viewModel.xpTotal, 1240);
    assert.equal(viewModel.weeklyGain, 180);
    assert.equal(viewModel.progressPercentLabel, "38%");
    assert.equal(viewModel.progressPercent, 38);
    assert.equal(viewModel.currentNodeTitle, "Tu guitarra y postura");
    assert.equal(viewModel.phaseLabel, "Fundamento · Mes 2");
    assert.equal(viewModel.nextPractice?.title, "Tu primer rasgueo en 4/4");
    assert.equal(viewModel.pathComplete, false);
    assert.deepEqual(viewModel.weeklyChest, {
      exercisesUntilChest: 20,
      xpReward: 50,
      isReady: false,
    });
  });

  it("marca pathComplete cuando nextPractice es null", () => {
    const viewModel = mapDashboardToViewModel({
      ...BASE_RESPONSE,
      nextPractice: null,
    });

    assert.equal(viewModel.nextPractice, null);
    assert.equal(viewModel.pathComplete, true);
  });

  it("normaliza números fuera de rango", () => {
    const viewModel = mapDashboardToViewModel({
      ...BASE_RESPONSE,
      streak: { currentDays: -3, activeToday: false },
      xp: { total: -50, earnedThisWeek: -10 },
      moduleProgress: {
        ...BASE_RESPONSE.moduleProgress,
        percentCompleted: 140,
      },
    });

    assert.equal(viewModel.streakLabel, "0 días");
    assert.equal(viewModel.xpTotal, 0);
    assert.equal(viewModel.weeklyGain, 0);
    assert.equal(viewModel.progressPercent, 100);
    assert.equal(viewModel.progressPercentLabel, "100%");
  });
});

describe("deriveWeeklyChest", () => {
  it("marca isReady false y cuenta regresiva cuando falta XP semanal", () => {
    assert.deepEqual(deriveWeeklyChest(180), {
      exercisesUntilChest: 20,
      xpReward: 50,
      isReady: false,
    });
  });

  it("marca isReady true cuando la meta semanal está cumplida", () => {
    assert.deepEqual(deriveWeeklyChest(200), {
      exercisesUntilChest: null,
      xpReward: 50,
      isReady: true,
    });
    assert.deepEqual(deriveWeeklyChest(250), {
      exercisesUntilChest: null,
      xpReward: 50,
      isReady: true,
    });
  });

  it("normaliza weeklyGain negativo a meta completa", () => {
    assert.deepEqual(deriveWeeklyChest(-10), {
      exercisesUntilChest: 200,
      xpReward: 50,
      isReady: false,
    });
  });
});

describe("derivePhaseLabel", () => {
  it("extrae el mes desde pathLabel", () => {
    assert.equal(derivePhaseLabel("Fundamento", "Mes 1 · Nodo 2 de 5"), "Fundamento · Mes 1");
  });
});

describe("normalización numérica", () => {
  it("clampPercent limita al rango 0–100", () => {
    assert.equal(clampPercent(-5), 0);
    assert.equal(clampPercent(50), 50);
    assert.equal(clampPercent(150), 100);
  });

  it("nonNegative convierte negativos a cero", () => {
    assert.equal(nonNegative(-1), 0);
    assert.equal(nonNegative(42), 42);
  });

  it("clampPercent devuelve 0 para NaN, Infinity e -Infinity", () => {
    assert.equal(clampPercent(Number.NaN), 0);
    assert.equal(clampPercent(Number.POSITIVE_INFINITY), 0);
    assert.equal(clampPercent(Number.NEGATIVE_INFINITY), 0);
  });

  it("nonNegative devuelve 0 para NaN, Infinity e -Infinity", () => {
    assert.equal(nonNegative(Number.NaN), 0);
    assert.equal(nonNegative(Number.POSITIVE_INFINITY), 0);
    assert.equal(nonNegative(Number.NEGATIVE_INFINITY), 0);
  });
});

describe("seguridad del mapper", () => {
  it("no expone secureAnswer ni correctOptionId en el view model", () => {
    const polluted = {
      ...BASE_RESPONSE,
      nextPractice: {
        ...BASE_RESPONSE.nextPractice!,
        secureAnswer: { correctOptionId: "c" },
        correctOptionId: "c",
        explanationAfterAnswer: "secreto",
      },
    } as DashboardResponse & {
      nextPractice: DashboardResponse["nextPractice"] & Record<string, unknown>;
    };

    const viewModel = mapDashboardToViewModel(polluted);
    const serialized = JSON.stringify(viewModel);

    assert.equal(serialized.includes("secureAnswer"), false);
    assert.equal(serialized.includes("correctOptionId"), false);
    assert.equal(serialized.includes("explanationAfterAnswer"), false);
  });
});

describe("GmusicApiError retry contract", () => {
  it("expone mensaje utilizable para UI de reintento", async () => {
    const { GmusicApiError } = await import("./client");

    const error = new GmusicApiError("Servicio no disponible", 503, "INTERNAL_ERROR");
    assert.equal(error.message, "Servicio no disponible");
    assert.equal(error.status, 503);
  });
});
