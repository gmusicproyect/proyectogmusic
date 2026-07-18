/**
 * PD-4 — lógica pura del seed de Biblioteca (sin DB).
 * Verifica el contrato de migración fixture → filas antes de tocar Postgres.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMvpLibraryCatalogFixtureH1 } from "../lib/libraryH1.js";
import { libraryCatalogSeedRows } from "../lib/librarySeedH1.js";

describe("PD-4 librarySeedH1 (mapeo puro fixture → filas)", () => {
  it("T-PD4-01: cubre todos los recursos del fixture (misma cardinalidad e ids)", () => {
    const fixture = buildMvpLibraryCatalogFixtureH1();
    const rows = libraryCatalogSeedRows();
    assert.equal(rows.length, fixture.length);
    assert.deepEqual(
      rows.map((r) => r.id).sort(),
      fixture.map((r) => r.id).sort()
    );
  });

  it("T-PD4-02: mapeo idempotente (misma entrada → misma salida)", () => {
    assert.deepEqual(libraryCatalogSeedRows(), libraryCatalogSeedRows());
  });

  it("T-PD4-03: mediaRef siempre null (sin multimedia real en esta fase)", () => {
    for (const row of libraryCatalogSeedRows()) {
      assert.equal(row.mediaRef, null);
    }
  });

  it("T-PD4-04: preserva enums accessTier/type/status del fixture", () => {
    const fixture = buildMvpLibraryCatalogFixtureH1();
    const rowsById = new Map(libraryCatalogSeedRows().map((r) => [r.id, r]));
    for (const resource of fixture) {
      const row = rowsById.get(resource.id);
      assert.ok(row);
      assert.equal(row?.type, resource.type);
      assert.equal(row?.accessTier, resource.accessTier);
      assert.equal(row?.status, resource.status);
      assert.equal(row?.suggestedMonth, resource.suggestedMonth);
    }
  });

  it("T-PD4-05: persiste DRAFT y ARCHIVED (el filtro es de lectura, no de seed)", () => {
    const rows = libraryCatalogSeedRows();
    assert.ok(rows.some((r) => r.status === "DRAFT"));
    assert.ok(rows.some((r) => r.status === "ARCHIVED"));
    assert.ok(rows.some((r) => r.status === "PUBLISHED"));
  });

  it("T-PD4-06: links reconstruyen tarjetaIds/unitIds (tarjeta XOR unidad)", () => {
    const fixture = buildMvpLibraryCatalogFixtureH1();
    const rowsById = new Map(libraryCatalogSeedRows().map((r) => [r.id, r]));
    for (const resource of fixture) {
      const row = rowsById.get(resource.id);
      assert.ok(row);
      const tarjetaIds = row!.links
        .filter((l) => l.tarjetaId !== null)
        .map((l) => l.tarjetaId);
      const unitIds = row!.links
        .filter((l) => l.unidadId !== null)
        .map((l) => l.unidadId);
      assert.deepEqual(tarjetaIds.sort(), [...resource.tarjetaIds].sort());
      assert.deepEqual(unitIds.sort(), [...resource.unitIds].sort());
      // Cada link es tarjeta XOR unidad (nunca ambos, nunca ninguno).
      for (const link of row!.links) {
        assert.equal(
          (link.tarjetaId === null) !== (link.unidadId === null),
          true
        );
      }
    }
  });

  it("T-PD4-07: premium se persiste como metadato (no abre acceso; eso lo decide la vista)", () => {
    const rows = libraryCatalogSeedRows();
    assert.ok(rows.some((r) => r.accessTier === "premium"));
    assert.ok(rows.some((r) => r.accessTier === "basic"));
  });
});
