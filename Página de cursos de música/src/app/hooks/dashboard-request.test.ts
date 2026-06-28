import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyDashboardOutcome,
  DashboardRequestManager,
  outcomeToState,
} from "./dashboard-request";

describe("outcomeToState", () => {
  it("solicitud abortada no produce error visual", () => {
    assert.equal(outcomeToState({ type: "aborted" }), null);
  });

  it("retry exitoso reemplaza estado error", () => {
    const errorState = outcomeToState({
      type: "error",
      message: "Servicio no disponible",
    });
    assert.deepEqual(errorState, {
      status: "error",
      message: "Servicio no disponible",
    });

    const successState = outcomeToState({
      type: "success",
      viewModel: {
        userName: "Carlos",
        streakLabel: "2 días",
        streakDays: 2,
        streakActiveToday: true,
        xpTotal: 100,
        weeklyGain: 20,
        consistencyStatus: "En ritmo",
        progressPercentLabel: "10%",
        progressPercent: 10,
        currentNodeTitle: "Nodo A",
        phaseLabel: "Fundamento · Mes 1",
        nextPractice: null,
        pathComplete: true,
      },
    });
    assert.equal(successState?.status, "success");
  });
});

describe("applyDashboardOutcome", () => {
  it("respuesta antigua no sobrescribe retry exitoso", () => {
    const manager = new DashboardRequestManager();
    const { generation: staleGeneration } = manager.begin();
    manager.begin();

    const applied = applyDashboardOutcome(staleGeneration, manager, {
      type: "success",
      viewModel: {
        userName: "Obsoleto",
        streakLabel: "0 días",
        streakDays: 0,
        streakActiveToday: false,
        xpTotal: 0,
        weeklyGain: 0,
        consistencyStatus: "Retoma hoy",
        progressPercentLabel: "0%",
        progressPercent: 0,
        currentNodeTitle: "Viejo",
        phaseLabel: "Fundamento · Mes 1",
        nextPractice: null,
        pathComplete: true,
      },
    });

    assert.equal(applied, null);
  });
});
