# 10 — Preguntas abiertas

> Acumulado fases 01–09 · Fecha: 2026-07-13  
> Marcar como resueltas cuando Juan/Opus decidan.

---

## Producto / alcance

| ID | Pregunta | Por qué importa |
|----|----------|-----------------|
| Q-P1 | ¿El ERP académico es un producto separado o un módulo futuro de Gmusic? | Evita mezclar Track A funnel con MIS |
| Q-P2 | ¿MVP debe incluir Scheduling/Attendance o solo Enrollment+Billing? | Orden del roadmap |
| Q-P3 | ¿Multi-sede / multi-organización desde el día 1? | Tenant model |
| Q-P4 | ¿Se requiere factura fiscal (DTE/Chile u otro) además de cobros? | Billing vs invoicing |
| Q-P5 | ¿Plugins marketplace o monólito modular interno? | Extensibilidad |

## Legal

| ID | Pregunta | Por qué importa |
|----|----------|-----------------|
| Q-L1 | ¿Confirmamos clean-room (cero código GPL Elvis en nuestro repo)? | Obligación copyleft |
| Q-L2 | ¿Podemos citar Elvis como inspiración en docs internos? | Atribución / transparencia |

## Dominio

| ID | Pregunta | Por qué importa |
|----|----------|-----------------|
| Q-D1 | ¿Entidad `Household` obligatoria o basta grafo de links? | Modelo familia |
| Q-D2 | ¿Un pagador puede pagar a varios alumnos de distintos hogares? | Invariantes payer |
| Q-D3 | ¿Estados de matrícula: copiar semántica Elvis o simplificar? | UX staff |
| Q-D4 | ¿Re-matricula (PreApplication) en MVP? | Alcance |
| Q-D5 | ¿Membership/adhesion separada del course fee? | Pricing |

## Técnico (Elvis residual)

| ID | Pregunta | Estado |
|----|----------|--------|
| Q-E1 | ¿Dónde viven modelos OIDC en deploys reales (plugin)? | **informa. insuficiente** en este clone |
| Q-E2 | ¿Prod usa siempre `Rails_ENV=kubernetes` + Sidekiq? | Impacta fidelidad del análisis de eventos |
| Q-E3 | ¿Marketplace qué plugins de pago aporta (Stripe…)? | No en clone |
| Q-E4 | ¿`SwitchSeasonJob` se ejecuta por otro canal no visto? | Parece desconectado |
| Q-E5 | ¿EventRules se reactivará upstream? | Notifs |

## Gmusic / Track A

| ID | Pregunta | Por qué importa |
|----|----------|-----------------|
| Q-G1 | ¿Algún solape con admin creador (R-008) / alumnos `/alumno`? | No pisar zonas congeladas |
| Q-G2 | ¿Este análisis justifica algún D-GOV nuevo? | Gobernanza |
| Q-G3 | ¿Auth Fase 4 pausada afecta reuso de Identity futuro? | Timing |

## Operación del análisis

| ID | Pregunta |
|----|----------|
| Q-A1 | ¿Ejecutamos suite de tests Elvis para cuantificar cobertura? |
| Q-A2 | ¿Profundizar `docs/elvis-analysis/` (solo docs) o dejar local? |
| Q-A3 | ¿Actualizar canvas `elvis-architecture` con diagramas de `07`? |

---

## Resolución (plantilla)

```text
ID:
Decisión:
Fecha:
Quién:
Impacto en docs:
```
