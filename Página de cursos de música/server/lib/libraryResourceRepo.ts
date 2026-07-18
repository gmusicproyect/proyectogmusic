/**
 * PD-2 Persistencia Durable H1 — repositorio de LibraryResource.
 *
 * Solo lectura de recursos PUBLISHED (DRAFT/ARCHIVED nunca salen).
 * Premium sigue force-OFF en la capa de vista (P0-08); el repo expone accessTier real.
 * Seed controlado desde fixture → PD-4. NO se cablea a servicios en PD-2 (eso es PD-3).
 */
import {
  PublishStatus,
  type LibraryResourceType,
  type ResourceAccessTier,
} from "@prisma/client";
import type { DbClient } from "./practiceEventRepo.js";

export type LibraryResourceRowH1 = {
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
  mediaRef: string | null;
  tarjetaIds: string[];
  unitIds: string[];
};

export type LibraryResourceFilterH1 = {
  instrument?: string;
  suggestedMonth?: number;
  type?: LibraryResourceType;
};

type ResourceWithLinks = {
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
  mediaRef: string | null;
  links: { tarjetaId: string | null; unidadId: string | null }[];
};

function toRow(resource: ResourceWithLinks): LibraryResourceRowH1 {
  const tarjetaIds = new Set<string>();
  const unitIds = new Set<string>();
  for (const link of resource.links) {
    if (link.tarjetaId) tarjetaIds.add(link.tarjetaId);
    if (link.unidadId) unitIds.add(link.unidadId);
  }
  return {
    id: resource.id,
    titleInternal: resource.titleInternal,
    titlePublic: resource.titlePublic,
    instrument: resource.instrument,
    level: resource.level,
    suggestedMonth: resource.suggestedMonth,
    skillKey: resource.skillKey,
    type: resource.type,
    estimatedMinutes: resource.estimatedMinutes,
    accessTier: resource.accessTier,
    status: resource.status,
    mediaRef: resource.mediaRef,
    tarjetaIds: [...tarjetaIds],
    unitIds: [...unitIds],
  };
}

export async function listPublishedLibraryResources(
  db: DbClient,
  filter: LibraryResourceFilterH1 = {}
): Promise<LibraryResourceRowH1[]> {
  const resources = await db.libraryResource.findMany({
    where: {
      status: PublishStatus.PUBLISHED,
      ...(filter.instrument ? { instrument: filter.instrument } : {}),
      ...(filter.suggestedMonth !== undefined
        ? { suggestedMonth: filter.suggestedMonth }
        : {}),
      ...(filter.type ? { type: filter.type } : {}),
    },
    orderBy: [{ suggestedMonth: "asc" }, { id: "asc" }],
    include: { links: { select: { tarjetaId: true, unidadId: true } } },
  });
  return resources.map(toRow);
}

/** Detalle por id — solo PUBLISHED; null si no existe o no publicado. */
export async function getPublishedLibraryResourceById(
  db: DbClient,
  id: string
): Promise<LibraryResourceRowH1 | null> {
  const resource = await db.libraryResource.findFirst({
    where: { id, status: PublishStatus.PUBLISHED },
    include: { links: { select: { tarjetaId: true, unidadId: true } } },
  });
  return resource ? toRow(resource) : null;
}
