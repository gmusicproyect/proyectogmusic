/**
 * PD-4 Persistencia Durable H1 — seed controlado del catálogo Biblioteca.
 *
 * Migra el fixture `memory_fixture_h1` (P0-08) a filas reales
 * LibraryResource (+ LibraryResourceLink) en DB local/Docker.
 *
 * Reglas del mandato PD-4:
 * - Solo local/Docker; sin prod, sin push (guard en el script CLI).
 * - Sin multimedia real: mediaRef siempre null (placeholder).
 * - Sin Premium real: el tier premium se persiste como metadato, pero la
 *   capa de vista (P0-08) sigue force-OFF (locked). No abre acceso.
 * - Idempotente: re-ejecutar no duplica ni cambia el resultado.
 * - Fuente única del catálogo: `buildMvpLibraryCatalogFixtureH1()`.
 */
import {
  type LibraryResourceType,
  type ResourceAccessTier,
  PublishStatus,
} from "@prisma/client";
import type { DbClient } from "./practiceEventRepo.js";
import {
  buildMvpLibraryCatalogFixtureH1,
  type RecursoBibliotecaH1,
} from "./libraryH1.js";

export type LibraryResourceSeedRow = {
  id: string;
  titleInternal: string;
  titlePublic: string | null;
  instrument: string;
  level: string;
  suggestedMonth: number | null;
  skillKey: string | null;
  type: LibraryResourceType;
  estimatedMinutes: number;
  accessTier: ResourceAccessTier;
  status: PublishStatus;
  /** Sin upload/hosting en esta fase — siempre null. */
  mediaRef: null;
  links: { tarjetaId: string | null; unidadId: string | null; monthIndex: number | null }[];
};

/**
 * Mapea el fixture curado a filas de seed. Función pura (sin DB) para poder
 * testear el contrato de migración sin levantar Postgres.
 *
 * Cada tarjetaId y cada unidadId se persiste como un LibraryResourceLink
 * independiente (tarjeta XOR unidad), de modo que `libraryResourceRepo.toRow`
 * reconstruya exactamente los sets `tarjetaIds`/`unitIds` del contrato P0-08.
 */
export function libraryCatalogSeedRows(
  catalog: RecursoBibliotecaH1[] = buildMvpLibraryCatalogFixtureH1()
): LibraryResourceSeedRow[] {
  return catalog.map((resource) => {
    const monthIndex = resource.suggestedMonth;
    const links: LibraryResourceSeedRow["links"] = [
      ...resource.tarjetaIds.map((tarjetaId) => ({
        tarjetaId,
        unidadId: null,
        monthIndex,
      })),
      ...resource.unitIds.map((unidadId) => ({
        tarjetaId: null,
        unidadId,
        monthIndex,
      })),
    ];

    return {
      id: resource.id,
      titleInternal: resource.titleInternal,
      titlePublic: resource.titlePublic,
      instrument: resource.instrument,
      level: resource.level,
      suggestedMonth: resource.suggestedMonth,
      skillKey: resource.skillKey,
      type: resource.type as LibraryResourceType,
      estimatedMinutes: resource.estimatedMinutes,
      accessTier: resource.accessTier as ResourceAccessTier,
      status: resource.status as PublishStatus,
      mediaRef: null,
      links,
    };
  });
}

export type LibrarySeedResult = {
  resourcesUpserted: number;
  linksWritten: number;
  statusBreakdown: Record<PublishStatus, number>;
};

/**
 * Seed idempotente: upsert por id + reemplazo total de links por recurso.
 * Re-ejecutar deja la DB en el mismo estado (mismo count, mismos datos).
 */
export async function seedLibraryCatalogH1(
  db: DbClient,
  rows: LibraryResourceSeedRow[] = libraryCatalogSeedRows()
): Promise<LibrarySeedResult> {
  const statusBreakdown: Record<PublishStatus, number> = {
    [PublishStatus.DRAFT]: 0,
    [PublishStatus.PUBLISHED]: 0,
    [PublishStatus.ARCHIVED]: 0,
  };
  let linksWritten = 0;

  for (const row of rows) {
    const data = {
      titleInternal: row.titleInternal,
      titlePublic: row.titlePublic,
      instrument: row.instrument,
      level: row.level,
      suggestedMonth: row.suggestedMonth,
      skillKey: row.skillKey,
      type: row.type,
      estimatedMinutes: row.estimatedMinutes,
      accessTier: row.accessTier,
      status: row.status,
      mediaRef: row.mediaRef,
    };

    await db.libraryResource.upsert({
      where: { id: row.id },
      update: data,
      create: { id: row.id, ...data },
    });

    // Reemplazo total de links → idempotencia (sin duplicar).
    await db.libraryResourceLink.deleteMany({ where: { resourceId: row.id } });
    if (row.links.length > 0) {
      await db.libraryResourceLink.createMany({
        data: row.links.map((link) => ({
          resourceId: row.id,
          tarjetaId: link.tarjetaId,
          unidadId: link.unidadId,
          monthIndex: link.monthIndex,
        })),
      });
      linksWritten += row.links.length;
    }

    statusBreakdown[row.status] += 1;
  }

  return {
    resourcesUpserted: rows.length,
    linksWritten,
    statusBreakdown,
  };
}
