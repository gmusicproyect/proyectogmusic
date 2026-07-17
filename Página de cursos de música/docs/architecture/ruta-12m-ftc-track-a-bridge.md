# P0-03 — Puente Track A ↔ Dominio Ruta 12m / FTC (H1)

| Campo | Valor |
|-------|--------|
| **Fase** | P0-03 |
| **Schema / migraciones** | **No** |
| **Seeds DB / JSON** | **No** (T-NOSEED) |
| **H1** | Progreso futuro con `profileId = userId` |

## Nombres FTC canónicos (fijos)

1. Fundamento
2. Forma
3. Pulso
4. Práctica
5. Crea/Toca

## Mapeo conceptual

| Dominio | Track A actual | Estrategia H1 |
|---------|----------------|---------------|
| **RutaAnual** | `Course` | `slug` ≈ `guitarra-fundamentos` |
| **MesRuta** | *(sin tabla)* | `monthIndex` 1–12; depth MVP M1–M2=`deep`, M3–12=`summary` |
| **UnidadFTC** | `Module` | Bloque publicable = exactamente 5 `PathNode` (V-U5) |
| **TarjetaFTC** | `PathNode` + `StageType` | Slot 1..5; nombres dominio ≠ labels legacy Prisma |

## StageType Prisma → FTC (puente temporal, sin cambiar enum)

| Slot | Nombre FTC | `StageType` legacy |
|------|------------|--------------------|
| 1 | Fundamento | `FUNDAMENTO_UNO` |
| 2 | Forma | `FUNDAMENTO_DOS` |
| 3 | Pulso | `TECNICA` |
| 4 | Práctica | `PRACTICA` |
| 5 | Crea/Toca | `TOCAR` |

Renombrar el enum Prisma queda **fuera** de P0-03 (requeriría schema + mandato).

## IDs de dominio (reemplazan stubs `m{N}-u1*`)

```text
ruta:guitarra-fundamentos:v1
ruta:guitarra-fundamentos:v1/m01
ruta:guitarra-fundamentos:v1/m01/u01
ruta:guitarra-fundamentos:v1/m01/u01/c1   → Fundamento
```

Código: `server/lib/rutaFtcDomainH1.ts`, `server/lib/rutaFtcTrackABridge.ts`.

## Pendiente (no P0-03)

- Decidir si `Module` modela **Mes** o **Unidad** al hacer seeds reales
- Seeds DB (solo con mandato Juan)
- UI Mi Camino / wizard (D-GOV + P0-04)

*P0-03 bridge · H1 · 2026-07-16*
