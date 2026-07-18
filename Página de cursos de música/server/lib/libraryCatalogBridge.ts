/**
 * PD-4 — bridge de catálogo Biblioteca.
 * Flag OFF → fixture memory_fixture_h1 (P0-08). Flag ON → filas LibraryResource.
 *
 * En modo durable solo salen recursos PUBLISHED (el repo filtra DRAFT/ARCHIVED),
 * lo que mantiene el contrato: detalle de DRAFT/ARCHIVED → 404 amable.
 * Premium sigue force-OFF en la capa de vista (P0-08); el catálogo expone el
 * accessTier real para que la vista aplique el candado.
 */
import type { AccessGrantsH1 } from "./entitlementsH1.js";
import { isH1DurableEnabled } from "./h1DurableFlag.js";
import type { LearnerContextH1 } from "./learnerContextH1.js";
import { prisma } from "./prisma.js";
import {
  buildLibraryItemDetailH1,
  buildLibraryViewH1,
  buildMvpLibraryCatalogFixtureH1,
  type LibraryCatalogSourceH1,
  type LibraryItemViewH1,
  type LibraryViewH1,
  type RecursoBibliotecaH1,
  type ResourceAccessTierH1,
  type ResourceLevelH1,
  type ResourceTypeH1,
} from "./libraryH1.js";
import {
  listPublishedLibraryResources,
  type LibraryResourceRowH1,
} from "./libraryResourceRepo.js";

function rowToRecurso(row: LibraryResourceRowH1): RecursoBibliotecaH1 {
  return {
    id: row.id,
    titleInternal: row.titleInternal,
    titlePublic: row.titlePublic,
    instrument: "guitarra",
    level: row.level as ResourceLevelH1,
    suggestedMonth: row.suggestedMonth,
    skillKey: row.skillKey,
    type: row.type as ResourceTypeH1,
    estimatedMinutes: row.estimatedMinutes,
    accessTier: row.accessTier as ResourceAccessTierH1,
    status: row.status,
    // Sin hosting en esta fase: siempre placeholder null.
    mediaRef: null,
    tarjetaIds: [...row.tarjetaIds],
    unitIds: [...row.unitIds],
  };
}

/**
 * Devuelve el catálogo activo y su fuente.
 * Durable: solo PUBLISHED del instrumento (default guitarra).
 * Memoria: fixture completo (incluye DRAFT/ARCHIVED para el contrato de detalle).
 */
export async function resolveLibraryCatalogH1(
  instrument = "guitarra"
): Promise<{ catalog: RecursoBibliotecaH1[]; source: LibraryCatalogSourceH1 }> {
  if (!isH1DurableEnabled()) {
    return { catalog: buildMvpLibraryCatalogFixtureH1(), source: "memory_fixture_h1" };
  }
  const rows = await listPublishedLibraryResources(prisma, { instrument });
  return { catalog: rows.map(rowToRecurso), source: "db" };
}

/**
 * PD-4: arma LibraryViewH1 usando el catálogo del bridge (DB o fixture),
 * manteniendo el mismo contrato P0-08 (premium force-OFF, empty states, etc.).
 */
export async function buildLibraryViewH1Async(input: {
  context: LearnerContextH1;
  grants: Pick<AccessGrantsH1, "libraryTier">;
  filters?: {
    month?: number | null;
    type?: ResourceTypeH1 | null;
    skillKey?: string | null;
    level?: ResourceLevelH1 | null;
  };
}): Promise<LibraryViewH1> {
  const { catalog, source } = await resolveLibraryCatalogH1(
    input.context.instrument ?? "guitarra"
  );
  return buildLibraryViewH1({ ...input, catalog, catalogSource: source });
}

/** PD-4: detalle vía bridge (DB o fixture) manteniendo 404/403 amables. */
export async function buildLibraryItemDetailH1Async(input: {
  context: LearnerContextH1;
  grants: Pick<AccessGrantsH1, "libraryTier">;
  resourceId: string;
}): Promise<LibraryItemViewH1> {
  const { catalog } = await resolveLibraryCatalogH1(
    input.context.instrument ?? "guitarra"
  );
  return buildLibraryItemDetailH1({ ...input, catalog });
}
