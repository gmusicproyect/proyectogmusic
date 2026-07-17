import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDateInTimezone,
  getIsoWeekStartDateInTimezone,
  getYesterdayDateInTimezone,
  subtractCalendarDays,
} from "../lib/timezone.js";

describe("subtractCalendarDays", () => {
  it("resta días calendario sin usar duración UTC del día", () => {
    assert.equal(subtractCalendarDays("2024-03-10", 1), "2024-03-09");
    assert.equal(subtractCalendarDays("2024-03-01", 1), "2024-02-29");
  });
});

describe("getYesterdayDateInTimezone", () => {
  const timezone = "America/New_York";

  it("usa día calendario local en día de 23 horas (spring forward)", () => {
    const from = new Date("2024-03-11T04:00:00.000Z");

    assert.equal(formatDateInTimezone(from, timezone), "2024-03-11");
    assert.equal(getYesterdayDateInTimezone(timezone, from), "2024-03-10");

    const minus24Hours = formatDateInTimezone(
      new Date(from.getTime() - 24 * 60 * 60 * 1000),
      timezone
    );
    assert.equal(minus24Hours, "2024-03-09");
    assert.notEqual(minus24Hours, getYesterdayDateInTimezone(timezone, from));
  });

  it("usa día calendario local en día de 25 horas (fall back)", () => {
    const duringLongDay = new Date("2024-11-03T12:00:00.000Z");
    assert.equal(formatDateInTimezone(duringLongDay, timezone), "2024-11-03");
    assert.equal(getYesterdayDateInTimezone(timezone, duringLongDay), "2024-11-02");

    const afterLongDay = new Date("2024-11-04T05:00:00.000Z");
    assert.equal(formatDateInTimezone(afterLongDay, timezone), "2024-11-04");
    assert.equal(getYesterdayDateInTimezone(timezone, afterLongDay), "2024-11-03");
    assert.equal(subtractCalendarDays("2024-11-04", 1), "2024-11-03");
  });
});

describe("getIsoWeekStartDateInTimezone", () => {
  it("devuelve lunes de la semana en America/Santiago", () => {
    // Jueves 2026-07-16 Chile → lunes 2026-07-13
    const thursday = new Date("2026-07-16T18:00:00.000Z");
    assert.equal(
      getIsoWeekStartDateInTimezone("America/Santiago", thursday),
      "2026-07-13"
    );
  });
});
