# Deuda técnica (snapshot ETAPA 0 + post T-PUB-01)

| ID | Ítem | Severidad | Etapa para atacar |
|----|------|-----------|-------------------|
| DT-01 | AGENTS.md Academia/URLs desfasados | Media | Tras Etapa 0 (sync docs) |
| DT-02 | CLAUDE.md cifras/auth pausada obsoletas | Media | Lista en `04` §10 · sync cuando Juan autorice T-AUTH-DOCS-ALIGN |
| DT-03 | DO_NOT_TOUCH “no JWT” vs JWT real | Alta (gobernanza) | Decisión D-ROAD-002 |
| DT-04 | Legacy pages en App.tsx | Baja | 11 / cleanup |
| DT-05 | Comunidad peers/mentorship/curated mock | Media | 8 · mitiga header: Comunidad **bloqueada** (**D-F6-ANTI-DEMO** / T-MVP-COMMUNITY) |
| DT-06 | Prisma prod baseline R-OPS-01 | Alta | 3 / 12 |
| DT-07 | LessonRunner pedagógico incompleto | Media | 5–6 / T-UX-LESSON |
| DT-08 | Sin página Mi Progreso | Media | 7 |
| DT-09 | Tree dirty + vendor-sources análisis | Baja | higiene repo |
| DT-10 | skill auth-email-verification sin verify | Baja | renombrar/docs |
| **R-OPS-MIGRATE-UUID** | `prisma migrate deploy` fresh local: FK `user_id` UUID vs `User.id` TEXT (`onboarding_analytics`) | Media (ops local) | 3 / 12 · post **D-TPUB-01** · no bloquea T-PUB DONE LOCAL · workaround local `db push` · **sin fix repo** sin OK Juan |
| **T-PUB-01-UI** | Captura screenshot FE Vite `/mi-camino` del piloto | Baja / opcional | No bloquea cierre · API `GET /me/path` validada · backlog |
| DT-11 | `Module.focus` sin columna Prisma (focus API vacío) | Baja | Post-MVP editorial / schema con OK Juan — contrato en `06` § anti-demo |
| DT-12 | `PathNode.duration` editorial ausente (API envía vacío) | Baja | Post-MVP · anti-demo evita estimar minutos falsos |

