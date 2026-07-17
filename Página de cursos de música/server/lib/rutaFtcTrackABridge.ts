/**
 * P0-03 — Puente Track A (Course / Module / PathNode) ↔ dominio Ruta/FTC.
 * Sin migraciones. StageType Prisma permanece legacy; nombres FTC son canónicos en dominio.
 */
import { StageType } from "@prisma/client";
import {
  FTC_SLOT_NAMES,
  type FtcSlot,
  type FtcSlotName,
  type MonthDepth,
  monthDepthMvp,
} from "./rutaFtcDomainH1.js";

/**
 * Estrategia de anidación H1 (documental + runtime helpers):
 *
 * | Dominio     | Track A hoy                         | Notas |
 * |-------------|-------------------------------------|-------|
 * | RutaAnual   | `Course` (slug ≈ activeRutaSlug)    | 1 course MVP |
 * | MesRuta     | **Pendiente** (no hay tabla Mes)    | Se deriva de monthIndex / order de Module o metadata futura |
 * | UnidadFTC   | `Module` (bloque de 5 etapas)       | Admin hoy publica Module×5 PathNode |
 * | TarjetaFTC  | `PathNode` + `StageType`            | order 1..5 |
 *
 * Decisión diferida (Codex/Juan): si Module = Mes o Module = Unidad.
 * Hasta seeds reales: dominio canónico vive en `rutaFtcDomainH1`; Track A sigue operando.
 */

/** Mapeo slot FTC canónico → StageType Prisma legacy (sin cambiar enum). */
export const FTC_SLOT_TO_STAGE_TYPE: Record<FtcSlot, StageType> = {
  1: StageType.FUNDAMENTO_UNO, // Fundamento
  2: StageType.FUNDAMENTO_DOS, // Forma (puente temporal de nombre)
  3: StageType.TECNICA, // Pulso
  4: StageType.PRACTICA, // Práctica
  5: StageType.TOCAR, // Crea/Toca
};

export const STAGE_TYPE_TO_FTC_SLOT: Partial<Record<StageType, FtcSlot>> = {
  [StageType.FUNDAMENTO_UNO]: 1,
  [StageType.FUNDAMENTO_DOS]: 2,
  [StageType.TECNICA]: 3,
  [StageType.PRACTICA]: 4,
  [StageType.TOCAR]: 5,
};

export function ftcNameForStageType(stageType: StageType): FtcSlotName | null {
  const slot = STAGE_TYPE_TO_FTC_SLOT[stageType];
  if (!slot) return null;
  return FTC_SLOT_NAMES[slot - 1];
}

export function stageTypeForFtcSlot(slot: FtcSlot): StageType {
  return FTC_SLOT_TO_STAGE_TYPE[slot];
}

/** Heurística: order de Module 1..12 ≈ MesRuta.monthIndex cuando haya 12 módulos. */
export function inferMonthIndexFromModuleOrder(order: number): number | null {
  if (!Number.isInteger(order) || order < 1 || order > 12) return null;
  return order;
}

export function inferDepthFromModuleOrder(order: number): MonthDepth | null {
  const month = inferMonthIndexFromModuleOrder(order);
  if (month == null) return null;
  return monthDepthMvp(month);
}

export type TrackABridgeNote = {
  domainEntity: "RutaAnual" | "MesRuta" | "UnidadFTC" | "TarjetaFTC";
  trackAEntity: "Course" | "Module" | "PathNode" | "(derived)";
  strategy: string;
};

export const TRACK_A_BRIDGE_NOTES: TrackABridgeNote[] = [
  {
    domainEntity: "RutaAnual",
    trackAEntity: "Course",
    strategy: "Course.slug ↔ RutaAnual.slug; version conceptual hasta campo dedicado",
  },
  {
    domainEntity: "MesRuta",
    trackAEntity: "(derived)",
    strategy:
      "Sin tabla Mes: monthIndex derivado de Module.order o de onboarding.currentMonth hasta seed",
  },
  {
    domainEntity: "UnidadFTC",
    trackAEntity: "Module",
    strategy: "Module con exactamente 5 PathNode = UnidadFTC publicable (V-U5)",
  },
  {
    domainEntity: "TarjetaFTC",
    trackAEntity: "PathNode",
    strategy:
      "PathNode.order/stageType ↔ slot FTC; labels canónicos Fundamento…Crea/Toca vía bridge",
  },
];
